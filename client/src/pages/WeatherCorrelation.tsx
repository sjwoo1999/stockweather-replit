import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Thermometer,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { cn } from "@/lib/utils";
import WeatherCorrelationCard from "@/components/WeatherCorrelationCard";

export default function WeatherCorrelation() {
  const { data: currentWeather } = useQuery({
    queryKey: ["/api/weather/current"],
  });

  const { data: correlations } = useQuery({
    queryKey: ["/api/weather/correlations"],
  });

  const getWeatherIcon = (factor: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'precipitation': <CloudRain className="w-6 h-6 text-primary" />,
      'temperature': <Thermometer className="w-6 h-6 text-accent" />,
      'wind_speed': <Wind className="w-6 h-6 text-secondary" />,
      'humidity': <Sun className="w-6 h-6 text-warning" />,
    };
    return iconMap[factor] || <Sun className="w-6 h-6 text-primary" />;
  };

  const getFactorName = (factor: string) => {
    const nameMap: Record<string, string> = {
      'precipitation': '강수량',
      'temperature': '기온',
      'wind_speed': '풍속',
      'humidity': '습도',
    };
    return nameMap[factor] || factor;
  };

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return '강함';
    if (abs >= 0.5) return '보통';
    if (abs >= 0.3) return '약함';
    return '매우 약함';
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return correlation > 0 ? 'text-green-600' : 'text-red-600';
    if (abs >= 0.5) return correlation > 0 ? 'text-primary' : 'text-yellow-600';
    return 'text-muted-foreground';
  };

  // Sample data for demonstration
  const weatherTrendData = [
    { date: '1월', temperature: -2, precipitation: 25, stocks: 12450000 },
    { date: '2월', temperature: 1, precipitation: 35, stocks: 12200000 },
    { date: '3월', temperature: 8, precipitation: 45, stocks: 12800000 },
    { date: '4월', temperature: 15, precipitation: 85, stocks: 13200000 },
    { date: '5월', temperature: 22, precipitation: 95, stocks: 13600000 },
    { date: '6월', temperature: 26, precipitation: 125, stocks: 14100000 },
    { date: '7월', temperature: 29, precipitation: 165, stocks: 13800000 },
    { date: '8월', temperature: 28, precipitation: 145, stocks: 14500000 },
    { date: '9월', temperature: 24, precipitation: 105, stocks: 14200000 },
    { date: '10월', temperature: 16, precipitation: 65, stocks: 13900000 },
    { date: '11월', temperature: 8, precipitation: 45, stocks: 13700000 },
    { date: '12월', temperature: 2, precipitation: 30, stocks: 14000000 },
  ];

  const scatterData = (correlations as any)?.map((corr: any, index: number) => ({
    x: Math.abs(corr.correlation) * 100,
    y: Math.random() * 100 + 50, // Sample performance data
    stockCode: corr.stockCode,
    factor: corr.weatherFactor,
    correlation: corr.correlation,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">날씨 상관관계 분석</h2>
        <p className="text-muted-foreground">날씨 조건과 주식 가격의 상관관계를 분석하고 투자 인사이트를 얻으세요</p>
      </div>

      {/* Current Weather Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">현재 기온</p>
                <p className="text-2xl font-bold text-foreground">{(currentWeather as any)?.temperature?.toFixed(0) || 22}°C</p>
                <p className="text-sm text-muted-foreground">{(currentWeather as any)?.city || '서울'}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Thermometer className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">강수량</p>
                <p className="text-2xl font-bold text-foreground">{(currentWeather as any)?.precipitation?.toFixed(1) || 0}mm</p>
                <p className="text-sm text-muted-foreground">시간당</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <CloudRain className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">풍속</p>
                <p className="text-2xl font-bold text-foreground">{(currentWeather as any)?.windSpeed?.toFixed(1) || 5.2}m/s</p>
                <p className="text-sm text-muted-foreground">평균</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-full">
                <Wind className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">습도</p>
                <p className="text-2xl font-bold text-foreground">{(currentWeather as any)?.humidity || 65}%</p>
                <p className="text-sm text-muted-foreground">상대습도</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-full">
                <Sun className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analysis Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trends">날씨 트렌드</TabsTrigger>
              <TabsTrigger value="scatter">상관관계 분석</TabsTrigger>
              <TabsTrigger value="sectors">섹터별 영향</TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>날씨와 시장 성과 트렌드</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weatherTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis 
                          dataKey="date" 
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          yAxisId="temp"
                          orientation="left"
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          yAxisId="stocks"
                          orientation="right"
                          className="text-muted-foreground"
                          tickFormatter={(value) => `₩${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip 
                          labelClassName="text-foreground"
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          yAxisId="temp"
                          type="monotone" 
                          dataKey="temperature" 
                          stroke="hsl(var(--accent))" 
                          strokeWidth={2}
                          name="기온 (°C)"
                        />
                        <Line 
                          yAxisId="stocks"
                          type="monotone" 
                          dataKey="stocks" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="포트폴리오 가치"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scatter">
              <Card>
                <CardHeader>
                  <CardTitle>상관관계 분산도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={scatterData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis 
                          dataKey="x" 
                          name="상관관계 강도"
                          className="text-muted-foreground"
                          label={{ value: '상관관계 강도 (%)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          dataKey="y" 
                          name="수익률"
                          className="text-muted-foreground"
                          label={{ value: '수익률 (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-medium">{data.stockCode}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {getFactorName(data.factor)}: {(data.correlation * 100).toFixed(1)}%
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    수익률: {data.y.toFixed(1)}%
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter dataKey="y" fill="hsl(var(--primary))" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sectors">
              <Card>
                <CardHeader>
                  <CardTitle>섹터별 날씨 영향도</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium text-foreground mb-4 flex items-center">
                          <CloudRain className="w-5 h-5 mr-2 text-primary" />
                          강수량 민감 섹터
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">우산/비옷 제조업</span>
                            <Badge className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">+76%</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">실내 엔터테인먼트</span>
                            <Badge className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">+32%</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">건설업</span>
                            <Badge className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">-18%</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium text-foreground mb-4 flex items-center">
                          <Thermometer className="w-5 h-5 mr-2 text-accent" />
                          기온 민감 섹터
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">에어컨/냉방기기</span>
                            <Badge className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">+61%</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">음료/아이스크림</span>
                            <Badge className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">+45%</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">난방용품</span>
                            <Badge className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">-28%</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium text-foreground mb-4 flex items-center">
                        <Wind className="w-5 h-5 mr-2 text-secondary" />
                        풍속 민감 섹터
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">풍력 발전</span>
                          <Badge className="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">+68%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">항공업</span>
                          <Badge className="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">-12%</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">해운업</span>
                          <Badge className="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400">-5%</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Weather Correlations */}
          <WeatherCorrelationCard correlations={(correlations as any) || []} />

          {/* Top Correlated Stocks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                상관관계 순위
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(correlations as any)?.slice(0, 5).map((correlation: any, index: number) => (
                  <div key={correlation.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{correlation.stockCode}</p>
                        <p className="text-xs text-muted-foreground">{getFactorName(correlation.weatherFactor)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-medium", getCorrelationColor(correlation.correlation))}>
                        {(Math.abs(correlation.correlation) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">{getCorrelationStrength(correlation.correlation)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weather Impact Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                영향도 요약
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">기온 영향</span>
                  <span className="text-sm text-muted-foreground">높음</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">강수량 영향</span>
                  <span className="text-sm text-muted-foreground">중간</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">풍속 영향</span>
                  <span className="text-sm text-muted-foreground">중간</span>
                </div>
                <Progress value={55} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">습도 영향</span>
                  <span className="text-sm text-muted-foreground">낮음</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
