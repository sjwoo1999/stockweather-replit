import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Car, Zap } from "lucide-react";
import { StockHolding } from "@/types";
import { cn } from "@/lib/utils";

interface PortfolioTableProps {
  holdings: StockHolding[];
  onAddStock: () => void;
  className?: string;
}

export default function PortfolioTable({ holdings, onAddStock, className }: PortfolioTableProps) {
  const formatCurrency = (value: number) => {
    return `₩${value.toLocaleString()}`;
  };

  const getStockIcon = (stockCode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      '005930': <Building2 className="w-5 h-5 text-primary" />,
      '005380': <Car className="w-5 h-5 text-accent" />,
      '373220': <Zap className="w-5 h-5 text-secondary" />,
    };
    return iconMap[stockCode] || <Building2 className="w-5 h-5 text-primary" />;
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 80) return 'confidence-high';
    if (level >= 60) return 'confidence-medium';
    return 'confidence-low';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">내 포트폴리오</CardTitle>
          <Button onClick={onAddStock} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            종목 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  종목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  현재가
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  등락률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  보유량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  평가금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  확신도
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {holdings.map((holding) => {
                const currentPrice = holding.currentPrice || holding.averagePrice;
                const totalValue = currentPrice * holding.shares;
                const change = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
                const isPositive = change >= 0;

                return (
                  <tr key={holding.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                          {getStockIcon(holding.stockCode)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">
                            {holding.stockName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {holding.stockCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {formatCurrency(currentPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={isPositive ? "default" : "destructive"}
                        className={cn(
                          "text-xs",
                          isPositive ? "stock-positive" : "stock-negative"
                        )}
                      >
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {holding.shares}주
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatCurrency(totalValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="confidence-bar mr-3">
                          <div 
                            className={cn(
                              "confidence-fill",
                              getConfidenceColor(holding.confidenceLevel)
                            )}
                            style={{ width: `${holding.confidenceLevel}%` }}
                          />
                        </div>
                        <span className="text-sm text-foreground">
                          {holding.confidenceLevel}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
