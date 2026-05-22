import { useEffect, useRef, useCallback } from "react";
import {
  WSEvent,
  MemberJoinedPayload,
  SwipeProgressPayload,
  InstantMatchPayload,
  PhaseChangePayload,
  Top3ReadyPayload,
} from "@/types";

interface WSHandlers {
  onMemberJoined?: (payload: MemberJoinedPayload) => void;
  onSwipeProgress?: (payload: SwipeProgressPayload) => void;
  onInstantMatch?: (payload: InstantMatchPayload) => void;
  onPhaseChange?: (payload: PhaseChangePayload) => void;
  onTop3Ready?: (payload: Top3ReadyPayload) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

export const useWebSocket = (
  sessionId: string,
  token: string,
  handlers: WSHandlers
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current) return;

    try {
      const url = `${WS_BASE}/ws/sessions/${sessionId}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSEvent;
          switch (message.type) {
            case "member_joined":
              handlers.onMemberJoined?.(message.payload);
              break;
            case "swipe_progress":
              handlers.onSwipeProgress?.(message.payload);
              break;
            case "instant_match":
              handlers.onInstantMatch?.(message.payload);
              break;
            case "phase_change":
              handlers.onPhaseChange?.(message.payload);
              break;
            case "top3_ready":
              handlers.onTop3Ready?.(message.payload);
              break;
          }
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        handlers.onError?.(new Error("WebSocket error"));
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        wsRef.current = null;
        handlers.onClose?.();

        // Attempt reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      handlers.onError?.(error as Error);
    }
  }, [sessionId, token, handlers]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    disconnect,
  };
};
