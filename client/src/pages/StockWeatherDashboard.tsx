import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  Search,
  MapPin,
  Calendar,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import StockWeatherCard from "@/components/StockWeatherCard";
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

interface MarketWeatherData {
  overall: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number; // Market sentiment score
  humidity: number; // Volatility
  windSpeed: number; // Trading volume
  pressure: number; // Market pressure
}

export default function StockWeatherDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");

  // Sample data - in real app, this would come from API
  const marketWeather: MarketWeatherData = {
    overall: 'cloudy',
    temperature: 65, // Market sentiment (0-100)
    humidity: 45, // Volatility (0-100)
    windSpeed: 78, // Trading volume (0-100)
    pressure: 52 // Market pressure (0-100)
  };

  const stockWeatherData: StockWeatherData[] = [
    {
      stockCode: "005930",
      companyName: "삼성전자",
      currentPrice: 72500,
      priceChange: 1200,
      priceChangePercent: 1.68,
      weatherCondition: "sunny",
      forecast: "반도체 수요 증가와 실적 개선으로 상승 전망이 밝습니다. 단기적으로 강한 매수세가 예상됩니다.",
      confidence: 85,
      recommendation: "buy"
    },
    {
      stockCode: "000660",
      companyName: "SK하이닉스",
      currentPrice: 129000,
      priceChange: -2500,
      priceChangePercent: -1.90,
      weatherCondition: "rainy",
      forecast: "메모리 반도체 가격 하락과 실적 부진으로 단기 조정이 예상됩니다.",
      confidence: 72,
      recommendation: "hold"
    },
    {
      stockCode: "035420",
      companyName: "NAVER",
      currentPrice: 198500,
      priceChange: 3500,
      priceChangePercent: 1.79,
      weatherCondition: "cloudy",
      forecast: "AI 투자 확대와 클라우드 사업 성장으로 중장기 전망은 긍정적이나, 단기 변동성이 있을 것으로 예상됩니다.",
      confidence: 68,
      recommendation: "hold"
    },
    {
      stockCode: "005380",
      companyName: "현대차",
      currentPrice: 245000,
      priceChange: -1500,
      priceChangePercent: -0.61,
      weatherCondition: "drizzle",
      forecast: "전기차 시장 경쟁 심화와 중국 시장 불확실성으로 소폭 하락 압력이 있습니다.",
      confidence: 61,
      recommendation: "hold"
    },
    {
      stockCode: "373220",
      companyName: "LG에너지솔루션",
      currentPrice: 412000,
      priceChange: 8000,
      priceChangePercent: 1.98,
      weatherCondition: "windy",
      forecast: "배터리 수요 증가 기대감과 실적 개선으로 변동성이 큰 상승세를 보일 것으로 예상됩니다.",
      confidence: 74,
      recommendation: "buy"
    },
    {
      stockCode: "207940",
      companyName: "삼성바이오로직스",
      currentPrice: 789000,
      priceChange: -15000,
      priceChangePercent: -1.87,
      weatherCondition: "stormy",
      forecast: "바이오 업계 전반적인 조정과 실적 불확실성으로 급격한 변동성이 예상됩니다.",
      confidence: 58,
      recommendation: "sell"
    }
  ];

  const getMarketWeatherIcon = (condition: string) => {
    const iconMap = {
      'sunny': <Sun className="w-16 h-16 text-yellow-500" />,
      'cloudy': <Cloudy className="w-16 h-16 text-gray-500" />,
      'rainy': <CloudRain className="w-16 h-16 text-blue-500" />,
      'stormy': <Zap className="w-16 h-16 text-purple-500" />
    };
    return iconMap[condition as keyof typeof iconMap] || <Cloud className="w-16 h-16 text-gray-400" />;
  };

  const getMarketDescription = (condition: string) => {
    const descriptions = {
      'sunny': '맑음 - 강세장 지속',
      'cloudy': '흐림 - 혼조 양상',
      'rainy': '비 - 약세 전망',
      'stormy': '폭풍 - 고변동성 장세'
    };
    return descriptions[condition as keyof typeof descriptions] || '예측 불가';
  };

  const filteredStocks = stockWeatherData.filter(stock => 
    stock.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.stockCode.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">주식 날씨 예보</h1>
        <p className="text-muted-foreground">주식 시장을 날씨처럼 직관적으로 파악하세요</p>
      </div>

      {/* Market Weather Overview */}
      <Card 
        className="mb-8 border-0 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-white">
            <MapPin className="w-6 h-6 mr-3" />
            📊 코스피 시장 날씨 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Weather Display */}
            <div className="lg:col-span-1 flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-white/20 rounded-full backdrop-blur-sm">
                {getMarketWeatherIcon(marketWeather.overall)}
              </div>
              <h3 className="text-3xl font-bold mb-2">
                {getMarketDescription(marketWeather.overall)}
              </h3>
              <p className="text-white/80 text-lg">오늘의 시장 전망</p>
              <div className="mt-4 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                <span className="text-sm font-medium">신뢰도: 78%</span>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">{marketWeather.temperature}°</div>
                <div className="text-lg font-medium mb-1">시장 온도</div>
                <div className="text-sm text-white/70">투자 심리 지수</div>
                <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${marketWeather.temperature}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">{marketWeather.humidity}%</div>
                <div className="text-lg font-medium mb-1">변동성</div>
                <div className="text-sm text-white/70">시장 불확실성</div>
                <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${marketWeather.humidity}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">{marketWeather.windSpeed}</div>
                <div className="text-lg font-medium mb-1">거래 활성도</div>
                <div className="text-sm text-white/70">거래량 지수</div>
                <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${marketWeather.windSpeed}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold mb-2">{marketWeather.pressure}</div>
                <div className="text-lg font-medium mb-1">시장 압력</div>
                <div className="text-sm text-white/70">매도/매수 압력</div>
                <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${marketWeather.pressure}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="종목명 또는 종목코드로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-border bg-background rounded-md px-3 py-2 text-sm"
          >
            <option value="today">오늘</option>
            <option value="week">1주일</option>
            <option value="month">1개월</option>
            <option value="quarter">3개월</option>
          </select>
        </div>
      </div>

      {/* Stock Weather Cards */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="sunny">맑음</TabsTrigger>
          <TabsTrigger value="cloudy">흐림</TabsTrigger>
          <TabsTrigger value="rainy">비/눈</TabsTrigger>
          <TabsTrigger value="stormy">폭풍</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sunny" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.filter(stock => stock.weatherCondition === 'sunny').map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cloudy" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.filter(stock => ['cloudy', 'windy'].includes(stock.weatherCondition)).map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rainy" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.filter(stock => ['rainy', 'drizzle', 'snowy'].includes(stock.weatherCondition)).map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stormy" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.filter(stock => stock.weatherCondition === 'stormy').map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Weather Alert */}
      <Card className="mt-8 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">시장 주의보</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                오늘 오후 미국 연준 금리 발표가 예정되어 있어 변동성이 클 수 있습니다. 
                신중한 투자 결정을 권장합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}