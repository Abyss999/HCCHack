from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from models.user import User
from services.auth_service import AuthService, get_auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=True)


async def get_current_user(
    request: Request,
    token: str = Depends(oauth2_scheme),
    auth: AuthService = Depends(get_auth_service),
) -> User:
    user_id = auth.decode_token(token, expected_type="access")
    user = await User.get(user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    # Expose to rate limiter so authed traffic is keyed per-user, not per-IP.
    request.state.user_id = str(user.id)
    return user
