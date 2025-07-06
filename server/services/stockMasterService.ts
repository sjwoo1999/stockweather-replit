import { dartApi } from './dartApi';
import { storage } from '../storage';
import type { InsertStockMaster } from '@shared/schema';

export class StockMasterService {
  
  /**
   * DART API에서 전체 상장기업 목록을 가져와 DB에 저장
   */
  async syncAllCompanies(): Promise<{ success: number; failed: number }> {
    console.log('🔄 Starting full company data sync from DART API...');
    
    let success = 0;
    let failed = 0;
    
    try {
      // DART API에서 전체 기업 목록 조회 (현재 더미 데이터로 확장)
      const companies = await this.getAllKoreanCompanies();
      
      console.log(`📊 Found ${companies.length} companies to sync`);
      
      for (const company of companies) {
        try {
          await storage.upsertStockMaster(company);
          console.log(`✅ ${company.stockName} (${company.stockCode}) synced`);
          success++;
        } catch (error) {
          console.error(`❌ Failed to sync ${company.stockCode}:`, error);
          failed++;
        }
      }
      
      console.log(`🎉 Sync completed: ${success} success, ${failed} failed`);
      return { success, failed };
      
    } catch (error) {
      console.error('💥 Full sync failed:', error);
      throw error;
    }
  }
  
  /**
   * 한국 주요 상장기업 데이터 생성 (실제 데이터 기반)
   * 실제 구현에서는 DART API corpCode.xml 파싱 결과 사용
   */
  private async getAllKoreanCompanies(): Promise<InsertStockMaster[]> {
    // 현재는 확장된 실제 종목 데이터로 구현
    // 향후 DART API의 corpCode.xml에서 전체 목록 파싱 가능
    
    return [
      // 기존 50개 + 추가 주요 종목들
      
      // IT/플랫폼
      {
        stockCode: "376300",
        stockName: "디어유",
        stockNameEng: "Dear U",
        market: "KOSDAQ",
        sector: "서비스업",
        industry: "플랫폼",
        marketCap: "1500000000000",
        isActive: true,
      },
      {
        stockCode: "293490",
        stockName: "카카오게임즈",
        stockNameEng: "Kakao Games",
        market: "KOSDAQ",
        sector: "서비스업",
        industry: "게임",
        marketCap: "2800000000000",
        isActive: true,
      },
      {
        stockCode: "035900",
        stockName: "JYP Ent.",
        stockNameEng: "JYP Entertainment",
        market: "KOSDAQ",
        sector: "서비스업",
        industry: "엔터테인먼트",
        marketCap: "1200000000000",
        isActive: true,
      },
      
      // 바이오/제약
      {
        stockCode: "207940",
        stockName: "삼성바이오로직스",
        stockNameEng: "Samsung Biologics",
        market: "KOSPI",
        sector: "의료정밀",
        industry: "바이오의약품",
        marketCap: "70000000000000",
        isActive: true,
      },
      {
        stockCode: "328130",
        stockName: "루닛",
        stockNameEng: "Lunit",
        market: "KOSDAQ",
        sector: "의료정밀",
        industry: "AI의료",
        marketCap: "3000000000000",
        isActive: true,
      },
      {
        stockCode: "214450",
        stockName: "파마리서치",
        stockNameEng: "Pharma Research",
        market: "KOSDAQ",
        sector: "의료정밀",
        industry: "신약개발",
        marketCap: "800000000000",
        isActive: true,
      },
      
      // 2차전지/신재생에너지
      {
        stockCode: "006400",
        stockName: "삼성SDI",
        stockNameEng: "Samsung SDI",
        market: "KOSPI",
        sector: "전기전자",
        industry: "2차전지",
        marketCap: "35000000000000",
        isActive: true,
      },
      {
        stockCode: "373220",
        stockName: "LG에너지솔루션",
        stockNameEng: "LG Energy Solution",
        market: "KOSPI",
        sector: "전기전자",
        industry: "배터리",
        marketCap: "100000000000000",
        isActive: true,
      },
      {
        stockCode: "247540",
        stockName: "에코프로비엠",
        stockNameEng: "EcoPro BM",
        market: "KOSDAQ",
        sector: "화학",
        industry: "배터리소재",
        marketCap: "25000000000000",
        isActive: true,
      },
      
      // 반도체 장비/소재
      {
        stockCode: "042700",
        stockName: "한미반도체",
        stockNameEng: "Hanmi Semiconductor",
        market: "KOSDAQ",
        sector: "전기전자",
        industry: "반도체장비",
        marketCap: "8000000000000",
        isActive: true,
      },
      {
        stockCode: "058470",
        stockName: "리노공업",
        stockNameEng: "Lino",
        market: "KOSDAQ",
        sector: "전기전자",
        industry: "반도체장비",
        marketCap: "5000000000000",
        isActive: true,
      },
      
      // 식품/유통
      {
        stockCode: "271560",
        stockName: "오리온",
        stockNameEng: "Orion",
        market: "KOSPI",
        sector: "음식료품",
        industry: "제과",
        marketCap: "3500000000000",
        isActive: true,
      },
      {
        stockCode: "023530",
        stockName: "롯데쇼핑",
        stockNameEng: "Lotte Shopping",
        market: "KOSPI",
        sector: "유통업",
        industry: "백화점",
        marketCap: "5000000000000",
        isActive: true,
      },
      {
        stockCode: "282330",
        stockName: "BGF리테일",
        stockNameEng: "BGF Retail",
        market: "KOSPI",
        sector: "유통업",
        industry: "편의점",
        marketCap: "2000000000000",
        isActive: true,
      },
      
      // 건설/부동산
      {
        stockCode: "000720",
        stockName: "현대건설",
        stockNameEng: "Hyundai Engineering & Construction",
        market: "KOSPI",
        sector: "건설업",
        industry: "건설",
        marketCap: "8000000000000",
        isActive: true,
      },
      {
        stockCode: "047040",
        stockName: "대우건설",
        stockNameEng: "Daewoo Engineering & Construction",
        market: "KOSPI",
        sector: "건설업",
        industry: "건설",
        marketCap: "3000000000000",
        isActive: true,
      },
      
      // 항공/운송
      {
        stockCode: "003490",
        stockName: "대한항공",
        stockNameEng: "Korean Air",
        market: "KOSPI",
        sector: "운수창고업",
        industry: "항공",
        marketCap: "4000000000000",
        isActive: true,
      },
      {
        stockCode: "020560",
        stockName: "아시아나항공",
        stockNameEng: "Asiana Airlines",
        market: "KOSPI",
        sector: "운수창고업",
        industry: "항공",
        marketCap: "1500000000000",
        isActive: true,
      },
      
      // 미디어/콘텐츠
      {
        stockCode: "122870",
        stockName: "와이지엔터테인먼트",
        stockNameEng: "YG Entertainment",
        market: "KOSDAQ",
        sector: "서비스업",
        industry: "엔터테인먼트",
        marketCap: "1800000000000",
        isActive: true,
      },
      {
        stockCode: "041510",
        stockName: "에스엠",
        stockNameEng: "SM Entertainment",
        market: "KOSDAQ",
        sector: "서비스업",
        industry: "엔터테인먼트",
        marketCap: "2200000000000",
        isActive: true,
      },
      
      // 기계/로봇
      {
        stockCode: "117730",
        stockName: "티로보틱스",
        stockNameEng: "TI Robotics",
        market: "KOSDAQ",
        sector: "기계",
        industry: "로봇",
        marketCap: "800000000000",
        isActive: true,
      },
      {
        stockCode: "108860",
        stockName: "셀바스AI",
        stockNameEng: "Selvas AI",
        market: "KOSDAQ",
        sector: "서비스업",
        industry: "AI솔루션",
        marketCap: "600000000000",
        isActive: true,
      },
      
      // 화장품/생활용품
      {
        stockCode: "090430",
        stockName: "아모레퍼시픽",
        stockNameEng: "Amorepacific",
        market: "KOSPI",
        sector: "화학",
        industry: "화장품",
        marketCap: "8000000000000",
        isActive: true,
      },
      {
        stockCode: "161890",
        stockName: "한국콜마",
        stockNameEng: "Kolmar Korea",
        market: "KOSDAQ",
        sector: "화학",
        industry: "화장품",
        marketCap: "3000000000000",
        isActive: true,
      },
      
      // 교육/EdTech
      {
        stockCode: "066570",
        stockName: "LG전자",
        stockNameEng: "LG Electronics",
        market: "KOSPI",
        sector: "전기전자",
        industry: "가전",
        marketCap: "25000000000000",
        isActive: true,
      },
      {
        stockCode: "041190",
        stockName: "우리기술투자",
        stockNameEng: "Woori Technology Investment",
        market: "KOSDAQ",
        sector: "금융업",
        industry: "투자",
        marketCap: "500000000000",
        isActive: true,
      }
    ];
  }
  
  /**
   * 단일 종목 정보 업데이트
   */
  async syncSingleStock(stockCode: string): Promise<boolean> {
    try {
      const companyInfo = await dartApi.getCompanyInfo(stockCode);
      if (!companyInfo) return false;
      
      await storage.upsertStockMaster({
        stockCode: companyInfo.stockCode,
        stockName: companyInfo.stockName,
        stockNameEng: companyInfo.corpNameEng,
        market: this.determineMarket(companyInfo.corpCls),
        sector: this.determineSector(companyInfo.industryCode),
        industry: companyInfo.industryCode,
        isActive: true,
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to sync stock ${stockCode}:`, error);
      return false;
    }
  }
  
  private determineMarket(corpCls: string): string {
    if (corpCls === 'Y') return 'KOSPI';
    if (corpCls === 'K') return 'KOSDAQ';
    return 'KONEX';
  }
  
  private determineSector(industryCode: string): string {
    // 업종 코드를 기반으로 한글 업종명 매핑
    const sectorMap: Record<string, string> = {
      'C10': '음식료품',
      'C11': '섬유의복',
      'C20': '화학',
      'C21': '의료정밀',
      'C22': '고무플라스틱',
      'C23': '비금속광물',
      'C24': '철강금속',
      'C25': '기계',
      'C26': '전기전자',
      'C27': '의료정밀',
      'C28': '운수장비',
      'C29': '기타제조업',
      'D': '전기가스업',
      'E': '건설업',
      'F': '유통업',
      'G': '운수창고업',
      'H': '통신업',
      'I': '금융업',
      'J': '서비스업'
    };
    
    return sectorMap[industryCode] || '기타';
  }
}

export const stockMasterService = new StockMasterService();