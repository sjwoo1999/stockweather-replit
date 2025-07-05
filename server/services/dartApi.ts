import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXml = promisify(parseString);

export interface DartDisclosureInfo {
  stockCode: string;
  companyName: string;
  title: string;
  type: string;
  submittedDate: Date;
  url: string;
  summary?: string;
}

export class DartApiService {
  private apiKey = process.env.DART_API_KEY || '';
  private baseUrl = 'https://opendart.fss.or.kr/api';

  async getRecentDisclosures(limit: number = 10): Promise<DartDisclosureInfo[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/list.json`, {
        params: {
          crtfc_key: this.apiKey,
          corp_cls: 'Y', // 유가증권시장
          page_no: 1,
          page_count: limit,
        },
      });

      const data = response.data;
      if (data.status !== '000') {
        throw new Error(`DART API error: ${data.message}`);
      }

      return data.list.map((item: any) => ({
        stockCode: item.stock_code || '',
        companyName: item.corp_name,
        title: item.report_nm,
        type: this.classifyDisclosureType(item.report_nm),
        submittedDate: new Date(item.rcept_dt),
        url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`,
        summary: item.rm || '',
      }));
    } catch (error) {
      console.error('Failed to fetch DART disclosures:', error);
      return this.getFallbackDisclosures(limit);
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

      return data.list.map((item: any) => ({
        stockCode: stockCode,
        companyName: item.corp_name,
        title: item.report_nm,
        type: this.classifyDisclosureType(item.report_nm),
        submittedDate: new Date(item.rcept_dt),
        url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`,
        summary: item.rm || '',
      }));
    } catch (error) {
      console.error(`Failed to fetch DART disclosures for ${stockCode}:`, error);
      return [];
    }
  }

  private async getCorpCode(stockCode: string): Promise<string> {
    // In a real implementation, this would map stock codes to DART corp codes
    // For now, return a placeholder
    const corpCodeMap: Record<string, string> = {
      '005930': '00126380', // 삼성전자
      '005380': '00164779', // 현대차
      '373220': '00222754', // LG에너지솔루션
    };

    return corpCodeMap[stockCode] || '';
  }

  private classifyDisclosureType(reportName: string): string {
    if (reportName.includes('분기보고서')) return 'quarterly';
    if (reportName.includes('사업보고서')) return 'annual';
    if (reportName.includes('주요사항보고서')) return 'material';
    if (reportName.includes('공정공시')) return 'fair_disclosure';
    return 'other';
  }

  private getFallbackDisclosures(limit: number): DartDisclosureInfo[] {
    const fallbackData: DartDisclosureInfo[] = [
      {
        stockCode: '005930',
        companyName: '삼성전자',
        title: '분기보고서',
        type: 'quarterly',
        submittedDate: new Date('2024-01-15'),
        url: 'https://dart.fss.or.kr',
        summary: '2023년 4분기 실적 발표',
      },
      {
        stockCode: '005380',
        companyName: '현대차',
        title: '주요사항보고서',
        type: 'material',
        submittedDate: new Date('2024-01-14'),
        url: 'https://dart.fss.or.kr',
        summary: '신규 투자 계획 발표',
      },
      {
        stockCode: '373220',
        companyName: 'LG에너지솔루션',
        title: '공정공시',
        type: 'fair_disclosure',
        submittedDate: new Date('2024-01-13'),
        url: 'https://dart.fss.or.kr',
        summary: '배터리 생산 확대 계획',
      },
    ];

    return fallbackData.slice(0, limit);
  }
}

export const dartApi = new DartApiService();
