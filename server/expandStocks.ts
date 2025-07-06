import { storage } from "./storage";
import type { InsertStockMaster } from "@shared/schema";

// 한국 증시 확장 종목 데이터 (80개 추가)
const expandedStocks: InsertStockMaster[] = [
  // IT/플랫폼 (추가)
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
  
  // 바이오/제약 (추가)
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
  {
    stockCode: "196170",
    stockName: "알테오젠",
    stockNameEng: "Alteogen",
    market: "KOSDAQ",
    sector: "의료정밀",
    industry: "바이오의약품",
    marketCap: "4000000000000",
    isActive: true,
  },
  
  // 2차전지/신재생에너지 (추가)
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
    stockCode: "247540",
    stockName: "에코프로비엠",
    stockNameEng: "EcoPro BM",
    market: "KOSDAQ",
    sector: "화학",
    industry: "배터리소재",
    marketCap: "25000000000000",
    isActive: true,
  },
  {
    stockCode: "086520",
    stockName: "에코프로",
    stockNameEng: "EcoPro",
    market: "KOSDAQ",
    sector: "화학",
    industry: "배터리소재",
    marketCap: "20000000000000",
    isActive: true,
  },
  
  // 반도체 장비/소재 (추가)
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
  {
    stockCode: "095340",
    stockName: "ISC",
    stockNameEng: "ISC",
    market: "KOSDAQ",
    sector: "전기전자",
    industry: "반도체소재",
    marketCap: "3000000000000",
    isActive: true,
  },
  
  // 식품/유통 (추가)
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
  {
    stockCode: "097950",
    stockName: "CJ제일제당",
    stockNameEng: "CJ CheilJedang",
    market: "KOSPI",
    sector: "음식료품",
    industry: "식품",
    marketCap: "8000000000000",
    isActive: true,
  },
  
  // 건설/부동산 (추가)
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
  {
    stockCode: "028050",
    stockName: "삼성엔지니어링",
    stockNameEng: "Samsung Engineering",
    market: "KOSPI",
    sector: "건설업",
    industry: "플랜트",
    marketCap: "4000000000000",
    isActive: true,
  },
  
  // 항공/운송 (추가)
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
  {
    stockCode: "180640",
    stockName: "한진칼",
    stockNameEng: "Hanjin KAL",
    market: "KOSPI",
    sector: "운수창고업",
    industry: "지주회사",
    marketCap: "2500000000000",
    isActive: true,
  },
  
  // 미디어/콘텐츠 (추가)
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
  {
    stockCode: "352820",
    stockName: "하이브",
    stockNameEng: "HYBE",
    market: "KOSPI",
    sector: "서비스업",
    industry: "엔터테인먼트",
    marketCap: "8000000000000",
    isActive: true,
  },
  
  // 기계/로봇 (추가)
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
  {
    stockCode: "056190",
    stockName: "에스에프에이",
    stockNameEng: "SFA Engineering",
    market: "KOSDAQ",
    sector: "기계",
    industry: "반도체장비",
    marketCap: "1200000000000",
    isActive: true,
  },
  
  // 화장품/생활용품 (추가)
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
  {
    stockCode: "002790",
    stockName: "아모레G",
    stockNameEng: "Amorepacific Group",
    market: "KOSPI",
    sector: "화학",
    industry: "화장품",
    marketCap: "5000000000000",
    isActive: true,
  },
  
  // 통신/네트워크 (추가)
  {
    stockCode: "029780",
    stockName: "삼성카드",
    stockNameEng: "Samsung Card",
    market: "KOSPI",
    sector: "금융업",
    industry: "카드",
    marketCap: "3000000000000",
    isActive: true,
  },
  {
    stockCode: "035250",
    stockName: "강원랜드",
    stockNameEng: "Kangwon Land",
    market: "KOSPI",
    sector: "서비스업",
    industry: "카지노",
    marketCap: "4000000000000",
    isActive: true,
  },
  
  // 부품/소재 (추가)
  {
    stockCode: "051900",
    stockName: "LG생활건강",
    stockNameEng: "LG Household & Health Care",
    market: "KOSPI",
    sector: "화학",
    industry: "생활용품",
    marketCap: "12000000000000",
    isActive: true,
  },
  {
    stockCode: "128940",
    stockName: "한미약품",
    stockNameEng: "Hanmi Pharmaceutical",
    market: "KOSPI",
    sector: "의료정밀",
    industry: "제약",
    marketCap: "6000000000000",
    isActive: true,
  },
  {
    stockCode: "185750",
    stockName: "종근당",
    stockNameEng: "Chong Kun Dang",
    market: "KOSPI",
    sector: "의료정밀",
    industry: "제약",
    marketCap: "4500000000000",
    isActive: true,
  },
  
  // 자동차 부품 (추가)
  {
    stockCode: "021240",
    stockName: "코웨이",
    stockNameEng: "Coway",
    market: "KOSPI",
    sector: "전기전자",
    industry: "가전",
    marketCap: "6000000000000",
    isActive: true,
  },
  {
    stockCode: "018880",
    stockName: "한온시스템",
    stockNameEng: "Hanon Systems",
    market: "KOSPI",
    sector: "운수장비",
    industry: "자동차부품",
    marketCap: "3500000000000",
    isActive: true,
  },
  {
    stockCode: "064350",
    stockName: "현대로템",
    stockNameEng: "Hyundai Rotem",
    market: "KOSPI",
    sector: "운수장비",
    industry: "철도차량",
    marketCap: "2000000000000",
    isActive: true,
  },
  
  // 정유/화학 (추가)
  {
    stockCode: "010955",
    stockName: "S-Oil우",
    stockNameEng: "S-Oil (Preferred)",
    market: "KOSPI",
    sector: "화학",
    industry: "정유",
    marketCap: "8000000000000",
    isActive: true,
  },
  {
    stockCode: "011170",
    stockName: "롯데케미칼",
    stockNameEng: "Lotte Chemical",
    market: "KOSPI",
    sector: "화학",
    industry: "석유화학",
    marketCap: "7000000000000",
    isActive: true,
  },
  {
    stockCode: "001570",
    stockName: "금양",
    stockNameEng: "Kumyang",
    market: "KOSPI",
    sector: "화학",
    industry: "화학",
    marketCap: "2500000000000",
    isActive: true,
  },
  
  // 철강/금속 (추가)
  {
    stockCode: "004020",
    stockName: "현대제철",
    stockNameEng: "Hyundai Steel",
    market: "KOSPI",
    sector: "철강금속",
    industry: "철강",
    marketCap: "8000000000000",
    isActive: true,
  },
  {
    stockCode: "002380",
    stockName: "KCC",
    stockNameEng: "KCC",
    market: "KOSPI",
    sector: "화학",
    industry: "화학",
    marketCap: "5000000000000",
    isActive: true,
  },
  {
    stockCode: "014820",
    stockName: "동원시스템즈",
    stockNameEng: "Dongwon Systems",
    market: "KOSDAQ",
    sector: "서비스업",
    industry: "IT서비스",
    marketCap: "1500000000000",
    isActive: true,
  }
];

export async function expandStockDatabase() {
  console.log("🚀 한국 증시 종목 데이터베이스 확장 시작...");
  
  try {
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const stock of expandedStocks) {
      try {
        const result = await storage.upsertStockMaster(stock);
        if (result) {
          console.log(`✅ ${stock.stockName} (${stock.stockCode}) 추가 완료`);
          insertedCount++;
        }
      } catch (error) {
        console.error(`❌ ${stock.stockName} (${stock.stockCode}) 추가 실패:`, error);
      }
    }
    
    console.log(`🎉 데이터베이스 확장 완료! ${insertedCount}개 종목 추가`);
    
    // 전체 종목 수 확인
    const allStocks = await storage.getAllStocks();
    console.log(`📊 현재 등록된 활성 종목 총 수: ${allStocks.length}개`);
    
    // 시장별 통계
    const kospiCount = allStocks.filter(s => s.market === 'KOSPI').length;
    const kosdaqCount = allStocks.filter(s => s.market === 'KOSDAQ').length;
    console.log(`📈 KOSPI: ${kospiCount}개, KOSDAQ: ${kosdaqCount}개`);
    
    // 업종별 상위 5개
    const sectorCount = allStocks.reduce((acc, stock) => {
      acc[stock.sector || '기타'] = (acc[stock.sector || '기타'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSectors = Object.entries(sectorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    console.log('📊 주요 업종별 종목 수:');
    topSectors.forEach(([sector, count]) => {
      console.log(`   ${sector}: ${count}개`);
    });
    
    return { success: insertedCount, total: allStocks.length };
    
  } catch (error) {
    console.error("💥 데이터베이스 확장 실패:", error);
    throw error;
  }
}

// 직접 실행시 확장 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  expandStockDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}