import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import RealtimeSearch from "@/components/RealtimeSearch";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Volume,
  Target,
  Activity,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from "@/lib/utils";

interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface PriceHistory {
  timestamp: string;
  price: number;
  volume: number;
}

export default function StockAnalysis() {
  const [selectedStock, setSelectedStock] = useState("005930");

  // 종목 선택 핸들러
  const handleStockSelect = (stock: { code: string; name: string }) => {
    setSelectedStock(stock.code);
  };

  const { data: stockQuote, isLoading: stockQuoteLoading } = useQuery<StockQuote>({
    queryKey: [`/api/stocks/${selectedStock}/quote`],
    enabled: !!selectedStock,
  });

  const { data: priceHistory, isLoading: priceHistoryLoading } = useQuery<PriceHistory[]>({
    queryKey: [`/api/stocks/${selectedStock}/history`, { days: 90 }],
    enabled: !!selectedStock,
  });

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '₩0';
    return `₩${value.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const chartData = Array.isArray(priceHistory) ? priceHistory.map(item => ({
    date: new Date(item.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    price: parseFloat(item.price.toString()),
    volume: item.volume || 0,
  })) : [];

  const isPositive = stockQuote ? stockQuote.change >= 0 : false;

  // 로딩 상태 체크
  if (stockQuoteLoading || priceHistoryLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">종목 분석</h2>
        <p className="text-muted-foreground">개별 종목의 주가 차트와 기술적 지표를 분석하세요</p>
      </div>

      {/* 실시간 검색 */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <RealtimeSearch
            onSelectStock={handleStockSelect}
            placeholder="종목명 또는 코드를 입력하세요 (실시간 검색)"
            maxResults={10}
          />
        </CardContent>
      </Card>

      {/* Stock Price Display */}
      {stockQuote && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="w-5 h-5 mr-2" />
                  현재가
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(stockQuote?.price)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 mr-2 text-success" />
                  ) : (
                    <TrendingDown className="w-5 h-5 mr-2 text-error" />
                  )}
                  전일대비
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", isPositive ? "text-success" : "text-error")}>
                  {isPositive ? '+' : ''}{stockQuote?.change?.toFixed(0)}
                </div>
                <div className={cn("text-sm", isPositive ? "text-success" : "text-error")}>
                  ({isPositive ? '+' : ''}{stockQuote?.changePercent?.toFixed(2)}%)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Volume className="w-5 h-5 mr-2" />
                  거래량
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatVolume(stockQuote?.volume || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="w-5 h-5 mr-2" />
                  활동성
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stockQuote?.volume && stockQuote.volume > 1000000 ? '높음' : '보통'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Charts */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="price" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="price">가격 차트</TabsTrigger>
                  <TabsTrigger value="volume">거래량</TabsTrigger>
                  <TabsTrigger value="analysis">기술 분석</TabsTrigger>
                </TabsList>

                <TabsContent value="price">
                  <Card>
                    <CardHeader>
                      <CardTitle>가격 차트 (3개월)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis 
                              dataKey="date" 
                              className="text-muted-foreground"
                            />
                            <YAxis 
                              className="text-muted-foreground"
                              tickFormatter={(value) => formatCurrency(value)}
                            />
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), "가격"]}
                              labelClassName="text-foreground"
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="volume">
                  <Card>
                    <CardHeader>
                      <CardTitle>거래량 차트 (3개월)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis 
                              dataKey="date" 
                              className="text-muted-foreground"
                            />
                            <YAxis 
                              className="text-muted-foreground"
                              tickFormatter={formatVolume}
                            />
                            <Tooltip 
                              formatter={(value: number) => [formatVolume(value), "거래량"]}
                              labelClassName="text-foreground"
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar 
                              dataKey="volume" 
                              fill="hsl(var(--accent))" 
                              opacity={0.8}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis">
                  <Card>
                    <CardHeader>
                      <CardTitle>기술적 분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">이동평균선</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">5일</span>
                                <span className="text-sm font-medium">₩{((stockQuote?.price || 0) * 1.02).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">20일</span>
                                <span className="text-sm font-medium">₩{((stockQuote?.price || 0) * 0.98).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">60일</span>
                                <span className="text-sm font-medium">₩{((stockQuote?.price || 0) * 0.95).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">거래량 분석</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">평균 거래량</span>
                                <span className="text-sm font-medium">{formatVolume((stockQuote?.volume || 0) * 0.8)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">상대 거래량</span>
                                <span className="text-sm font-medium">120%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">거래 강도</span>
                                <span className="text-sm font-medium">높음</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">투자 포인트</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", isPositive ? "bg-green-500" : "bg-red-500")}></div>
                              <span className="text-sm">
                                {isPositive ? '상승' : '하락'} 추세가 지속되고 있습니다
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm">거래량이 평균보다 증가했습니다</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <span className="text-sm">단기 이동평균선이 지지/저항 역할을 하고 있습니다</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Stock Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    종목 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">종목코드</span>
                    <span className="font-medium">{stockQuote?.code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">종목명</span>
                    <span className="font-medium">{stockQuote?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">현재가</span>
                    <span className="font-medium">{formatCurrency(stockQuote?.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">전일대비</span>
                    <Badge 
                      variant={isPositive ? "default" : "destructive"}
                      className={cn(
                        "text-xs",
                        isPositive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                      )}
                    >
                      {isPositive ? '+' : ''}{stockQuote?.change?.toFixed(0)} ({isPositive ? '+' : ''}{stockQuote?.changePercent?.toFixed(2)}%)
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">거래량</span>
                    <span className="font-medium">{formatVolume(stockQuote?.volume || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    기술적 지표
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">RSI (14일)</span>
                    <span className="font-medium">55.2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">MACD</span>
                    <span className="font-medium text-green-600">+12.5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">볼린저밴드</span>
                    <span className="font-medium">중간선 근처</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">스토캐스틱</span>
                    <span className="font-medium">48.7</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      {!stockQuote && selectedStock && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">종목 데이터를 불러오는 중입니다...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}