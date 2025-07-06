import { storage } from "../storage";
import { dartApi } from "./dartApi";
import type { StockMaster, DartDisclosure } from "@shared/schema";

export interface MarketWeatherData {
  overall: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  temperature: number; // Market sentiment score (0-100)
  humidity: number; // Volatility (0-100)
  windSpeed: number; // Trading volume (0-100)
  pressure: number; // Market pressure (0-100)
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  lastUpdated: Date;
}

export interface StockWeatherData {
  stockCode: string;
  companyName: string;
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy' | 'drizzle';
  forecast: string;
  confidence: number;
  recommendation: 'buy' | 'hold' | 'sell';
  marketCap?: string;
  sector?: string;
  lastUpdated: Date;
}

export interface MarketAnalysisResult {
  marketWeather: MarketWeatherData;
  topStocks: StockWeatherData[];
  sectorAnalysis: SectorWeatherData[];
  marketInsights: string[];
}

export interface SectorWeatherData {
  sector: string;
  weatherCondition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  averageChange: number;
  stockCount: number;
  topPerformers: string[];
  bottomPerformers: string[];
}

export class MarketWeatherService {
  
  /**
   * 전체 시장 날씨 분석 데이터 생성
   */
  async generateMarketWeather(): Promise<MarketAnalysisResult> {
    console.log('🌤️ Generating market weather analysis...');
    
    try {
      // 1. 전체 상장 종목 데이터 수집 (95개 모두)
      const allStocks = await this.getTopStocksByMarketCap(95);
      
      // 2. 최신 공시 정보 수집 (확대)
      const recentDisclosures = await dartApi.getRecentDisclosures(100);
      
      // 3. 전체 종목별 날씨 데이터 생성
      const stockWeatherData = await this.generateStockWeatherData(allStocks, recentDisclosures);
      
      // 4. 전체 시장 날씨 계산
      const marketWeather = this.calculateMarketWeather(stockWeatherData);
      
      // 5. 섹터별 분석
      const sectorAnalysis = this.calculateSectorWeather(stockWeatherData);
      
      // 6. 시장 인사이트 생성
      const marketInsights = this.generateMarketInsights(marketWeather, sectorAnalysis, recentDisclosures);
      
      console.log('✅ Market weather analysis completed');
      
      return {
        marketWeather,
        topStocks: stockWeatherData, // 전체 95개 종목 반환
        sectorAnalysis,
        marketInsights
      };
      
    } catch (error) {
      console.error('💥 Failed to generate market weather:', error);
      
      // 실패시 기본 데이터 반환
      return this.getDefaultMarketWeather();
    }
  }
  
  /**
   * 전체 상장 종목 조회 (시가총액 기준 정렬)
   */
  private async getTopStocksByMarketCap(limit: number): Promise<StockMaster[]> {
    const allStocks = await storage.getAllStocks();
    
    console.log(`📊 총 ${allStocks.length}개 종목 데이터 로드됨`);
    
    // 시가총액 기준 정렬하여 상위 종목 반환
    const sortedStocks = allStocks
      .filter(stock => stock.stockName && stock.stockCode) // 기본 정보 있는 종목만
      .sort((a, b) => {
        const aMarketCap = parseFloat(a.marketCap || '0');
        const bMarketCap = parseFloat(b.marketCap || '0');
        return bMarketCap - aMarketCap; // 큰 것부터 정렬
      });
    
    console.log(`🎯 상위 ${Math.min(limit, sortedStocks.length)}개 종목 선택됨`);
    return sortedStocks.slice(0, limit);
  }
  
  /**
   * 종목별 날씨 데이터 생성
   */
  private async generateStockWeatherData(
    stocks: StockMaster[], 
    disclosures: any[]
  ): Promise<StockWeatherData[]> {
    const weatherData: StockWeatherData[] = [];
    
    for (const stock of stocks) {
      try {
        // 해당 종목 관련 공시 찾기
        const relatedDisclosures = disclosures.filter(d => 
          d.stockCode === stock.stockCode || 
          d.companyName?.includes(stock.stockName?.substring(0, 2) || '')
        );
        
        // DART 기반 분석 점수 계산 (가격 대신 공시/재무 기반)
        const analysisScore = this.calculateAnalysisScore(relatedDisclosures.length, stock.sector || '');
        
        // 날씨 조건 계산 (DART 기반)
        const weatherCondition = this.calculateWeatherConditionFromDart(
          relatedDisclosures.length,
          stock.sector || '',
          analysisScore
        );
        
        // DART 기반 예측 및 추천 생성
        const { forecast, recommendation, confidence } = this.generateDartBasedForecast(
          stock,
          relatedDisclosures,
          analysisScore
        );
        
        weatherData.push({
          stockCode: stock.stockCode,
          companyName: stock.stockName || 'Unknown',
          weatherCondition,
          forecast,
          confidence,
          recommendation,
          marketCap: stock.marketCap || undefined,
          sector: stock.sector || undefined,
          lastUpdated: new Date()
        });
        
      } catch (error) {
        console.error(`Failed to generate weather for ${stock.stockCode}:`, error);
      }
    }
    
    return weatherData;
  }
  
  /**
   * DART 기반 분석 점수 계산
   */
  private calculateAnalysisScore(disclosureCount: number, sector: string): number {
    let score = 50; // 기본 점수
    
    // 공시 빈도에 따른 점수 조정
    if (disclosureCount === 0) score += 10; // 공시가 없으면 안정성 증가
    else if (disclosureCount > 3) score -= 15; // 공시가 많으면 변동성 증가
    else score += 5; // 적당한 공시는 투명성으로 플러스
    
    // 섹터별 가중치
    const sectorBonus = this.getSectorStabilityScore(sector);
    score += sectorBonus;
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 섹터별 안정성 점수
   */
  private getSectorStabilityScore(sector: string): number {
    const stabilityMap: { [key: string]: number } = {
      '의료정밀': 15,
      '화학': 10,
      '금융업': 8,
      '전기전자': 5,
      '서비스업': 3,
      '운수장비': 0,
      '건설업': -5,
      '기타': 0
    };
    return stabilityMap[sector] || 0;
  }
  
  /**
   * DART 기반 날씨 조건 계산
   */
  private calculateWeatherConditionFromDart(
    disclosureCount: number, 
    sector: string, 
    analysisScore: number
  ): 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'windy' | 'drizzle' {
    
    // 분석 점수 기반 1차 분류
    if (analysisScore >= 80) return 'sunny';      // 매우 긍정적
    if (analysisScore >= 65) return 'cloudy';     // 긍정적
    if (analysisScore >= 50) return 'drizzle';    // 보통
    if (analysisScore >= 35) return 'rainy';      // 부정적
    if (analysisScore >= 20) return 'windy';      // 매우 부정적
    return 'stormy';                              // 위험
  }
  
  /**
   * DART 기반 예측 및 추천 생성
   */
  private generateDartBasedForecast(
    stock: StockMaster,
    disclosures: any[],
    analysisScore: number
  ): { forecast: string; recommendation: 'buy' | 'hold' | 'sell'; confidence: number } {
    
    const recentDisclosures = disclosures.slice(0, 3);
    let forecast = '';
    let recommendation: 'buy' | 'hold' | 'sell' = 'hold';
    let confidence = Math.floor(analysisScore * 0.8 + 20); // 20-100 범위
    
    // 공시 기반 예측 생성
    if (recentDisclosures.length === 0) {
      forecast = `${stock.stockName}은(는) 최근 공시가 없어 안정적인 모습을 보이고 있습니다. `;
      if (analysisScore >= 70) {
        forecast += '섹터 전망이 양호하여 중장기 투자에 적합해 보입니다.';
        recommendation = 'buy';
      } else {
        forecast += '현 상황 유지가 예상되며 관망하는 것이 좋겠습니다.';
        recommendation = 'hold';
      }
    } else if (recentDisclosures.length <= 2) {
      forecast = `${stock.stockName}은(는) 적절한 수준의 공시를 통해 투명한 경영을 보여주고 있습니다. `;
      if (analysisScore >= 60) {
        forecast += '긍정적인 기업 활동이 기대됩니다.';
        recommendation = 'buy';
      } else {
        forecast += '신중한 접근이 필요합니다.';
        recommendation = 'hold';
      }
    } else {
      forecast = `${stock.stockName}은(는) 최근 많은 공시가 있어 변동성이 클 수 있습니다. `;
      if (analysisScore >= 50) {
        forecast += '주요 변화가 예상되니 주의 깊게 지켜봐야 합니다.';
        recommendation = 'hold';
      } else {
        forecast += '불확실성이 높아 투자에 주의가 필요합니다.';
        recommendation = 'sell';
        confidence = Math.max(30, confidence - 10);
      }
    }
    
    // 섹터 전망 추가
    forecast += ` (${stock.sector || '기타'} 섹터)`;
    
    return { forecast, recommendation, confidence };
  }
  
  /**
   * 주가 데이터 시뮬레이션 (더 이상 사용하지 않음)
   */
  private simulateStockPrice(stock: StockMaster) {
    const basePrice = this.getBasePrice(stock.stockCode);
    const volatility = this.getSectorVolatility(stock.sector || '');
    
    // -5% ~ +5% 범위의 가격 변동 시뮬레이션
    const changePercent = (Math.random() - 0.5) * 10 * volatility;
    const currentPrice = Math.round(basePrice * (1 + changePercent / 100));
    const priceChange = currentPrice - basePrice;
    
    return {
      currentPrice,
      priceChange,
      priceChangePercent: changePercent
    };
  }
  
  /**
   * 기준 주가 설정 (종목별)
   */
  private getBasePrice(stockCode: string): number {
    const basePrices: Record<string, number> = {
      '005930': 72500,  // 삼성전자
      '000660': 129000, // SK하이닉스
      '035420': 198500, // NAVER
      '005380': 245000, // 현대차
      '373220': 412000, // LG에너지솔루션
      '207940': 789000, // 삼성바이오로직스
      '051910': 435000, // LG화학
      '006400': 315000, // 삼성SDI
      '035720': 87500,  // 카카오
      '068270': 165000, // 셀트리온
    };
    
    return basePrices[stockCode] || 50000; // 기본값
  }
  
  /**
   * 섹터별 변동성 계수
   */
  private getSectorVolatility(sector: string): number {
    const volatilityMap: Record<string, number> = {
      '전기전자': 1.2,
      '의료정밀': 1.5,
      '서비스업': 1.1,
      '운수장비': 0.9,
      '화학': 1.0,
      '금융업': 0.8,
      '건설업': 0.7,
      '통신업': 0.6,
    };
    
    return volatilityMap[sector] || 1.0;
  }
  
  /**
   * 날씨 조건 계산
   */
  private calculateWeatherCondition(
    priceChangePercent: number,
    disclosureCount: number,
    sector: string
  ): StockWeatherData['weatherCondition'] {
    // 가격 변동률과 공시 빈도를 고려한 날씨 결정
    if (priceChangePercent > 3) return 'sunny';
    if (priceChangePercent > 1) return 'cloudy';
    if (priceChangePercent > -1) return sector === '의료정밀' ? 'windy' : 'drizzle';
    if (priceChangePercent > -3) return 'rainy';
    return disclosureCount > 2 ? 'stormy' : 'snowy';
  }
  
  /**
   * 종목 예측 및 추천 생성
   */
  private generateStockForecast(
    stock: StockMaster,
    priceData: any,
    disclosures: any[]
  ) {
    const { priceChangePercent } = priceData;
    const { sector, industry } = stock;
    
    // 섹터별 전망 키워드
    const sectorOutlook = this.getSectorOutlook(sector || '');
    
    // 기본 예측 메시지 생성
    let forecast = '';
    let recommendation: 'buy' | 'hold' | 'sell' = 'hold';
    let confidence = 65;
    
    if (priceChangePercent > 2) {
      forecast = `${sectorOutlook.positive} 상승 모멘텀이 지속될 것으로 예상됩니다.`;
      recommendation = 'buy';
      confidence = 75 + Math.min(Math.round(priceChangePercent * 2), 20);
    } else if (priceChangePercent > 0) {
      forecast = `${sectorOutlook.neutral} 단기적으로 안정적인 흐름을 보일 것으로 예상됩니다.`;
      recommendation = 'hold';
      confidence = 60 + Math.round(priceChangePercent * 5);
    } else if (priceChangePercent > -2) {
      forecast = `${sectorOutlook.caution} 단기 조정이 있을 수 있으나 중장기 전망은 안정적입니다.`;
      recommendation = 'hold';
      confidence = 55 - Math.round(Math.abs(priceChangePercent) * 3);
    } else {
      forecast = `${sectorOutlook.negative} 하락 압력이 지속될 가능성이 있어 주의가 필요합니다.`;
      recommendation = 'sell';
      confidence = 45 - Math.round(Math.abs(priceChangePercent) * 2);
    }
    
    // 공시 정보 반영
    if (disclosures.length > 0) {
      forecast += ` 최근 ${disclosures.length}건의 공시가 있어 변동성이 예상됩니다.`;
      confidence = Math.max(confidence - 10, 30);
    }
    
    return {
      forecast,
      recommendation,
      confidence: Math.min(Math.max(confidence, 30), 95) // 30-95 범위로 제한
    };
  }
  
  /**
   * 섹터별 전망 메시지
   */
  private getSectorOutlook(sector: string) {
    const outlooks: Record<string, any> = {
      '전기전자': {
        positive: '반도체 수요 증가와 AI 기술 발전으로',
        neutral: '기술주 전반의 안정적인 흐름과',
        caution: '글로벌 공급망 불안정과 환율 변동으로',
        negative: '메모리 반도체 가격 하락과 중국 리스크로'
      },
      '의료정밀': {
        positive: '바이오 기술 발전과 신약 개발 기대감으로',
        neutral: '헬스케어 산업의 꾸준한 성장과',
        caution: '임상시험 결과 불확실성과 규제 강화로',
        negative: '바이오 업계 전반적인 조정과 실적 부진으로'
      },
      '서비스업': {
        positive: '디지털 전환 가속화와 플랫폼 성장으로',
        neutral: 'IT 서비스 수요 증가와',
        caution: '경기 둔화 우려와 소비 심리 위축으로',
        negative: '플랫폼 규제 강화와 경쟁 심화로'
      },
      '운수장비': {
        positive: '전기차 시장 확대와 친환경 정책으로',
        neutral: '자동차 산업의 구조적 변화와',
        caution: '원자재 가격 상승과 공급망 이슈로',
        negative: '전기차 시장 경쟁 심화와 중국 시장 불확실성으로'
      },
      // 기타 섹터들...
    };
    
    return outlooks[sector] || {
      positive: '업계 전반의 긍정적인 전망과',
      neutral: '시장 상황의 안정화와',
      caution: '업계 내 불확실성과',
      negative: '산업 전반의 조정 압력과'
    };
  }
  
  /**
   * 전체 시장 날씨 계산 (DART 기반)
   */
  private calculateMarketWeather(stockData: StockWeatherData[]): MarketWeatherData {
    if (stockData.length === 0) {
      return this.getDefaultMarketWeather().marketWeather;
    }
    
    // DART 기반 긍정적 종목 비율
    const positiveStocks = stockData.filter(s => 
      ['sunny', 'cloudy'].includes(s.weatherCondition)
    ).length;
    const positiveRatio = positiveStocks / stockData.length;
    
    // 평균 신뢰도
    const avgConfidence = stockData.reduce((sum, s) => sum + s.confidence, 0) / stockData.length;
    
    // 신뢰도 변동성 계산
    const confidenceVariance = this.calculateConfidenceVolatility(stockData.map(s => s.confidence));
    
    // 전체 날씨 조건 결정
    let overall: MarketWeatherData['overall'];
    if (positiveRatio > 0.7 && avgConfidence > 70) overall = 'sunny';
    else if (positiveRatio > 0.5) overall = 'cloudy';
    else if (positiveRatio > 0.3) overall = 'rainy';
    else overall = 'stormy';
    
    // 트렌드 결정
    let trend: MarketWeatherData['trend'];
    if (positiveRatio > 0.6) trend = 'up';
    else if (positiveRatio < 0.4) trend = 'down';
    else trend = 'stable';
    
    return {
      overall,
      temperature: Math.round(positiveRatio * 100), // 긍정적 종목 비율
      humidity: Math.round(100 - avgConfidence), // 불확실성 (신뢰도 역수)
      windSpeed: Math.round(positiveRatio * 100), // 시장 활동성
      pressure: Math.round(avgConfidence), // 시장 안정성
      trend,
      confidence: Math.round(avgConfidence),
      lastUpdated: new Date()
    };
  }
  
  /**
   * 신뢰도 변동성 계산
   */
  private calculateConfidenceVolatility(confidences: number[]): number {
    const mean = confidences.reduce((sum, val) => sum + val, 0) / confidences.length;
    const variance = confidences.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / confidences.length;
    return Math.sqrt(variance);
  }
  
  /**
   * 변동성 계산 (표준편차)
   */
  private calculateVolatility(changes: number[]): number {
    const mean = changes.reduce((sum, val) => sum + val, 0) / changes.length;
    const variance = changes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / changes.length;
    return Math.sqrt(variance) / 10; // 정규화
  }
  
  /**
   * 섹터별 날씨 계산 (DART 기반)
   */
  private calculateSectorWeather(stockData: StockWeatherData[]): SectorWeatherData[] {
    const sectorMap = new Map<string, StockWeatherData[]>();
    
    // 섹터별 그룹화
    stockData.forEach(stock => {
      const sector = stock.sector || '기타';
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, []);
      }
      sectorMap.get(sector)!.push(stock);
    });
    
    // 섹터별 분석
    return Array.from(sectorMap.entries()).map(([sector, stocks]) => {
      // DART 기반 긍정적 종목 비율 계산
      const positiveStocks = stocks.filter(s => 
        ['sunny', 'cloudy'].includes(s.weatherCondition)
      ).length;
      const positiveRatio = positiveStocks / stocks.length;
      
      // 평균 신뢰도
      const avgConfidence = stocks.reduce((sum, s) => sum + s.confidence, 0) / stocks.length;
      
      // 섹터 날씨 조건 결정
      let weatherCondition: SectorWeatherData['weatherCondition'];
      if (positiveRatio > 0.7) weatherCondition = 'sunny';
      else if (positiveRatio > 0.5) weatherCondition = 'cloudy';
      else if (positiveRatio > 0.3) weatherCondition = 'rainy';
      else weatherCondition = 'stormy';
      
      // 신뢰도 기준 정렬 (높은 신뢰도 순)
      const sortedStocks = stocks.sort((a, b) => b.confidence - a.confidence);
      
      return {
        sector,
        weatherCondition,
        averageChange: parseFloat(((positiveRatio - 0.5) * 100).toFixed(2)), // 긍정 비율을 % 변화로 표현
        stockCount: stocks.length,
        topPerformers: sortedStocks.slice(0, 3).map(s => s.companyName),
        bottomPerformers: sortedStocks.slice(-3).reverse().map(s => s.companyName)
      };
    }).sort((a, b) => b.averageChange - a.averageChange);
  }
  
  /**
   * 시장 인사이트 생성
   */
  private generateMarketInsights(
    marketWeather: MarketWeatherData,
    sectorAnalysis: SectorWeatherData[],
    disclosures: any[]
  ): string[] {
    const insights: string[] = [];
    
    // 전체 시장 인사이트
    if (marketWeather.overall === 'sunny') {
      insights.push(`시장 전반이 강세를 보이고 있습니다. 상승 종목 비율이 ${marketWeather.windSpeed}%에 달합니다.`);
    } else if (marketWeather.overall === 'stormy') {
      insights.push(`시장에 조정 압력이 강해 보입니다. 신중한 접근이 필요한 시점입니다.`);
    }
    
    // 섹터 인사이트
    const topSector = sectorAnalysis[0];
    const bottomSector = sectorAnalysis[sectorAnalysis.length - 1];
    
    if (topSector) {
      insights.push(`${topSector.sector} 섹터가 ${topSector.averageChange > 0 ? '상승' : '하락'} 주도하고 있습니다.`);
    }
    
    if (bottomSector && bottomSector.averageChange < -1) {
      insights.push(`${bottomSector.sector} 섹터에서 조정이 나타나고 있어 주의가 필요합니다.`);
    }
    
    // 공시 기반 인사이트
    if (disclosures.length > 10) {
      insights.push(`최근 ${disclosures.length}건의 공시가 있어 시장 변동성이 높아질 수 있습니다.`);
    }
    
    // 변동성 인사이트
    if (marketWeather.humidity > 80) {
      insights.push(`변동성이 높은 상황입니다. 포지션 관리에 신경써야 할 시점입니다.`);
    }
    
    return insights.slice(0, 4); // 최대 4개까지
  }
  
  /**
   * 기본 데이터 반환 (API 실패시)
   */
  private getDefaultMarketWeather(): MarketAnalysisResult {
    console.log('⚠️ Using default market weather data');
    
    return {
      marketWeather: {
        overall: 'cloudy',
        temperature: 65,
        humidity: 45,
        windSpeed: 55,
        pressure: 52,
        trend: 'stable',
        confidence: 60,
        lastUpdated: new Date()
      },
      topStocks: [], // 빈 배열로 반환하여 프론트엔드에서 처리
      sectorAnalysis: [],
      marketInsights: [
        '현재 데이터를 불러오는 중입니다.',
        'DART API 연결을 확인해주세요.',
        '잠시 후 다시 시도해주세요.'
      ]
    };
  }
}

export const marketWeatherService = new MarketWeatherService();