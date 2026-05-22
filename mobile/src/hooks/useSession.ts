import { useState, useCallback, useRef } from "react";
import { Session, Restaurant, SessionResult, AuthTokens } from "@/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export const useSession = (tokens: AuthTokens | null) => {
  const [session, setSession] = useState<Session | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!tokens) throw new Error("Not authenticated");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.access_token}`,
        ...options.headers,
      };

      const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return response.json();
    },
    [tokens]
  );

  const createSession = useCallback(
    async (lat: number, lng: number) => {
      try {
        setLoading(true);
        const data = await apiCall("/sessions", {
          method: "POST",
          body: JSON.stringify({ location_lat: lat, location_lng: lng }),
        });
        setSession(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create session";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const joinSession = useCallback(
    async (code: string) => {
      try {
        setLoading(true);
        // First get session by code
        const sessionData = await apiCall(`/sessions/${code}`);
        // Then join it
        const joined = await apiCall(`/sessions/${sessionData.id}/join`, {
          method: "POST",
        });
        setSession(joined);
        return joined;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to join session";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const getSession = useCallback(
    async (sessionId: string) => {
      try {
        setLoading(true);
        const data = await apiCall(`/sessions/${sessionId}/status`);
        setSession(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch session";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const startSwiping = useCallback(
    async (sessionId: string) => {
      try {
        setLoading(true);
        const data = await apiCall(`/sessions/${sessionId}/start`, {
          method: "POST",
        });
        setSession(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start swiping";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const getRestaurants = useCallback(
    async (sessionId: string) => {
      try {
        setLoading(true);
        const data = await apiCall(`/restaurants?session_id=${sessionId}`);
        setRestaurants(data);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch restaurants";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const submitSwipe = useCallback(
    async (sessionId: string, restaurantId: string, direction: "yes" | "no") => {
      try {
        await apiCall(`/sessions/${sessionId}/swipe`, {
          method: "POST",
          body: JSON.stringify({ restaurant_id: restaurantId, direction }),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit swipe";
        setError(message);
        throw err;
      }
    },
    [apiCall]
  );

  const getResults = useCallback(
    async (sessionId: string) => {
      try {
        setLoading(true);
        const data = await apiCall(`/sessions/${sessionId}/results`);
        // Backend returns { top: TopResult[] }; unwrap to the flat list.
        const top: SessionResult[] = Array.isArray(data) ? data : data?.top ?? [];
        setResults(top);
        return top;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch results";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  return {
    session,
    restaurants,
    results,
    loading,
    error,
    createSession,
    joinSession,
    getSession,
    startSwiping,
    getRestaurants,
    submitSwipe,
    getResults,
  };
};
