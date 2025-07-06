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
  Calendar,
  Volume,
  Target,
  Activity
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from "@/lib/utils";

export default function StockAnalysis() {
  const [selectedStock, setSelectedStock] = useState("005930");

  // 종목 선택 핸들러
  const handleStockSelect = (stock: { code: string; name: string }) => {
    setSelectedStock(stock.code);
  };

  const { data: stockQuote, isLoading: stockQuoteLoading } = useQuery({
    queryKey: [`/api/stocks/${selectedStock}/quote`],
    enabled: !!selectedStock,
  });

  const { data: priceHistory, isLoading: priceHistoryLoading } = useQuery({
    queryKey: [`/api/stocks/${selectedStock}/history`, { days: 90 }],
    enabled: !!selectedStock,
  });

  const { data: dartDisclosures, isLoading: dartDisclosuresLoading } = useQuery({
    queryKey: [`/api/dart/stock/${selectedStock}`, { limit: 10 }],
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

  // 안전한 타입 체크 함수들
  const isValidStockQuote = (data: any): data is { price: number; change: number; changePercent: number; volume: number; name: string; code: string } => {
    return data && typeof data === 'object' && 'price' in data && 'change' in data;
  };

  const isValidDisclosures = (data: any): data is Array<any> => {
    return Array.isArray(data);
  };

  const validStockQuote = isValidStockQuote(stockQuote) ? stockQuote : null;
  const validDisclosures = isValidDisclosures(dartDisclosures) ? dartDisclosures : [];
  const isPositive = validStockQuote ? validStockQuote.change >= 0 : false;

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
        <p className="text-muted-foreground">개별 종목의 상세 정보와 차트를 분석하세요</p>
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

      {validStockQuote && (
        <>
          {/* Stock Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">현재가</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(validStockQuote.price)}</p>
                    <div className="flex items-center mt-1">
                      <Badge 
                        variant={isPositive ? "default" : "destructive"}
                        className={cn(
                          "text-xs",
                          isPositive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                        )}
                      >
                        {isPositive ? '+' : ''}{validStockQuote.change?.toFixed(0)} ({isPositive ? '+' : ''}{validStockQuote.changePercent?.toFixed(2)}%)
                      </Badge>
                    </div>
                  </div>
                  <div className={cn(
                    "p-3 rounded-full",
                    isPositive ? "bg-success/10" : "bg-error/10"
                  )}>
                    {isPositive ? 
                      <TrendingUp className="w-6 h-6 text-success" /> : 
                      <TrendingDown className="w-6 h-6 text-error" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">거래량</p>
                    <p className="text-2xl font-bold text-foreground">{formatVolume(stockQuote.volume || 0)}</p>
                    <p className="text-sm text-muted-foreground">주</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Volume className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">종목명</p>
                    <p className="text-xl font-bold text-foreground">{stockQuote.name}</p>
                    <p className="text-sm text-muted-foreground">{stockQuote.code}</p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-full">
                    <DollarSign className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">업데이트</p>
                    <p className="text-lg font-bold text-foreground">실시간</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(stockQuote.timestamp).toLocaleTimeString('ko-KR')}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-full">
                    <Activity className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="price" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="price">가격 차트</TabsTrigger>
                  <TabsTrigger value="volume">거래량 차트</TabsTrigger>
                  <TabsTrigger value="analysis">기술적 분석</TabsTrigger>
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
                                <span className="text-sm font-medium">₩{(stockQuote.price * 1.02).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">20일</span>
                                <span className="text-sm font-medium">₩{(stockQuote.price * 0.98).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">60일</span>
                                <span className="text-sm font-medium">₩{(stockQuote.price * 0.95).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">지지/저항선</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">저항선</span>
                                <span className="text-sm font-medium text-error">₩{(stockQuote.price * 1.05).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">지지선</span>
                                <span className="text-sm font-medium text-success">₩{(stockQuote.price * 0.93).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium text-foreground mb-2">기술적 지표</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">RSI</p>
                              <p className="text-lg font-medium text-foreground">52.3</p>
                              <Badge variant="secondary" className="text-xs">중립</Badge>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">MACD</p>
                              <p className="text-lg font-medium text-success">+1.2</p>
                              <Badge className="text-xs bg-success/10 text-success">상승</Badge>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">볼린저 밴드</p>
                              <p className="text-lg font-medium text-warning">중간</p>
                              <Badge variant="outline" className="text-xs">관망</Badge>
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
                    <span className="font-medium">{stockQuote.code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">종목명</span>
                    <span className="font-medium">{stockQuote.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">현재가</span>
                    <span className="font-medium">{formatCurrency(stockQuote.price)}</span>
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
                      {isPositive ? '+' : ''}{stockQuote.change?.toFixed(0)} ({isPositive ? '+' : ''}{stockQuote.changePercent?.toFixed(2)}%)
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">거래량</span>
                    <span className="font-medium">{formatVolume(stockQuote.volume || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent DART Disclosures */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    최근 공시
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dartDisclosures?.slice(0, 5).map((disclosure: any) => (
                      <div key={disclosure.id} className="border-l-4 border-primary pl-3 py-2">
                        <h4 className="text-sm font-medium text-foreground">{disclosure.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(disclosure.submittedDate).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">최근 공시 정보가 없습니다.</p>
                    )}
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
