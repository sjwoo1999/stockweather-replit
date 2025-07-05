import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Cloud, FileText, Bell, Shield, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-foreground">StockWeather</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              로그인
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            주식 시장을
            <br />
            <span className="text-primary">날씨처럼 예보합니다</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            복잡한 주식 정보를 직관적인 날씨 예보 스타일로 단순화하여,
            개인 투자자가 시장 동향과 투자 신호를 한눈에 파악할 수 있도록 도와드립니다.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3"
          >
            무료로 시작하기
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              주요 기능
            </h3>
            <p className="text-lg text-muted-foreground">
              전문적인 분석 도구와 실시간 데이터로 더 나은 투자 결정을 내리세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">시장 날씨 대시보드</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  전체 시장을 날씨 지도처럼 한눈에 파악하고, 각 종목의 투자 전망을
                  직관적인 날씨 아이콘으로 빠르게 확인하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Cloud className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">주식 날씨 예보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  복잡한 주식 분석을 맑음, 흐림, 비 등의 날씨 아이콘으로 직관적으로 표현하여
                  투자 전망을 쉽게 파악할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">DART 공시정보</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  금융감독원 DART 시스템과 연동하여 실시간 공시정보를 받아보고
                  투자 종목의 중요 소식을 놓치지 마세요.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-warning" />
                </div>
                <CardTitle className="text-xl">스마트 알림</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  목표가 달성, 날씨 변화, 공시 발표 등 다양한 조건에 맞춰
                  개인화된 알림을 설정하고 받아보세요.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-destructive" />
                </div>
                <CardTitle className="text-xl">실시간 데이터</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  한국 주식 시장의 실시간 가격 데이터와 차트를 통해
                  빠른 시장 변화에 대응하세요.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">안전한 데이터</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  개인 정보와 투자 데이터를 안전하게 보호하며,
                  언제든지 데이터를 내보낼 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-primary-foreground mb-4">
            지금 바로 시작하세요
          </h3>
          <p className="text-xl text-primary-foreground/80 mb-8">
            더 스마트한 투자 결정을 위한 첫 걸음을 내딛어보세요
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-white hover:bg-gray-100 text-primary text-lg px-8 py-3"
          >
            무료 계정 만들기
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-8">
            <TrendingUp className="text-primary text-2xl mr-3" />
            <span className="text-xl font-bold">StockWeather</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 StockWeather. 모든 권리 보유.</p>
            <p className="mt-2">한국 주식 시장 특화 포트폴리오 관리 및 날씨 상관관계 분석 플랫폼</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
