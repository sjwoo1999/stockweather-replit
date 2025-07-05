export interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface StockHolding {
  id: string;
  portfolioId: string;
  stockCode: string;
  stockName: string;
  shares: number;
  averagePrice: number;
  currentPrice?: number;
  confidenceLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  id: string;
  city: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  timestamp: string;
}

export interface WeatherCorrelation {
  id: string;
  stockCode: string;
  weatherFactor: string;
  correlation: number;
  description?: string;
  updatedAt: string;
}

export interface DartDisclosure {
  id: string;
  stockCode: string;
  companyName: string;
  title: string;
  type: string;
  submittedDate: string;
  url?: string;
  summary?: string;
  createdAt: string;
}

export interface UserAlert {
  id: string;
  userId: string;
  stockCode?: string;
  alertType: string;
  condition: any;
  isActive: boolean;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioPerformance {
  id: string;
  portfolioId: string;
  totalValue: number;
  dayChange?: number;
  dayChangePercent?: number;
  timestamp: string;
}

export interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  subtitle?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}
