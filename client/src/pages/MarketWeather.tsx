import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp,
  Search,
  BarChart3,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import StockWeatherCard from "@/components/StockWeatherCard";
import MarketWeatherPanel from "@/components/MarketWeatherPanel";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface StockWeatherData {
  stockCode: string;
  companyName: string;
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
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  lastUpdated: Date;
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

export default function MarketWeather() {
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState<number>(20);
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

  // 데이터 새로고침
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchMarket();
  };

  // 검색 필터 적용
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
    
    return stocks;
  };

  const filteredStocks = getFilteredStocks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">시장 날씨</h1>
        <p className="text-muted-foreground">전체 시장 동향과 주요 종목의 투자 전망을 날씨로 직관적으로 확인하세요</p>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>시장 날씨</strong>는 95개 주요 종목의 DART 공시 데이터를 기반으로 AI가 분석한 투자 전망을 제공합니다.
          </p>
        </div>
      </div>

      {/* Market Weather Overview */}
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

      {/* 시장 인사이트 섹션 */}
      {marketData?.marketInsights && marketData.marketInsights.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              시장 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketData.marketInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 탭 구조로 정보 분리 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">시장 요약</TabsTrigger>
          <TabsTrigger value="stocks">주요 종목</TabsTrigger>
          <TabsTrigger value="sectors">섹터 분석</TabsTrigger>
        </TabsList>

        {/* 시장 요약 탭 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 시장 통계 카드들 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">분석 종목 수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {marketData?.topStocks?.length || 0}개
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  시가총액 기준 상위 종목
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">섹터 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {sectorData?.length || 0}개
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  주요 업종 분석 완료
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">마지막 업데이트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-foreground">
                  {marketData?.marketWeather?.lastUpdated 
                    ? new Date(marketData.marketWeather.lastUpdated).toLocaleString('ko-KR')
                    : '데이터 없음'
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  실시간 DART 데이터 기반
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 주요 종목 탭 */}
        <TabsContent value="stocks" className="space-y-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">주요 종목 날씨 예보</h3>
                <p className="text-sm text-muted-foreground">
                  시가총액 기준 상위 {Math.min(displayCount, marketData?.topStocks?.length || 0)}개 종목 (전체 {marketData?.topStocks?.length || 0}개 중)
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                DART 공시 기반 분석
              </Badge>
            </div>

            {/* 종목 표시 수 설정 */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium">표시 개수:</span>
              <Select value={displayCount.toString()} onValueChange={(value) => setDisplayCount(Number(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10개</SelectItem>
                  <SelectItem value="20">20개</SelectItem>
                  <SelectItem value="30">30개</SelectItem>
                  <SelectItem value="50">50개</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 검색 및 필터 */}
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

          {/* 종목 리스트 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.slice(0, displayCount).map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} />
            ))}
          </div>

          {/* 더 많은 종목 보기 */}
          {filteredStocks.length > displayCount && (
            <div className="text-center mt-6">
              <Button
                onClick={() => setDisplayCount(prev => Math.min(prev + 20, filteredStocks.length))}
                variant="outline"
                className="min-w-32"
              >
                더 보기 ({filteredStocks.length - displayCount}개 남음)
              </Button>
            </div>
          )}

          {/* 검색 결과 없음 */}
          {filteredStocks.length === 0 && searchTerm && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  "{searchTerm}"에 대한 결과를 찾을 수 없습니다.
                </p>
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  검색어 초기화
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 섹터 분석 탭 */}
        <TabsContent value="sectors" className="space-y-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">섹터별 날씨 동향</h3>
            <p className="text-sm text-muted-foreground">
              업종별 시장 동향과 주요 종목 분석
            </p>
          </div>

          {sectorLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>섹터 분석 중...</span>
                </div>
              </CardContent>
            </Card>
          ) : sectorData && sectorData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sectorData.map((sector) => (
                <Card key={sector.sector}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{sector.sector}</span>
                      <Badge variant={
                        sector.weatherCondition === 'sunny' ? 'default' :
                        sector.weatherCondition === 'cloudy' ? 'secondary' :
                        sector.weatherCondition === 'rainy' ? 'destructive' : 'outline'
                      }>
                        {sector.weatherCondition === 'sunny' ? '☀️ 맑음' :
                         sector.weatherCondition === 'cloudy' ? '☁️ 흐림' :
                         sector.weatherCondition === 'rainy' ? '🌧️ 비' : '⛈️ 폭풍'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">평균 변화율</span>
                        <span className={cn(
                          "text-sm font-medium",
                          sector.averageChange > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {sector.averageChange > 0 ? '+' : ''}{sector.averageChange.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">분석 종목 수</span>
                        <span className="text-sm font-medium">{sector.stockCount}개</span>
                      </div>
                      {sector.topPerformers && sector.topPerformers.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">상위 종목</p>
                          <p className="text-sm font-medium">{sector.topPerformers.slice(0, 3).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">섹터 분석 데이터가 없습니다.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}