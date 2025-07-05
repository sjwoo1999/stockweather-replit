import { Card, CardContent } from "@/components/ui/card";
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
  TrendingDown,
  Thermometer,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStockWeatherTheme, getSignalTheme, getConfidenceColor } from "@/lib/designSystem";

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
  const weatherTheme = getStockWeatherTheme(data.weatherCondition);
  const signalTheme = getSignalTheme(data.recommendation);
  const confidenceColor = getConfidenceColor(data.confidence);

  const getWeatherIcon = (condition: string, size: string = "w-16 h-16") => {
    const iconStyle = `${size} drop-shadow-lg`;
    const iconMap = {
      'sunny': <Sun className={`${iconStyle} text-orange-400`} />,
      'cloudy': <Cloudy className={`${iconStyle} text-gray-500`} />,
      'rainy': <CloudRain className={`${iconStyle} text-blue-500`} />,
      'stormy': <Zap className={`${iconStyle} text-purple-500`} />,
      'snowy': <CloudSnow className={`${iconStyle} text-blue-300`} />,
      'windy': <Wind className={`${iconStyle} text-teal-500`} />,
      'drizzle': <CloudDrizzle className={`${iconStyle} text-blue-400`} />
    };
    return iconMap[condition as keyof typeof iconMap] || <Cloud className={`${iconStyle} text-gray-400`} />;
  };

  const getWeatherLabel = (condition: string) => {
    const labels = {
      'sunny': '맑음',
      'cloudy': '흐림',
      'rainy': '비',
      'stormy': '폭풍',
      'snowy': '눈',
      'windy': '바람',
      'drizzle': '이슬비'
    };
    return labels[condition as keyof typeof labels] || '예측불가';
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'buy': return <ArrowUpRight className="w-5 h-5" />;
      case 'sell': return <ArrowDownRight className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'buy': return '매수';
      case 'sell': return '매도';
      default: return '보유';
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl group border-0",
        className
      )}
      style={{
        background: weatherTheme.cardBg,
        boxShadow: `0 10px 25px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)`
      }}
    >
      {/* 배경 패턴 */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, ${weatherTheme.primary} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${weatherTheme.secondary} 0%, transparent 50%)`
        }}
      />
      
      {/* 상단 헤더 */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1" style={{ color: weatherTheme.textPrimary }}>
              {data.stockCode}
            </h3>
            <p className="text-sm opacity-80" style={{ color: weatherTheme.textSecondary }}>
              {data.companyName}
            </p>
          </div>
          
          {/* 추천 배지 */}
          <Badge 
            className="flex items-center gap-1 px-3 py-1 text-white font-semibold shadow-lg"
            style={{ 
              background: signalTheme.background,
              boxShadow: signalTheme.glow
            }}
          >
            {getRecommendationIcon(data.recommendation)}
            {getRecommendationText(data.recommendation)}
          </Badge>
        </div>

        {/* 가격 정보 */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold" style={{ color: weatherTheme.textPrimary }}>
              ₩{data.currentPrice.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              {data.priceChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                "text-sm font-semibold",
                data.priceChange > 0 ? "text-green-600" : "text-red-600"
              )}>
                {data.priceChange > 0 ? '+' : ''}{data.priceChange.toLocaleString()}
                ({data.priceChangePercent > 0 ? '+' : ''}{data.priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 중앙 날씨 섹션 */}
      <div className="relative px-6 py-4">
        <div 
          className="rounded-2xl p-6 backdrop-blur-sm border border-white/20"
          style={{
            background: `linear-gradient(135deg, ${weatherTheme.primary}15, ${weatherTheme.secondary}15)`
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            {getWeatherIcon(data.weatherCondition)}
            <div className="flex-1">
              <h4 className="text-2xl font-bold mb-1" style={{ color: weatherTheme.textPrimary }}>
                {getWeatherLabel(data.weatherCondition)}
              </h4>
              <p className="text-sm opacity-80" style={{ color: weatherTheme.textSecondary }}>
                투자 전망
              </p>
            </div>
            
            {/* 신뢰도 게이지 */}
            <div className="text-center">
              <div className="relative inline-block">
                <Gauge 
                  className="w-12 h-12 mb-1" 
                  style={{ color: confidenceColor }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold" style={{ color: confidenceColor }}>
                    {data.confidence}
                  </span>
                </div>
              </div>
              <p className="text-xs opacity-80" style={{ color: weatherTheme.textSecondary }}>
                신뢰도
              </p>
            </div>
          </div>

          {/* 예보 텍스트 */}
          <div 
            className="p-4 rounded-lg text-sm leading-relaxed"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: weatherTheme.textPrimary
            }}
          >
            {data.forecast}
          </div>
        </div>
      </div>

      {/* 하단 신뢰도 바 */}
      <div className="relative px-6 pb-6">
        <div className="flex justify-between items-center text-xs mb-2" style={{ color: weatherTheme.textSecondary }}>
          <span>예측 정확도</span>
          <span className="font-semibold">{data.confidence}%</span>
        </div>
        <div className="relative h-2 bg-white/30 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${data.confidence}%`,
              background: `linear-gradient(90deg, ${confidenceColor}, ${confidenceColor}aa)`
            }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 animate-pulse"
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>

      {/* 호버 효과 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}