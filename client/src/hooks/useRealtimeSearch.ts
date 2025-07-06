import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

interface SearchResult {
  code: string;
  name: string;
  market: string;
  sector?: string;
  industry?: string;
  marketCap?: string;
}

interface Suggestion {
  code: string;
  name: string;
  displayText: string;
}

interface UseRealtimeSearchReturn {
  // 검색 상태
  searchResults: SearchResult[];
  suggestions: Suggestion[];
  isSearching: boolean;
  searchError: string | null;
  
  // 연결 상태
  isConnected: boolean;
  connectionError: string | null;
  
  // 검색 함수
  search: (query: string, limit?: number) => void;
  getSuggestions: (partial: string) => void;
  clearResults: () => void;
  
  // 연결 관리
  reconnect: () => void;
}

export function useRealtimeSearch(): UseRealtimeSearchReturn {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const currentQuery = useRef<string>('');
  
  const { isConnected, sendMessage, lastMessage, connectionError, reconnect } = useWebSocket('/ws');
  
  // WebSocket 메시지 처리
  useEffect(() => {
    if (!lastMessage) return;
    
    switch (lastMessage.type) {
      case 'searchResult':
        setSearchResults(lastMessage.results || []);
        setIsSearching(false);
        setSearchError(null);
        console.log(`🔍 검색 결과 수신: ${lastMessage.count}개`);
        break;
        
      case 'suggestions':
        setSuggestions(lastMessage.suggestions || []);
        break;
        
      case 'error':
        setSearchError(lastMessage.message || '검색 중 오류가 발생했습니다.');
        setIsSearching(false);
        console.error('❌ 검색 오류:', lastMessage.message);
        break;
        
      case 'connection':
        console.log('✅ 실시간 검색 서비스 연결됨');
        break;
    }
  }, [lastMessage]);
  
  // 디바운스된 검색 함수
  const search = useCallback((query: string, limit: number = 20) => {
    if (!isConnected) {
      setSearchError('검색 서비스에 연결되지 않았습니다.');
      return;
    }
    
    currentQuery.current = query;
    
    // 이전 검색 타이머 취소
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // 빈 검색어 처리
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    // 500ms 디바운스 적용
    searchTimeout.current = setTimeout(() => {
      if (currentQuery.current === query) {
        sendMessage({
          type: 'search',
          query: query.trim(),
          limit: limit
        });
        
        console.log(`🔍 실시간 검색 요청: "${query.trim()}"`);
      }
    }, 500);
  }, [isConnected, sendMessage]);
  
  // 추천 검색어 요청
  const getSuggestions = useCallback((partial: string) => {
    if (!isConnected || !partial || partial.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    
    sendMessage({
      type: 'suggest',
      partial: partial.trim()
    });
  }, [isConnected, sendMessage]);
  
  // 검색 결과 초기화
  const clearResults = useCallback(() => {
    setSearchResults([]);
    setSuggestions([]);
    setSearchError(null);
    setIsSearching(false);
    currentQuery.current = '';
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
  }, []);
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);
  
  return {
    // 검색 상태
    searchResults,
    suggestions,
    isSearching,
    searchError,
    
    // 연결 상태
    isConnected,
    connectionError,
    
    // 검색 함수
    search,
    getSuggestions,
    clearResults,
    
    // 연결 관리
    reconnect
  };
}