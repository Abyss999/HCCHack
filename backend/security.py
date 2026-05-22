"""Security middleware, rate limiter, and startup checks.

Centralizes everything an auditor would want to see in one place: the
Limiter instance, the response-header middleware, the size-limit
middleware, and the production sanity checks.
"""
from __future__ import annotations

import logging
from typing import Awaitable, Callable

from fastapi import FastAPI, HTTPException, Request, Response, status
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from config import Settings

logger = logging.getLogger(__name__)

DEFAULT_PLACEHOLDER_SECRETS = {"change-me-in-env", "", "secret", "your-secret-key"}


def _key_func(request: Request) -> str:
    """Rate-limit key: authenticated user id when present, else remote IP."""
    user = getattr(request.state, "user_id", None)
    if user is not None:
        return f"user:{user}"
    return get_remote_address(request)


def build_limiter(settings: Settings) -> Limiter:
    return Limiter(
        key_func=_key_func,
        enabled=settings.rate_limit_enabled,
        default_limits=[settings.rate_limit_default],
        headers_enabled=True,
    )


# Module-level limiter used by route decorators. Bound to real settings inside
# install_security(); until then it's a passthrough no-op limiter so importing
# routers at module load time doesn't blow up.
from config import get_settings as _get_settings  # noqa: E402

limiter: Limiter = build_limiter(_get_settings())


async def _rate_limit_handler(request: Request, exc: RateLimitExceeded) -> Response:
    return Response(
        content='{"detail":"Rate limit exceeded"}',
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        media_type="application/json",
        headers={"Retry-After": "60"},
    )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds defense-in-depth response headers on every response."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        # Strict-Transport-Security only makes sense behind HTTPS; harmless otherwise.
        response.headers.setdefault(
            "Strict-Transport-Security",
            "max-age=63072000; includeSubDomains",
        )
        # Lock the API itself down — clients should hit it via XHR/fetch, not embed it.
        response.headers.setdefault("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
        return response


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Rejects requests larger than max_request_body_bytes."""

    def __init__(self, app, max_bytes: int) -> None:
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                if int(content_length) > self.max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Request body too large",
                    )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Content-Length",
                )
        return await call_next(request)


def perform_startup_checks(settings: Settings) -> None:
    if settings.environment == "production":
        if settings.jwt_secret in DEFAULT_PLACEHOLDER_SECRETS or len(settings.jwt_secret) < 32:
            raise RuntimeError(
                "JWT_SECRET must be a strong (>=32 char) random value in production",
            )
        if "*" in settings.cors_origins:
            raise RuntimeError("CORS_ORIGINS must be explicit (no wildcard) in production")
        if "*" in settings.allowed_hosts:
            logger.warning("ALLOWED_HOSTS is wildcard in production — consider locking it down")
    else:
        if settings.jwt_secret in DEFAULT_PLACEHOLDER_SECRETS:
            logger.warning(
                "JWT_SECRET is still the placeholder — fine for local dev, change before deploying",
            )


def install_security(app: FastAPI, settings: Settings) -> Limiter:
    """Wire all security middleware and the rate limiter onto the app.

    Returns the limiter so routers can attach per-route decorators.
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)
    app.add_middleware(SlowAPIMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestSizeLimitMiddleware, max_bytes=settings.max_request_body_bytes)
    return limiter
