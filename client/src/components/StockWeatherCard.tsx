import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface StockWeatherCardProps {
  data: StockWeatherData;
  className?: string;
}

export default function StockWeatherCard({ data, className }: StockWeatherCardProps) {
  const getWeatherIcon = (condition: string) => {
    const iconMap = {
      'sunny': <Sun className="w-12 h-12 text-yellow-500" />,
      'cloudy': <Cloudy className="w-12 h-12 text-gray-500" />,
      'rainy': <CloudRain className="w-12 h-12 text-blue-500" />,
      'stormy': <Zap className="w-12 h-12 text-purple-500" />,
      'snowy': <CloudSnow className="w-12 h-12 text-blue-300" />,
      'windy': <Wind className="w-12 h-12 text-gray-400" />,
      'drizzle': <CloudDrizzle className="w-12 h-12 text-blue-400" />
    };
    return iconMap[condition as keyof typeof iconMap] || <Cloud className="w-12 h-12 text-gray-400" />;
  };

  const getWeatherDescription = (condition: string) => {
    const descriptions = {
      'sunny': '맑음 - 강한 상승 전망',
      'cloudy': '흐림 - 보합세 예상',
      'rainy': '비 - 하락 우려',
      'stormy': '폭풍 - 급격한 변동성',
      'snowy': '눈 - 장기 침체',
      'windy': '바람 - 불안정한 흐름',
      'drizzle': '이슬비 - 소폭 하락'
    };
    return descriptions[condition as keyof typeof descriptions] || '예측 불가';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'hold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'sell': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'buy': return '매수';
      case 'hold': return '보유';
      case 'sell': return '매도';
      default: return '관망';
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{data.stockCode}</h3>
            <p className="text-sm text-muted-foreground">{data.companyName}</p>
          </div>
          <Badge className={getRecommendationColor(data.recommendation)}>
            {getRecommendationText(data.recommendation)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Weather Icon and Condition */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {getWeatherIcon(data.weatherCondition)}
            <div>
              <p className="text-sm font-medium text-foreground">
                {getWeatherDescription(data.weatherCondition)}
              </p>
              <p className="text-xs text-muted-foreground">
                신뢰도: {data.confidence}%
              </p>
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              ₩{data.currentPrice.toLocaleString()}
            </p>
            <div className="flex items-center space-x-2">
              {data.priceChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                "text-sm font-medium",
                data.priceChange > 0 ? "text-green-600" : "text-red-600"
              )}>
                {data.priceChange > 0 ? '+' : ''}{data.priceChange.toLocaleString()}
                ({data.priceChangePercent > 0 ? '+' : ''}{data.priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-foreground">{data.forecast}</p>
        </div>

        {/* Confidence Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>예측 신뢰도</span>
            <span>{data.confidence}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${data.confidence}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}