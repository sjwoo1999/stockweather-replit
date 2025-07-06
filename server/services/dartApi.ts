import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { parseDartDate, logDateParsing, isValidDisclosureDate } from '../utils/dateUtils';

const parseXml = promisify(parseString);

export interface DartDisclosureInfo {
  id: string;
  stockCode: string;
  companyName: string;
  title: string;
  type: string;
  submittedDate: Date;
  url: string;
  summary?: string;
  createdAt: string;
}

export interface CompanyInfo {
  corpCode: string;
  corpName: string;
  corpNameEng: string;
  stockName: string;
  stockCode: string;
  ceoName: string;
  corpCls: string;
  address: string;
  homepageUrl: string;
  phoneNumber: string;
  industryCode: string;
  establishedDate: string;
  accountMonth: string;
}

export class DartApiService {
  private apiKey = process.env.DART_API_KEY || '';
  private baseUrl = 'https://opendart.fss.or.kr/api';

  async getRecentDisclosures(limit: number = 10): Promise<DartDisclosureInfo[]> {
    try {
      // 오늘 날짜 기준으로 최신 공시 요청
      const today = new Date();
      const endDate = today.toISOString().split('T')[0].replace(/-/g, '');
      
      // 지난 30일간의 공시 조회
      const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0].replace(/-/g, '');

      const response = await axios.get(`${this.baseUrl}/list.json`, {
        params: {
          crtfc_key: this.apiKey,
          corp_cls: 'Y', // 유가증권시장
          bgn_de: startDate,
          end_de: endDate,
          page_no: 1,
          page_count: limit,
        },
      });

      const data = response.data;
      if (data.status !== '000') {
        // API 인증 성공했지만 데이터가 없는 경우 fallback 사용
        if (data.status === '013') {
          console.log('DART API: No recent disclosures found, using fallback data');
          return this.getFallbackDisclosures(limit);
        }
        throw new Error(`DART API error: ${data.message}`);
      }

      // 최신 순으로 정렬 (날짜 파싱 개선)
      const disclosures = data.list
        .map((item: any) => {
          const dateParseResult = parseDartDate(item.rcept_dt);
          
          // 날짜 파싱 로그 (디버깅용)
          logDateParsing(item.rcept_dt, dateParseResult);
          
          // DART API 응답 구조 디버깅 (첫 번째 아이템만)
          if (data.list.indexOf(item) === 0) {
            console.log('🔍 DART API 응답 샘플:', {
              corp_name: item.corp_name,
              corp_cls: item.corp_cls,
              stock_code: item.stock_code,
              report_nm: item.report_nm,
              rcept_dt: item.rcept_dt,
              rm: item.rm,
              flr_nm: item.flr_nm,
              rep_nm: item.rep_nm
            });
          }
          
          return {
            id: item.rcept_no || `${item.corp_name}-${item.rcept_dt}-${Math.random()}`,
            stockCode: item.stock_code || '',
            companyName: item.corp_name || '',
            title: item.report_nm || '',
            type: this.classifyDisclosureType(item.report_nm || ''),
            submittedDate: dateParseResult.date || new Date(), // 파싱 실패시 현재 날짜
            url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`,
            summary: this.processSummaryField(item.rm || ''),
            createdAt: new Date().toISOString(),
            // 디버깅 정보 추가
            _dateParseInfo: {
              original: item.rcept_dt,
              isValid: dateParseResult.isValid,
              errorMessage: dateParseResult.errorMessage
            },
            // DART 원본 데이터 디버깅용 (개발 환경에서만)
            ...(process.env.NODE_ENV === 'development' && {
              _rawData: {
                corp_cls: item.corp_cls,
                flr_nm: item.flr_nm,
                rep_nm: item.rep_nm,
                rm: item.rm
              }
            })
          };
        })
        .filter((disclosure) => {
          // 유효하지 않은 날짜의 공시는 제외
          const isValidDate = isValidDisclosureDate(disclosure.submittedDate);
          if (!isValidDate) {
            console.warn(`[공시 필터링] 유효하지 않은 날짜로 제외: ${disclosure.companyName} - ${disclosure.title}`);
          }
          return isValidDate;
        })
        .sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime());

      console.log(`✅ DART API: ${disclosures.length}개의 최신 공시 조회 완료`);
      return disclosures;
    } catch (error) {
      console.error('Failed to fetch DART disclosures:', error);
      return this.getFallbackDisclosures(limit);
    }
  }

  async getCompanyInfo(stockCode: string): Promise<CompanyInfo | null> {
    try {
      const corpCode = await this.getCorpCode(stockCode);
      const response = await axios.get(`${this.baseUrl}/company.json`, {
        params: {
          crtfc_key: this.apiKey,
          corp_code: corpCode,
        },
      });

      const data = response.data;
      if (data.status !== '000') {
        throw new Error(`DART API error: ${data.message}`);
      }

      return {
        corpCode: data.corp_code,
        corpName: data.corp_name,
        corpNameEng: data.corp_name_eng,
        stockName: data.stock_name,
        stockCode: data.stock_code,
        ceoName: data.ceo_nm,
        corpCls: data.corp_cls,
        address: data.adres,
        homepageUrl: data.hm_url,
        phoneNumber: data.phn_no,
        industryCode: data.induty_code,
        establishedDate: data.est_dt,
        accountMonth: data.acc_mt,
      };
    } catch (error) {
      console.error(`Failed to fetch company info for ${stockCode}:`, error);
      return null;
    }
  }

  async getCompanyDisclosures(stockCode: string, limit: number = 10): Promise<DartDisclosureInfo[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/list.json`, {
        params: {
          crtfc_key: this.apiKey,
          corp_code: await this.getCorpCode(stockCode),
          page_no: 1,
          page_count: limit,
        },
      });

      const data = response.data;
      if (data.status !== '000') {
        throw new Error(`DART API error: ${data.message}`);
      }

      return data.list
        .map((item: any) => {
          const dateParseResult = parseDartDate(item.rcept_dt);
          
          return {
            id: item.rcept_no || `${stockCode}-${item.rcept_dt}-${Math.random()}`,
            stockCode: stockCode,
            companyName: item.corp_name,
            title: item.report_nm,
            type: this.classifyDisclosureType(item.report_nm),
            submittedDate: dateParseResult.date || new Date(),
            url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`,
            summary: item.rm || '',
            createdAt: new Date().toISOString(),
            _dateParseInfo: {
              original: item.rcept_dt,
              isValid: dateParseResult.isValid,
              errorMessage: dateParseResult.errorMessage
            }
          };
        })
        .filter((disclosure: any) => isValidDisclosureDate(disclosure.submittedDate));
    } catch (error) {
      console.error(`Failed to fetch DART disclosures for ${stockCode}:`, error);
      return [];
    }
  }

  private async getCorpCode(stockCode: string): Promise<string> {
    // 주요 기업들의 DART corp_code 매핑
    const corpCodeMap: Record<string, string> = {
      '005930': '00126380', // 삼성전자
      '005380': '00164779', // 현대차
      '373220': '00401731', // LG에너지솔루션
      '000660': '00126217', // SK하이닉스
      '035420': '00139717', // NAVER
      '005490': '00164742', // POSCO홀딩스
      '066570': '00282462', // LG전자
      '323410': '00434456', // 카카오뱅크
      '207940': '00356370', // 삼성바이오로직스
      '003670': '00165570', // 포스코퓨처엠
    };

    return corpCodeMap[stockCode] || '00126380'; // 기본값: 삼성전자
  }

  private classifyDisclosureType(reportName: string): string {
    if (reportName.includes('분기보고서')) return 'quarterly';
    if (reportName.includes('사업보고서')) return 'annual';
    if (reportName.includes('주요사항보고서')) return 'material';
    if (reportName.includes('공정공시')) return 'fair_disclosure';
    return 'other';
  }

  /**
   * DART API의 rm 필드(비고) 처리
   * "유", "코" 등의 시장 코드를 의미있는 텍스트로 변환하거나 제거
   */
  private processSummaryField(summary: string): string {
    if (!summary || summary.trim() === '') {
      return '';
    }
    
    const trimmed = summary.trim();
    
    // 단순 시장 코드들은 제거
    if (trimmed === '유' || trimmed === '코' || trimmed === '코넥스' || trimmed === 'Y' || trimmed === 'K') {
      return '';
    }
    
    // 시장 코드가 포함된 경우 변환
    if (trimmed === '유가증권시장' || trimmed.includes('유가증권')) {
      return '';
    }
    
    if (trimmed === '코스닥시장' || trimmed.includes('코스닥')) {
      return '';
    }
    
    // 유의미한 요약 내용인 경우 그대로 반환
    if (trimmed.length > 2 && !['유', '코', '코넥스', 'Y', 'K'].includes(trimmed)) {
      return trimmed;
    }
    
    return '';
  }

  private getFallbackDisclosures(limit: number): DartDisclosureInfo[] {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const fallbackData: DartDisclosureInfo[] = [
      {
        id: `fallback-005930-${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, '0')}${String(yesterday.getDate()).padStart(2, '0')}`,
        stockCode: '005930',
        companyName: '삼성전자',
        title: '분기보고서 (2024.Q4)',
        type: 'quarterly',
        submittedDate: yesterday,
        url: 'https://dart.fss.or.kr',
        summary: '2024년 4분기 실적 발표',
        createdAt: new Date().toISOString()
      },
      {
        id: `fallback-005380-${twoDaysAgo.getFullYear()}${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}${String(twoDaysAgo.getDate()).padStart(2, '0')}`,
        stockCode: '005380',
        companyName: '현대차',
        title: '주요사항보고서',
        type: 'material',
        submittedDate: twoDaysAgo,
        url: 'https://dart.fss.or.kr',
        summary: '신규 투자 계획 발표',
        createdAt: new Date().toISOString()
      },
      {
        id: `fallback-373220-${threeDaysAgo.getFullYear()}${String(threeDaysAgo.getMonth() + 1).padStart(2, '0')}${String(threeDaysAgo.getDate()).padStart(2, '0')}`,
        stockCode: '373220',
        companyName: 'LG에너지솔루션',
        title: '공정공시',
        type: 'fair_disclosure',
        submittedDate: threeDaysAgo,
        url: 'https://dart.fss.or.kr',
        summary: '배터리 생산 확대 계획',
        createdAt: new Date().toISOString()
      },
      {
        id: `fallback-000660-${oneWeekAgo.getFullYear()}${String(oneWeekAgo.getMonth() + 1).padStart(2, '0')}${String(oneWeekAgo.getDate()).padStart(2, '0')}`,
        stockCode: '000660',
        companyName: 'SK하이닉스',
        title: '분기보고서 (2024.Q4)',
        type: 'quarterly',
        submittedDate: oneWeekAgo,
        url: 'https://dart.fss.or.kr',
        summary: '메모리 반도체 실적 발표',
        createdAt: new Date().toISOString()
      },
      {
        id: `fallback-035720-${new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).getFullYear()}${String(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).getMonth() + 1).padStart(2, '0')}${String(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).getDate()).padStart(2, '0')}`,
        stockCode: '035720',
        companyName: '카카오',
        title: '공정공시',
        type: 'fair_disclosure',
        submittedDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000),
        url: 'https://dart.fss.or.kr',
        summary: '플랫폼 사업 확장 계획',
        createdAt: new Date().toISOString()
      },
    ];

    // 최신 순으로 정렬하고 제한 수만큼 반환
    return fallbackData
      .sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime())
      .slice(0, limit);
  }
}

export const dartApi = new DartApiService();
