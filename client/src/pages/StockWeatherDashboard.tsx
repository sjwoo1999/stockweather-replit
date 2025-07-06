import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  Zap, 
  Wind,
  CloudDrizzle,
  Cloudy,
  TrendingUp,
  TrendingDown,
  Search,
  MapPin,
  Calendar,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Filter
} from "lucide-react";
import StockWeatherCard from "@/components/StockWeatherCard";
import MarketWeatherPanel from "@/components/MarketWeatherPanel";
import { cn } from "@/lib/utils";
import { layouts } from "@/lib/designSystem";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface StockWeatherData {
  stockCode: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy' | 'drizzle';
  forecast: string;
  confidence: number;
  recommendation: 'buy' | 'hold' | 'sell';
  marketCap?: string;
  sector?: string;
  lastUpdated: string;
}

interface MarketWeatherData {
  overall: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number; // Market sentiment score
  humidity: number; // Volatility
  windSpeed: number; // Trading volume
  pressure: number; // Market pressure
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  lastUpdated: string;
}

interface SectorWeatherData {
  sector: string;
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  averageChange: number;
  stockCount: number;
  topPerformers: string[];
  bottomPerformers: string[];
}

interface MarketAnalysisResult {
  marketWeather: MarketWeatherData;
  topStocks: StockWeatherData[];
  sectorAnalysis: SectorWeatherData[];
  marketInsights: string[];
}

export default function StockWeatherDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // API 데이터 가져오기
  const { data: marketData, isLoading: marketLoading, error: marketError, refetch: refetchMarket } = useQuery<MarketAnalysisResult>({
    queryKey: ['/api/market/weather', refreshKey],
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    retry: 2,
  });

  // 섹터 분석 데이터
  const { data: sectorData, isLoading: sectorLoading } = useQuery<SectorWeatherData[]>({
    queryKey: ['/api/market/sectors', refreshKey],
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // 필터링된 종목 검색
  const { data: filteredStocksData } = useQuery({
    queryKey: ['/api/market/stocks/filter', { market: selectedMarket, sector: selectedSector }],
    enabled: selectedMarket !== 'all' || selectedSector !== 'all',
    staleTime: 10 * 60 * 1000, // 10분간 캐시
  });

  // 데이터 새로고침
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchMarket();
  };

  // 검색 및 필터 적용
  const getFilteredStocks = () => {
    if (!marketData?.topStocks) return [];
    
    let stocks = marketData.topStocks;
    
    // 검색어 필터
    if (searchTerm) {
      stocks = stocks.filter(stock => 
        stock.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.stockCode.includes(searchTerm)
      );
    }
    
    // 시장 필터
    if (selectedMarket !== 'all') {
      stocks = stocks.filter(stock => 
        stock.sector?.includes(selectedMarket) // 간단한 필터링
      );
    }
    
    // 섹터 필터
    if (selectedSector !== 'all') {
      stocks = stocks.filter(stock => 
        stock.sector?.includes(selectedSector)
      );
    }
    
    return stocks;
  };

  const filteredStocks = getFilteredStocks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">주식 날씨 예보</h1>
        <p className="text-muted-foreground">주식 시장을 날씨처럼 직관적으로 파악하세요</p>
      </div>

      {/* Market Weather Overview - 전체 시장 날씨 */}
      {marketLoading ? (
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>시장 날씨 분석 중...</span>
            </div>
          </CardContent>
        </Card>
      ) : marketError ? (
        <Card className="mb-12 border-destructive">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">데이터 로딩 실패</h3>
            <p className="text-muted-foreground mb-4">시장 데이터를 불러올 수 없습니다.</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
          </CardContent>
        </Card>
      ) : marketData?.marketWeather ? (
        <MarketWeatherPanel data={marketData.marketWeather} className="mb-12" />
      ) : null}

      {/* Section Divider */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-muted/50 rounded-full">
          <div className="w-12 h-px bg-border"></div>
          <h2 className="text-lg font-semibold text-foreground">🌤️ 개별 종목 날씨 예보</h2>
          <div className="w-12 h-px bg-border"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">관심 종목별 맞춤형 투자 전망을 확인하세요</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="종목명 또는 종목코드로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={handleRefresh} 
              variant="outline"
              disabled={marketLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={cn("w-4 h-4", marketLoading && "animate-spin")} />
              <span>새로고침</span>
            </Button>
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">필터:</span>
          </div>
          
          <Select value={selectedMarket} onValueChange={setSelectedMarket}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 시장</SelectItem>
              <SelectItem value="KOSPI">KOSPI</SelectItem>
              <SelectItem value="KOSDAQ">KOSDAQ</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 업종</SelectItem>
              <SelectItem value="전기전자">전기전자</SelectItem>
              <SelectItem value="의료정밀">의료정밀</SelectItem>
              <SelectItem value="서비스업">서비스업</SelectItem>
              <SelectItem value="화학">화학</SelectItem>
              <SelectItem value="금융업">금융업</SelectItem>
              <SelectItem value="운수장비">운수장비</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Data Info */}
        {marketData && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>총 {filteredStocks.length}개 종목</span>
              <span>•</span>
              <span>마지막 업데이트: {new Date(marketData.marketWeather.lastUpdated).toLocaleTimeString('ko-KR')}</span>
            </div>
            {marketData.marketInsights.length > 0 && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <BarChart3 className="w-3 h-3" />
                <span>{marketData.marketInsights.length}개 인사이트</span>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Stock Weather Cards */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="sunny">맑음</TabsTrigger>
          <TabsTrigger value="cloudy">흐림</TabsTrigger>
          <TabsTrigger value="rainy">비/눈</TabsTrigger>
          <TabsTrigger value="stormy">폭풍</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {marketLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStocks.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">검색 결과가 없습니다</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? `"${searchTerm}"에 대한 결과를 찾을 수 없습니다.` : '조건에 맞는 종목이 없습니다.'}
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedMarket('all');
                    setSelectedSector('all');
                  }}
                  variant="outline"
                >
                  필터 초기화
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredStocks.map((stock) => (
                <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sunny" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.filter(stock => stock.weatherCondition === 'sunny').map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cloudy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.filter(stock => ['cloudy', 'windy'].includes(stock.weatherCondition)).map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rainy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.filter(stock => ['rainy', 'drizzle', 'snowy'].includes(stock.weatherCondition)).map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stormy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.filter(stock => stock.weatherCondition === 'stormy').map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Market Insights Section */}
      {marketData?.marketInsights && marketData.marketInsights.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-muted/50 rounded-full">
              <div className="w-12 h-px bg-border"></div>
              <h2 className="text-lg font-semibold text-foreground">💡 오늘의 시장 인사이트</h2>
              <div className="w-12 h-px bg-border"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.marketInsights.map((insight, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sector Analysis Section */}
      {sectorData && sectorData.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-muted/50 rounded-full">
              <div className="w-12 h-px bg-border"></div>
              <h2 className="text-lg font-semibold text-foreground">📊 업종별 시장 현황</h2>
              <div className="w-12 h-px bg-border"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectorData.slice(0, 6).map((sector) => (
              <Card key={sector.sector} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">{sector.sector}</h3>
                  <div className="flex items-center space-x-2">
                    {sector.weatherCondition === 'sunny' && <Sun className="w-4 h-4 text-yellow-500" />}
                    {sector.weatherCondition === 'cloudy' && <Cloud className="w-4 h-4 text-gray-500" />}
                    {sector.weatherCondition === 'rainy' && <CloudRain className="w-4 h-4 text-blue-500" />}
                    {sector.weatherCondition === 'stormy' && <Zap className="w-4 h-4 text-red-500" />}
                    <span className={cn(
                      "text-sm font-medium",
                      sector.averageChange > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {sector.averageChange > 0 ? '+' : ''}{sector.averageChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {sector.stockCount}개 종목
                </div>
                {sector.topPerformers.length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className="text-green-600">상승: </span>
                    <span className="text-muted-foreground">
                      {sector.topPerformers.slice(0, 2).join(', ')}
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
      <Card className="mt-8 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">시장 주의보</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                오늘 오후 미국 연준 금리 발표가 예정되어 있어 변동성이 클 수 있습니다. 
                신중한 투자 결정을 권장합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}