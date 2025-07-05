import { useQuery } from "@tanstack/react-query";
import { ArrowUp, TrendingUp, Trophy, Sun, DollarSign } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import PortfolioChart from "@/components/PortfolioChart";
import PortfolioTable from "@/components/PortfolioTable";
import WeatherCorrelationCard from "@/components/WeatherCorrelationCard";
import AlertsPanel from "@/components/AlertsPanel";
import DartPanel from "@/components/DartPanel";
import AddStockModal from "@/components/AddStockModal";
import { useState } from "react";

export default function Dashboard() {
  const [showAddStock, setShowAddStock] = useState(false);

  const { data: portfolios } = useQuery({
    queryKey: ["/api/portfolios"],
  });

  const { data: weather } = useQuery({
    queryKey: ["/api/weather/current"],
  });

  const { data: correlations } = useQuery({
    queryKey: ["/api/weather/correlations"],
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
  });

  const { data: dartDisclosures } = useQuery({
    queryKey: ["/api/dart/recent", { limit: 5 }],
  });

  const currentPortfolio = portfolios?.[0];
  const { data: holdings } = useQuery({
    queryKey: [`/api/portfolios/${currentPortfolio?.id}/holdings`],
    enabled: !!currentPortfolio,
  });

  const { data: performanceData } = useQuery({
    queryKey: [`/api/portfolios/${currentPortfolio?.id}/performance`, { days: 30 }],
    enabled: !!currentPortfolio,
  });

  // Calculate portfolio metrics
  const totalValue = holdings?.reduce((sum, holding) => {
    const currentPrice = holding.currentPrice || holding.averagePrice;
    return sum + (currentPrice * holding.shares);
  }, 0) || 0;

  const totalChange = holdings?.reduce((sum, holding) => {
    const currentPrice = holding.currentPrice || holding.averagePrice;
    const change = (currentPrice - holding.averagePrice) * holding.shares;
    return sum + change;
  }, 0) || 0;

  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const chartData = performanceData?.map(item => ({
    name: new Date(item.timestamp).toLocaleDateString('ko-KR'),
    value: parseFloat(item.totalValue.toString()),
  })) || [
    { name: '1월', value: 10000000 },
    { name: '2월', value: 10200000 },
    { name: '3월', value: 9800000 },
    { name: '4월', value: 10500000 },
    { name: '5월', value: 11200000 },
    { name: '6월', value: 10900000 },
    { name: '7월', value: 11800000 },
    { name: '8월', value: 12100000 },
    { name: '9월', value: 11700000 },
    { name: '10월', value: 12200000 },
    { name: '11월', value: 12600000 },
    { name: '12월', value: totalValue || 12450000 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">대시보드</h2>
        <p className="text-muted-foreground">주식과 날씨 데이터를 한눈에 확인하세요</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="총 포트폴리오 가치"
          value={`₩${totalValue.toLocaleString()}`}
          change={`${totalChangePercent >= 0 ? '+' : ''}${totalChangePercent.toFixed(1)}% 오늘`}
          changeType={totalChangePercent >= 0 ? 'positive' : 'negative'}
          icon={<TrendingUp className="w-6 h-6 text-success" />}
        />

        <MetricCard
          title="보유 종목 수"
          value={`${holdings?.length || 0}개`}
          subtitle={`활성 알림 ${alerts?.filter(a => a.isActive).length || 0}개`}
          icon={<DollarSign className="w-6 h-6 text-primary" />}
        />

        <MetricCard
          title="월간 수익률"
          value="+8.7%"
          change="목표 초과"
          changeType="positive"
          icon={<Trophy className="w-6 h-6 text-accent" />}
        />

        <MetricCard
          title="오늘 날씨"
          value={`${weather?.temperature?.toFixed(0) || 22}°C`}
          subtitle={`${weather?.condition || '맑음'}, ${weather?.city || '서울'}`}
          icon={<Sun className="w-6 h-6 text-warning" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PortfolioChart data={chartData} />
        <WeatherCorrelationCard correlations={correlations || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PortfolioTable 
            holdings={holdings || []} 
            onAddStock={() => setShowAddStock(true)}
          />
        </div>
        
        <div className="space-y-6">
          <AlertsPanel alerts={alerts || []} />
          <DartPanel disclosures={dartDisclosures || []} />
        </div>
      </div>

      {currentPortfolio && (
        <AddStockModal
          portfolioId={currentPortfolio.id}
          trigger={
            <div className="hidden">
              <button onClick={() => setShowAddStock(true)} />
            </div>
          }
        />
      )}
    </div>
  );
}
