import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudRain, Sun, Wind, Info } from "lucide-react";
import { WeatherCorrelation } from "@/types";

interface WeatherCorrelationCardProps {
  correlations: WeatherCorrelation[];
  className?: string;
}

export default function WeatherCorrelationCard({ correlations, className }: WeatherCorrelationCardProps) {
  const getWeatherIcon = (factor: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'precipitation': <CloudRain className="w-5 h-5 text-primary" />,
      'temperature': <Sun className="w-5 h-5 text-accent" />,
      'wind_speed': <Wind className="w-5 h-5 text-secondary" />,
    };
    return iconMap[factor] || <Sun className="w-5 h-5 text-primary" />;
  };

  const getFactorName = (factor: string) => {
    const nameMap: Record<string, string> = {
      'precipitation': '강수량',
      'temperature': '기온',
      'wind_speed': '풍속',
    };
    return nameMap[factor] || factor;
  };

  const getCorrelationText = (correlation: number) => {
    if (correlation > 0.7) return '강한 양의 상관관계';
    if (correlation > 0.3) return '보통 양의 상관관계';
    if (correlation > -0.3) return '약한 상관관계';
    if (correlation > -0.7) return '보통 음의 상관관계';
    return '강한 음의 상관관계';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">날씨-주식 상관관계</CardTitle>
          <Button variant="ghost" size="sm">
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {correlations.map((correlation) => {
            const isPositive = correlation.correlation > 0;
            const changePercent = Math.abs(correlation.correlation * 100);
            
            return (
              <div key={correlation.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center">
                  <div className="mr-3">
                    {getWeatherIcon(correlation.weatherFactor)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {getFactorName(correlation.weatherFactor)} 관련주
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {correlation.description || getCorrelationText(correlation.correlation)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
                    {isPositive ? '+' : ''}{changePercent.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    상관도 {Math.abs(correlation.correlation).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
