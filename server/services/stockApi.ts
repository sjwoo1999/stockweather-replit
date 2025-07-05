import axios from 'axios';

export interface StockQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface StockSearchResult {
  code: string;
  name: string;
  market: string;
}

export class StockApiService {
  private baseUrl = 'https://api.finance.naver.com/siseJson.naver';
  private searchUrl = 'https://api.finance.naver.com/service/search/value';

  async getStockQuote(stockCode: string): Promise<StockQuote | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          symbol: stockCode,
          requestType: 1,
          startTime: this.getDateString(-1),
          endTime: this.getDateString(0),
          timeframe: 'day',
        },
      });

      const data = response.data;
      if (!data || data.length < 2) return null;

      const latest = data[data.length - 1];
      const previous = data[data.length - 2];

      return {
        code: stockCode,
        name: await this.getStockName(stockCode),
        price: parseFloat(latest[4]), // Close price
        change: parseFloat(latest[4]) - parseFloat(previous[4]),
        changePercent: ((parseFloat(latest[4]) - parseFloat(previous[4])) / parseFloat(previous[4])) * 100,
        volume: parseInt(latest[5]),
        timestamp: new Date(latest[0]),
      };
    } catch (error) {
      console.error(`Failed to fetch stock quote for ${stockCode}:`, error);
      return null;
    }
  }

  async searchStocks(query: string): Promise<StockSearchResult[]> {
    try {
      const response = await axios.get(this.searchUrl, {
        params: {
          query: query,
          target: 'stock',
        },
      });

      return response.data.items?.map((item: any) => ({
        code: item.code,
        name: item.name,
        market: item.market,
      })) || [];
    } catch (error) {
      console.error(`Failed to search stocks with query "${query}":`, error);
      return [];
    }
  }

  private async getStockName(stockCode: string): Promise<string> {
    // In a real implementation, this would fetch from a stock info API
    // For now, return a placeholder
    const stockNames: Record<string, string> = {
      '005930': '삼성전자',
      '005380': '현대차',
      '373220': 'LG에너지솔루션',
      '000660': 'SK하이닉스',
      '035420': 'NAVER',
      '051910': 'LG화학',
      '006400': '삼성SDI',
      '068270': '셀트리온',
      '207940': '삼성바이오로직스',
      '035720': '카카오',
    };

    return stockNames[stockCode] || `주식 ${stockCode}`;
  }

  private getDateString(daysOffset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }
}

export const stockApi = new StockApiService();
