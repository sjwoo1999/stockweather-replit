import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  BarChart3,
  FolderPlus,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import AddStockModal from "@/components/AddStockModal";
import PortfolioChart from "@/components/PortfolioChart";
import { StockHolding, Portfolio as PortfolioType } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPortfolioSchema } from "@shared/schema";

const createPortfolioSchema = insertPortfolioSchema.extend({
  name: z.string().min(1, "포트폴리오 이름을 입력하세요"),
  description: z.string().optional(),
});

type CreatePortfolioForm = z.infer<typeof createPortfolioSchema>;

export default function Portfolio() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const [createPortfolioOpen, setCreatePortfolioOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPortfolioForm = useForm<CreatePortfolioForm>({
    resolver: zodResolver(createPortfolioSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

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

  const createPortfolioMutation = useMutation({
    mutationFn: async (data: CreatePortfolioForm) => {
      const response = await apiRequest("POST", `/api/portfolios`, data);
      return response.json();
    },
    onSuccess: (newPortfolio) => {
      toast({
        title: "포트폴리오 생성 완료",
        description: `"${newPortfolio.name}" 포트폴리오가 생성되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios"] });
      setSelectedPortfolio(newPortfolio.id);
      setCreatePortfolioOpen(false);
      createPortfolioForm.reset();
    },
    onError: (error) => {
      toast({
        title: "포트폴리오 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSampleDataMutation = useMutation({
    mutationFn: async (portfolioId: string) => {
      const response = await apiRequest("POST", `/api/portfolios/${portfolioId}/sample-data`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "샘플 데이터 추가 완료",
        description: `${data.count}개의 샘플 종목이 포트폴리오에 추가되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/portfolios/${currentPortfolio?.id}/holdings`] });
    },
    onError: (error) => {
      toast({
        title: "샘플 데이터 추가 실패",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const onCreatePortfolio = (data: CreatePortfolioForm) => {
    createPortfolioMutation.mutate(data);
  };

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

  // 포트폴리오가 없는 경우 빈 상태 화면
  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <PieChart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">포트폴리오가 없습니다</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            첫 번째 포트폴리오를 생성하여 주식 투자를 관리해보세요. 
            종목 추가, 성과 분석, 투자 전략 수립까지 모든 기능을 이용할 수 있습니다.
          </p>
          
          <Dialog open={createPortfolioOpen} onOpenChange={setCreatePortfolioOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <FolderPlus className="w-5 h-5 mr-2" />
                첫 번째 포트폴리오 만들기
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>새 포트폴리오 만들기</DialogTitle>
              </DialogHeader>
              <form onSubmit={createPortfolioForm.handleSubmit(onCreatePortfolio)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">포트폴리오 이름</Label>
                  <Input
                    id="name"
                    {...createPortfolioForm.register("name")}
                    placeholder="예: 성장주 투자"
                  />
                  {createPortfolioForm.formState.errors.name && (
                    <p className="text-sm text-error">{createPortfolioForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">설명 (선택사항)</Label>
                  <Input
                    id="description"
                    {...createPortfolioForm.register("description")}
                    placeholder="예: 장기 성장 가능성이 높은 기술주 중심"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setCreatePortfolioOpen(false)}>
                    취소
                  </Button>
                  <Button type="submit" disabled={createPortfolioMutation.isPending}>
                    {createPortfolioMutation.isPending ? "생성 중..." : "생성"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">종목 추가</h3>
                <p className="text-sm text-muted-foreground">95개 한국 주요 종목 중에서 선택하여 포트폴리오를 구성하세요.</p>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">성과 분석</h3>
                <p className="text-sm text-muted-foreground">실시간 차트와 수익률 분석으로 투자 성과를 추적하세요.</p>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">투자 알림</h3>
                <p className="text-sm text-muted-foreground">목표 수익률과 손실 한계를 설정하고 알림을 받으세요.</p>
              </div>
            </Card>
          </div>
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
          <div className="flex items-center space-x-3">
            <Dialog open={createPortfolioOpen} onOpenChange={setCreatePortfolioOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="w-4 h-4 mr-2" />
                  새 포트폴리오
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>새 포트폴리오 만들기</DialogTitle>
                </DialogHeader>
                <form onSubmit={createPortfolioForm.handleSubmit(onCreatePortfolio)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">포트폴리오 이름</Label>
                    <Input
                      id="name"
                      {...createPortfolioForm.register("name")}
                      placeholder="예: 성장주 투자"
                    />
                    {createPortfolioForm.formState.errors.name && (
                      <p className="text-sm text-error">{createPortfolioForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">설명 (선택사항)</Label>
                    <Input
                      id="description"
                      {...createPortfolioForm.register("description")}
                      placeholder="예: 장기 성장 가능성이 높은 기술주 중심"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreatePortfolioOpen(false)}>
                      취소
                    </Button>
                    <Button type="submit" disabled={createPortfolioMutation.isPending}>
                      {createPortfolioMutation.isPending ? "생성 중..." : "생성"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            {currentPortfolio && (
              <AddStockModal portfolioId={currentPortfolio.id} />
            )}
          </div>
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
                  ) : holdings?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">보유 종목이 없습니다</h3>
                      <p className="text-muted-foreground mb-6">
                        첫 번째 종목을 추가하여 포트폴리오를 시작해보세요.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <AddStockModal portfolioId={currentPortfolio.id} />
                        <Button 
                          variant="outline" 
                          onClick={() => addSampleDataMutation.mutate(currentPortfolio.id)}
                          disabled={addSampleDataMutation.isPending}
                        >
                          <RefreshCw className={cn("w-4 h-4 mr-2", addSampleDataMutation.isPending && "animate-spin")} />
                          {addSampleDataMutation.isPending ? "추가 중..." : "샘플 데이터 추가"}
                        </Button>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          💡 <strong>샘플 데이터</strong>에는 삼성전자, SK하이닉스, LG에너지솔루션 등 5개 주요 종목이 포함됩니다.
                        </p>
                      </div>
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
