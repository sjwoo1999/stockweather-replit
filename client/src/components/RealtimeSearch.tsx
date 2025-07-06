import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRealtimeSearch } from '@/hooks/useRealtimeSearch';
import { cn } from '@/lib/utils';

interface SearchResult {
  code: string;
  name: string;
  market: string;
  sector?: string;
  industry?: string;
  marketCap?: string;
}

interface RealtimeSearchProps {
  onSelectStock?: (stock: SearchResult) => void;
  placeholder?: string;
  className?: string;
  showConnectionStatus?: boolean;
  maxResults?: number;
}

export default function RealtimeSearch({
  onSelectStock,
  placeholder = "종목명 또는 코드를 입력하세요",
  className,
  showConnectionStatus = true,
  maxResults = 10
}: RealtimeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const {
    searchResults,
    isSearching,
    searchError,
    isConnected,
    connectionError,
    search,
    clearResults,
    reconnect
  } = useRealtimeSearch();

  // 검색 실행
  useEffect(() => {
    if (searchQuery.trim()) {
      search(searchQuery, maxResults);
      setIsOpen(true);
    } else {
      clearResults();
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [searchQuery, search, clearResults, maxResults]);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectStock(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // 종목 선택 처리
  const handleSelectStock = (stock: SearchResult) => {
    setSearchQuery(stock.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelectStock?.(stock);
  };

  // 검색어 변경 처리
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // 연결 상태 표시
  const ConnectionStatus = () => {
    if (!showConnectionStatus) return null;

    return (
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3 text-green-500" />
            <span>실시간 검색 연결됨</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-red-500" />
            <span>연결 끊김</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={reconnect}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-10"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* 연결 상태 */}
      {showConnectionStatus && (
        <div className="mt-1">
          <ConnectionStatus />
        </div>
      )}

      {/* 오류 메시지 */}
      {(searchError || connectionError) && (
        <Alert className="mt-2" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {searchError || connectionError}
          </AlertDescription>
        </Alert>
      )}

      {/* 검색 결과 */}
      {isOpen && searchResults.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 border border-border shadow-lg">
          <CardContent className="p-0">
            <div
              ref={resultsRef}
              className="max-h-80 overflow-y-auto"
            >
              {searchResults.map((stock, index) => (
                <div
                  key={stock.code}
                  className={cn(
                    "p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0",
                    selectedIndex === index && "bg-muted"
                  )}
                  onClick={() => handleSelectStock(stock)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {stock.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stock.code}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge variant="secondary" className="text-xs">
                        {stock.market}
                      </Badge>
                      {stock.sector && (
                        <Badge variant="outline" className="text-xs">
                          {stock.sector}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {stock.marketCap && (
                    <div className="text-xs text-muted-foreground mt-1">
                      시가총액: {stock.marketCap}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 검색 결과 없음 */}
      {isOpen && searchResults.length === 0 && searchQuery.trim() && !isSearching && (
        <Card className="absolute z-50 w-full mt-1 border border-border shadow-lg">
          <CardContent className="p-4 text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>'{searchQuery}'에 대한 검색 결과가 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}