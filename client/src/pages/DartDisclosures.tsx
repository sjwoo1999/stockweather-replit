import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  ExternalLink, 
  FileText, 
  Calendar,
  Building,
  Filter,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DartDisclosure } from "@/types";

export default function DartDisclosures() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStock, setSelectedStock] = useState("");

  const { data: recentDisclosures, isLoading } = useQuery<DartDisclosure[]>({
    queryKey: ["/api/dart/recent", { limit: 50 }],
  });

  const { data: stockDisclosures } = useQuery<DartDisclosure[]>({
    queryKey: [`/api/dart/stock/${selectedStock}`, { limit: 20 }],
    enabled: !!selectedStock,
  });

  const getDisclosureTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'quarterly': 'bg-primary/10 text-primary border-primary',
      'annual': 'bg-secondary/10 text-secondary border-secondary',
      'material': 'bg-accent/10 text-accent border-accent',
      'fair_disclosure': 'bg-warning/10 text-warning border-warning',
    };
    return colorMap[type] || 'bg-muted/10 text-muted-foreground border-muted';
  };

  const getDisclosureTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
      'quarterly': '분기보고서',
      'annual': '사업보고서',
      'material': '주요사항보고서',
      'fair_disclosure': '공정공시',
      'other': '기타',
    };
    return nameMap[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const disclosureDate = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - disclosureDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '오늘';
    if (diffInDays === 1) return '어제';
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
    return `${Math.floor(diffInDays / 30)}개월 전`;
  };

  const filteredDisclosures = Array.isArray(recentDisclosures) ? recentDisclosures.filter((disclosure: DartDisclosure) => {
    const matchesSearch = !searchQuery || 
      disclosure.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disclosure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disclosure.stockCode.includes(searchQuery);
    
    const matchesType = selectedType === 'all' || disclosure.type === selectedType;
    
    return matchesSearch && matchesType;
  }) : [];

  const disclosureStats = {
    total: Array.isArray(recentDisclosures) ? recentDisclosures.length : 0,
    quarterly: Array.isArray(recentDisclosures) ? recentDisclosures.filter((d: DartDisclosure) => d.type === 'quarterly').length : 0,
    annual: Array.isArray(recentDisclosures) ? recentDisclosures.filter((d: DartDisclosure) => d.type === 'annual').length : 0,
    material: Array.isArray(recentDisclosures) ? recentDisclosures.filter((d: DartDisclosure) => d.type === 'material').length : 0,
    fair: Array.isArray(recentDisclosures) ? recentDisclosures.filter((d: DartDisclosure) => d.type === 'fair_disclosure').length : 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">DART 공시정보</h2>
        <p className="text-muted-foreground">금융감독원 전자공시시스템의 최신 공시정보를 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{disclosureStats.total}</p>
              <p className="text-sm text-muted-foreground">전체 공시</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{disclosureStats.quarterly}</p>
              <p className="text-sm text-muted-foreground">분기보고서</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{disclosureStats.annual}</p>
              <p className="text-sm text-muted-foreground">사업보고서</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{disclosureStats.material}</p>
              <p className="text-sm text-muted-foreground">주요사항</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{disclosureStats.fair}</p>
              <p className="text-sm text-muted-foreground">공정공시</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="회사명, 공시제목, 종목코드로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="공시 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="quarterly">분기보고서</SelectItem>
                <SelectItem value="annual">사업보고서</SelectItem>
                <SelectItem value="material">주요사항보고서</SelectItem>
                <SelectItem value="fair_disclosure">공정공시</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
            <Button variant="outline" className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="recent" className="space-y-4">
            <TabsList>
              <TabsTrigger value="recent">최신 공시</TabsTrigger>
              <TabsTrigger value="company">기업별 공시</TabsTrigger>
              <TabsTrigger value="important">중요 공시</TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>최신 공시 목록</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {filteredDisclosures.length}개 결과
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-24 bg-muted rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredDisclosures.map((disclosure: DartDisclosure, index: number) => (
                        <div 
                          key={disclosure.id || `disclosure-${index}-${disclosure.stockCode}-${disclosure.submittedDate}`} 
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getDisclosureTypeColor(disclosure.type))}
                                >
                                  {getDisclosureTypeName(disclosure.type)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {disclosure.stockCode}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {getTimeAgo(disclosure.submittedDate)}
                                </span>
                              </div>
                              
                              <h3 className="font-medium text-foreground mb-1 line-clamp-2">
                                {disclosure.title}
                              </h3>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Building className="w-4 h-4 mr-1" />
                                  {disclosure.companyName}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(disclosure.submittedDate)}
                                </div>
                              </div>
                              
                              {disclosure.summary && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {disclosure.summary}
                                </p>
                              )}
                            </div>
                            
                            <div className="ml-4 flex flex-col items-end gap-2">
                              {disclosure.url && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => window.open(disclosure.url, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  원문보기
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>기업별 공시 검색</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Input
                      placeholder="종목코드 입력 (예: 005930)"
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value)}
                    />
                  </div>
                  
                  {Array.isArray(stockDisclosures) && stockDisclosures.length > 0 && (
                    <div className="space-y-4">
                      {stockDisclosures.map((disclosure: DartDisclosure) => (
                        <div 
                          key={disclosure.id} 
                          className="p-4 border border-border rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getDisclosureTypeColor(disclosure.type))}
                                >
                                  {getDisclosureTypeName(disclosure.type)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(disclosure.submittedDate)}
                                </span>
                              </div>
                              <h3 className="font-medium text-foreground mb-1">
                                {disclosure.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {disclosure.companyName}
                              </p>
                            </div>
                            {disclosure.url && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(disclosure.url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="important">
              <Card>
                <CardHeader>
                  <CardTitle>중요 공시</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredDisclosures
                      .filter((d: DartDisclosure) => d.type === 'material' || d.type === 'fair_disclosure')
                      .slice(0, 10)
                      .map((disclosure: DartDisclosure) => (
                        <div 
                          key={disclosure.id} 
                          className="p-4 border border-border rounded-lg bg-accent/5"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", getDisclosureTypeColor(disclosure.type))}
                                >
                                  {getDisclosureTypeName(disclosure.type)}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {disclosure.stockCode}
                                </Badge>
                              </div>
                              <h3 className="font-medium text-foreground mb-1">
                                {disclosure.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {disclosure.companyName} · {formatDate(disclosure.submittedDate)}
                              </p>
                            </div>
                            {disclosure.url && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(disclosure.url, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                오늘의 공시
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">신규 공시</span>
                <span className="font-medium">
                  {Array.isArray(recentDisclosures) ? recentDisclosures.filter((d: DartDisclosure) => 
                    new Date(d.submittedDate).toDateString() === new Date().toDateString()
                  ).length : 0}건
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">중요 공시</span>
                <span className="font-medium text-accent">
                  {Array.isArray(recentDisclosures) ? recentDisclosures.filter((d: DartDisclosure) => 
                    d.type === 'material' && 
                    new Date(d.submittedDate).toDateString() === new Date().toDateString()
                  ).length : 0}건
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">공정공시</span>
                <span className="font-medium text-warning">
                  {Array.isArray(recentDisclosures) ? recentDisclosures.filter((d: DartDisclosure) => 
                    d.type === 'fair_disclosure' && 
                    new Date(d.submittedDate).toDateString() === new Date().toDateString()
                  ).length : 0}건
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Popular Companies */}
          <Card>
            <CardHeader>
              <CardTitle>활발한 공시 기업</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(new Set(Array.isArray(recentDisclosures) ? recentDisclosures.map((d: DartDisclosure) => d.companyName) : []))
                  .slice(0, 5)
                  .map((company, index) => {
                    const companyDisclosures = Array.isArray(recentDisclosures) ? recentDisclosures.filter((d: DartDisclosure) => d.companyName === company) : [];
                    return (
                      <div key={`company-${company}-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{company}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {companyDisclosures.length}건
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>공시 유형 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-primary/5 rounded-lg">
                <h4 className="text-sm font-medium text-primary mb-1">분기보고서</h4>
                <p className="text-xs text-muted-foreground">분기별 재무성과 및 사업현황</p>
              </div>
              <div className="p-3 bg-secondary/5 rounded-lg">
                <h4 className="text-sm font-medium text-secondary mb-1">사업보고서</h4>
                <p className="text-xs text-muted-foreground">연간 사업실적 및 계획</p>
              </div>
              <div className="p-3 bg-accent/5 rounded-lg">
                <h4 className="text-sm font-medium text-accent mb-1">주요사항보고서</h4>
                <p className="text-xs text-muted-foreground">경영상 중요한 의사결정</p>
              </div>
              <div className="p-3 bg-warning/5 rounded-lg">
                <h4 className="text-sm font-medium text-warning mb-1">공정공시</h4>
                <p className="text-xs text-muted-foreground">투자판단에 중요한 정보</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
