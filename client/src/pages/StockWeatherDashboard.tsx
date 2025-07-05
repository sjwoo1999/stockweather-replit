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
import MarketWeatherPanel from "@/components/MarketWeatherPanel";
import { cn } from "@/lib/utils";
import { layouts } from "@/lib/designSystem";

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
  trend: 'up' | 'down' | 'stable';
  confidence: number;
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
    pressure: 52, // Market pressure (0-100)
    trend: 'up',
    confidence: 78
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

      {/* Market Weather Overview - 전체 시장 날씨 */}
      <MarketWeatherPanel data={marketWeather} className="mb-12" />

      {/* Section Divider */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-4 px-6 py-3 bg-muted/50 rounded-full">
          <div className="w-12 h-px bg-border"></div>
          <h2 className="text-lg font-semibold text-foreground">🌤️ 개별 종목 날씨 예보</h2>
          <div className="w-12 h-px bg-border"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">관심 종목별 맞춤형 투자 전망을 확인하세요</p>
      </div>

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

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sunny" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.filter(stock => stock.weatherCondition === 'sunny').map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cloudy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.filter(stock => ['cloudy', 'windy'].includes(stock.weatherCondition)).map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rainy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.filter(stock => ['rainy', 'drizzle', 'snowy'].includes(stock.weatherCondition)).map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stormy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredStocks.filter(stock => stock.weatherCondition === 'stormy').map((stock) => (
              <StockWeatherCard key={stock.stockCode} data={stock} className="animate-in fade-in duration-500" />
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