import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Edit3, 
  Trash2, 
  Building2,
  Car,
  Zap,
  PieChart,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import AddStockModal from "@/components/AddStockModal";
import PortfolioChart from "@/components/PortfolioChart";
import { StockHolding, Portfolio as PortfolioType } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Portfolio() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: portfolios, isLoading: portfoliosLoading } = useQuery({
    queryKey: ["/api/portfolios"],
  });

  const currentPortfolio = portfolios?.find((p: PortfolioType) => p.id === selectedPortfolio) || portfolios?.[0];

  const { data: holdings, isLoading: holdingsLoading } = useQuery({
    queryKey: [`/api/portfolios/${currentPortfolio?.id}/holdings`],
    enabled: !!currentPortfolio,
  });

  const { data: performanceData } = useQuery({
    queryKey: [`/api/portfolios/${currentPortfolio?.id}/performance`, { days: 90 }],
    enabled: !!currentPortfolio,
  });

  const deleteHoldingMutation = useMutation({
    mutationFn: async (holdingId: string) => {
      await apiRequest("DELETE", `/api/holdings/${holdingId}`);
    },
    onSuccess: () => {
      toast({
        title: "종목 삭제 완료",
        description: "포트폴리오에서 종목이 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${currentPortfolio?.id}/holdings`] });
    },
    onError: (error) => {
      toast({
        title: "종목 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Portfolio metrics calculations
  const totalValue = holdings?.reduce((sum: number, holding: StockHolding) => {
    const currentPrice = holding.currentPrice || holding.averagePrice;
    return sum + (currentPrice * holding.shares);
  }, 0) || 0;

  const totalCost = holdings?.reduce((sum: number, holding: StockHolding) => {
    return sum + (holding.averagePrice * holding.shares);
  }, 0) || 0;

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  const getStockIcon = (stockCode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '005930': <Building2 className="w-5 h-5 text-primary" />,
      '005380': <Car className="w-5 h-5 text-accent" />,
      '373220': <Zap className="w-5 h-5 text-secondary" />,
    };
    return iconMap[stockCode] || <Building2 className="w-5 h-5 text-primary" />;
  };

  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 80) return 'bg-success';
    if (level >= 60) return 'bg-warning';
    return 'bg-error';
  };

  const chartData = performanceData?.map(item => ({
    name: new Date(item.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    value: parseFloat(item.totalValue.toString()),
  })) || [];

  if (portfoliosLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">내 포트폴리오</h2>
            <p className="text-muted-foreground">보유 종목을 관리하고 성과를 분석하세요</p>
          </div>
          {currentPortfolio && (
            <AddStockModal portfolioId={currentPortfolio.id} />
          )}
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">총 평가금액</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">총 손익</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalGainLoss >= 0 ? "text-success" : "text-error"
                )}>
                  {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
                </p>
                <p className={cn(
                  "text-sm font-medium",
                  totalGainLoss >= 0 ? "text-success" : "text-error"
                )}>
                  {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                totalGainLoss >= 0 ? "bg-success/10" : "bg-error/10"
              )}>
                {totalGainLoss >= 0 ? 
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
                <p className="text-muted-foreground text-sm font-medium">보유 종목</p>
                <p className="text-2xl font-bold text-foreground">{holdings?.length || 0}개</p>
                <p className="text-sm text-muted-foreground">매입금액 {formatCurrency(totalCost)}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <PieChart className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Portfolio Performance Chart */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chart">성과 차트</TabsTrigger>
              <TabsTrigger value="holdings">보유 종목</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <PortfolioChart 
                data={chartData} 
                title="포트폴리오 성과 (3개월)"
              />
            </TabsContent>

            <TabsContent value="holdings">
              <Card>
                <CardHeader>
                  <CardTitle>보유 종목 목록</CardTitle>
                </CardHeader>
                <CardContent>
                  {holdingsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-muted rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {holdings?.map((holding: StockHolding) => {
                        const currentPrice = holding.currentPrice || holding.averagePrice;
                        const totalValue = currentPrice * holding.shares;
                        const gainLoss = (currentPrice - holding.averagePrice) * holding.shares;
                        const gainLossPercent = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
                        
                        return (
                          <div key={holding.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0 h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                                {getStockIcon(holding.stockCode)}
                              </div>
                              <div>
                                <h3 className="font-medium text-foreground">{holding.stockName}</h3>
                                <p className="text-sm text-muted-foreground">{holding.stockCode}</p>
                                <p className="text-sm text-muted-foreground">
                                  {holding.shares}주 · 평균 {formatCurrency(holding.averagePrice)}
                                </p>
                              </div>
                            </div>

                            <div className="text-right space-y-1">
                              <p className="font-medium text-foreground">{formatCurrency(totalValue)}</p>
                              <Badge 
                                variant={gainLoss >= 0 ? "default" : "destructive"}
                                className={cn(
                                  "text-xs",
                                  gainLoss >= 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"
                                )}
                              >
                                {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)} ({gainLoss >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%)
                              </Badge>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-muted rounded-full h-2">
                                  <div 
                                    className={cn("h-2 rounded-full", getConfidenceColor(holding.confidenceLevel))}
                                    style={{ width: `${holding.confidenceLevel}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{holding.confidenceLevel}%</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteHoldingMutation.mutate(holding.id)}
                                disabled={deleteHoldingMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-error" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Portfolio Allocation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                자산 배분
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings?.map((holding: StockHolding) => {
                  const currentPrice = holding.currentPrice || holding.averagePrice;
                  const holdingValue = currentPrice * holding.shares;
                  const percentage = totalValue > 0 ? (holdingValue / totalValue) * 100 : 0;
                  
                  return (
                    <div key={holding.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">{holding.stockName}</span>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>포트폴리오 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">포트폴리오명</span>
                <span className="font-medium">{currentPortfolio?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">생성일</span>
                <span className="font-medium">
                  {currentPortfolio?.createdAt ? new Date(currentPortfolio.createdAt).toLocaleDateString('ko-KR') : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">최근 업데이트</span>
                <span className="font-medium">
                  {currentPortfolio?.updatedAt ? new Date(currentPortfolio.updatedAt).toLocaleDateString('ko-KR') : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
