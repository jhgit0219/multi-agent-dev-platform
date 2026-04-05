import { useEffect, useRef, useState, useCallback } from "react";

export interface WsEvent {
  type: string;
  team?: string;
  message?: string;
  timestamp: string;
  [key: string]: unknown;
}

export function useWebSocket(url = "ws://localhost:3001/ws") {
  const [events, setEvents] = useState<WsEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, 3000);
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data as string) as WsEvent;
        setEvents((prev) => [...prev.slice(-499), data]);
      } catch {
        // ignore non-JSON messages
      }
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const clear = useCallback(() => setEvents([]), []);

  return { events, connected, clear };
}
