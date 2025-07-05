import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  TrendingUp, 
  Activity, 
  BarChart3, 
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Sun,
  Cloud,
  CloudRain,
  Zap
} from "lucide-react";
import { designSystem, getMarketWeatherTheme } from "@/lib/designSystem";

interface MarketWeatherData {
  overall: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

interface MarketWeatherPanelProps {
  data: MarketWeatherData;
  className?: string;
}

export default function MarketWeatherPanel({ data, className }: MarketWeatherPanelProps) {
  const theme = getMarketWeatherTheme();

  const getMarketIcon = (condition: string) => {
    const iconClass = "w-16 h-16 text-white drop-shadow-lg";
    switch (condition) {
      case 'sunny': return <Sun className={iconClass} />;
      case 'cloudy': return <Cloud className={iconClass} />;
      case 'rainy': return <CloudRain className={iconClass} />;
      case 'stormy': return <Zap className={iconClass} />;
      default: return <Cloud className={iconClass} />;
    }
  };

  const getMarketDescription = (condition: string) => {
    switch (condition) {
      case 'sunny': return '강세 시장';
      case 'cloudy': return '보합 시장';
      case 'rainy': return '약세 시장';
      case 'stormy': return '급변 시장';
      default: return '예측 불가';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'down': return <TrendingUp className="w-5 h-5 text-red-400 rotate-180" />;
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const getMetricIcon = (type: string) => {
    const iconClass = "w-6 h-6 text-white/80";
    switch (type) {
      case 'temperature': return <Thermometer className={iconClass} />;
      case 'humidity': return <Droplets className={iconClass} />;
      case 'wind': return <Wind className={iconClass} />;
      case 'pressure': return <Gauge className={iconClass} />;
      default: return <BarChart3 className={iconClass} />;
    }
  };

  return (
    <Card 
      className={`border-0 overflow-hidden shadow-2xl ${className}`}
      style={{
        background: theme.cardBg,
        boxShadow: theme.shadow
      }}
    >
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/5" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 translate-y-12" />
      </div>

      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white text-xl">
            <MapPin className="w-6 h-6 mr-3" />
            🌤️ 전체 시장 날씨 현황
          </CardTitle>
          <Badge 
            className="px-3 py-1 text-white font-medium"
            style={{ 
              background: theme.badgeStyle.background,
              border: theme.badgeStyle.border
            }}
          >
            {getTrendIcon(data.trend)}
            <span className="ml-1">
              {data.trend === 'up' ? '상승' : data.trend === 'down' ? '하락' : '보합'}
            </span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 메인 날씨 표시 */}
          <div className="lg:col-span-4 flex flex-col items-center text-center">
            <div className="mb-6 p-6 bg-white/20 rounded-full backdrop-blur-sm">
              {getMarketIcon(data.overall)}
            </div>
            <h3 className="text-4xl font-bold text-white mb-2">
              {getMarketDescription(data.overall)}
            </h3>
            <p className="text-white/80 text-lg mb-4">오늘의 코스피 전망</p>
            
            {/* 신뢰도 표시 */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
              <Gauge className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                예측 신뢰도: {data.confidence}%
              </span>
            </div>
          </div>

          {/* 시장 지표 그리드 */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-4">
            {/* 시장 온도 */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getMetricIcon('temperature')}
                  <span className="text-white/80 text-sm font-medium">시장 온도</span>
                </div>
                <span className="text-3xl font-bold text-white">{data.temperature}°</span>
              </div>
              <p className="text-white/60 text-xs mb-3">투자 심리 지수</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(data.temperature, 100)}%` }}
                />
              </div>
            </div>

            {/* 변동성 */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getMetricIcon('humidity')}
                  <span className="text-white/80 text-sm font-medium">변동성</span>
                </div>
                <span className="text-3xl font-bold text-white">{data.humidity}%</span>
              </div>
              <p className="text-white/60 text-xs mb-3">시장 불확실성</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${data.humidity}%` }}
                />
              </div>
            </div>

            {/* 거래 활성도 */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getMetricIcon('wind')}
                  <span className="text-white/80 text-sm font-medium">거래 활성도</span>
                </div>
                <span className="text-3xl font-bold text-white">{data.windSpeed}</span>
              </div>
              <p className="text-white/60 text-xs mb-3">거래량 지수</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(data.windSpeed, 100)}%` }}
                />
              </div>
            </div>

            {/* 시장 압력 */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getMetricIcon('pressure')}
                  <span className="text-white/80 text-sm font-medium">시장 압력</span>
                </div>
                <span className="text-3xl font-bold text-white">{data.pressure}</span>
              </div>
              <p className="text-white/60 text-xs mb-3">매도/매수 압력</p>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(data.pressure, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 요약 정보 */}
        <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>📊 전체 시장은 현재 <strong className="text-white">{getMarketDescription(data.overall)}</strong> 상태입니다</span>
            <span>🎯 개별 종목 전망은 아래 카드를 확인하세요</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}