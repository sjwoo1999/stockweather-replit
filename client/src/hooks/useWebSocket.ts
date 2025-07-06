import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  connectionError: string | null;
  reconnect: () => void;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      // 기존 연결 정리
      if (ws.current) {
        ws.current.close();
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('🔌 WebSocket 연결 성공');
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
          
          if (message.type === 'connection') {
            console.log('✅ 서버 연결 확인:', message.message);
          }
        } catch (error) {
          console.error('❌ WebSocket 메시지 파싱 오류:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket 연결 종료');
        setIsConnected(false);
        
        // 3초 후 자동 재연결
        reconnectTimeout.current = setTimeout(() => {
          console.log('🔄 WebSocket 자동 재연결 시도...');
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket 오류:', error);
        setConnectionError('WebSocket 연결 중 오류가 발생했습니다.');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ WebSocket 연결 실패:', error);
      setConnectionError('WebSocket 연결을 생성할 수 없습니다.');
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket이 연결되지 않았습니다. 메시지를 전송할 수 없습니다.');
    }
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connectionError,
    reconnect
  };
}