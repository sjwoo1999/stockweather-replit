import {
  users,
  portfolios,
  stockHoldings,
  stockPrices,
  stockMaster,
  weatherData,
  weatherCorrelations,
  dartDisclosures,
  userAlerts,
  portfolioPerformance,
  type User,
  type UpsertUser,
  type Portfolio,
  type InsertPortfolio,
  type StockHolding,
  type InsertStockHolding,
  type StockPrice,
  type StockMaster,
  type InsertStockMaster,
  type WeatherData,
  type WeatherCorrelation,
  type DartDisclosure,
  type UserAlert,
  type InsertUserAlert,
  type PortfolioPerformance,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, or, ilike, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Portfolio operations
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getUserPortfolios(userId: string): Promise<Portfolio[]>;
  getPortfolio(id: string): Promise<Portfolio | undefined>;
  updatePortfolio(id: string, updates: Partial<InsertPortfolio>): Promise<Portfolio>;
  deletePortfolio(id: string): Promise<void>;

  // Stock holding operations
  addStockHolding(holding: InsertStockHolding): Promise<StockHolding>;
  getPortfolioHoldings(portfolioId: string): Promise<StockHolding[]>;
  updateStockHolding(id: string, updates: Partial<InsertStockHolding>): Promise<StockHolding>;
  deleteStockHolding(id: string): Promise<void>;

  // Stock price operations
  saveStockPrice(price: Omit<StockPrice, 'id'>): Promise<StockPrice>;
  getLatestStockPrices(stockCodes: string[]): Promise<StockPrice[]>;
  getStockPriceHistory(stockCode: string, days: number): Promise<StockPrice[]>;

  // Weather operations
  saveWeatherData(weather: Omit<WeatherData, 'id'>): Promise<WeatherData>;
  getLatestWeatherData(): Promise<WeatherData | undefined>;
  getWeatherCorrelations(): Promise<WeatherCorrelation[]>;

  // DART disclosure operations
  saveDartDisclosure(disclosure: Omit<DartDisclosure, 'id' | 'createdAt'>): Promise<DartDisclosure>;
  getRecentDartDisclosures(limit: number): Promise<DartDisclosure[]>;
  getDisclosuresForStock(stockCode: string): Promise<DartDisclosure[]>;

  // Alert operations
  createUserAlert(alert: InsertUserAlert): Promise<UserAlert>;
  getUserAlerts(userId: string): Promise<UserAlert[]>;
  updateUserAlert(id: string, updates: Partial<InsertUserAlert>): Promise<UserAlert>;
  deleteUserAlert(id: string): Promise<void>;

  // Portfolio performance
  savePortfolioPerformance(performance: Omit<PortfolioPerformance, 'id'>): Promise<PortfolioPerformance>;
  getPortfolioPerformanceHistory(portfolioId: string, days: number): Promise<PortfolioPerformance[]>;

  // Stock search operations
  searchStocks(query: string, limit?: number): Promise<StockMaster[]>;
  getAllStocks(): Promise<StockMaster[]>;
  upsertStockMaster(stock: InsertStockMaster): Promise<StockMaster>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Portfolio operations
  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db
      .insert(portfolios)
      .values(portfolio)
      .returning();
    return newPortfolio;
  }

  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .orderBy(desc(portfolios.createdAt));
  }

  async getPortfolio(id: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.id, id));
    return portfolio;
  }

  async updatePortfolio(id: string, updates: Partial<InsertPortfolio>): Promise<Portfolio> {
    const [portfolio] = await db
      .update(portfolios)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio;
  }

  async deletePortfolio(id: string): Promise<void> {
    await db.delete(portfolios).where(eq(portfolios.id, id));
  }

  // Stock holding operations
  async addStockHolding(holding: InsertStockHolding): Promise<StockHolding> {
    const [newHolding] = await db
      .insert(stockHoldings)
      .values(holding)
      .returning();
    return newHolding;
  }

  async getPortfolioHoldings(portfolioId: string): Promise<StockHolding[]> {
    return await db
      .select()
      .from(stockHoldings)
      .where(eq(stockHoldings.portfolioId, portfolioId))
      .orderBy(desc(stockHoldings.createdAt));
  }

  async updateStockHolding(id: string, updates: Partial<InsertStockHolding>): Promise<StockHolding> {
    const [holding] = await db
      .update(stockHoldings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(stockHoldings.id, id))
      .returning();
    return holding;
  }

  async deleteStockHolding(id: string): Promise<void> {
    await db.delete(stockHoldings).where(eq(stockHoldings.id, id));
  }

  // Stock price operations
  async saveStockPrice(price: Omit<StockPrice, 'id'>): Promise<StockPrice> {
    const [newPrice] = await db
      .insert(stockPrices)
      .values(price)
      .returning();
    return newPrice;
  }

  async getLatestStockPrices(stockCodes: string[]): Promise<StockPrice[]> {
    return await db
      .select()
      .from(stockPrices)
      .where(sql`${stockPrices.stockCode} = ANY(${stockCodes})`)
      .orderBy(desc(stockPrices.timestamp));
  }

  async getStockPriceHistory(stockCode: string, days: number): Promise<StockPrice[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return await db
      .select()
      .from(stockPrices)
      .where(
        and(
          eq(stockPrices.stockCode, stockCode),
          gte(stockPrices.timestamp, daysAgo)
        )
      )
      .orderBy(desc(stockPrices.timestamp));
  }

  // Weather operations
  async saveWeatherData(weather: Omit<WeatherData, 'id'>): Promise<WeatherData> {
    const [newWeather] = await db
      .insert(weatherData)
      .values(weather)
      .returning();
    return newWeather;
  }

  async getLatestWeatherData(): Promise<WeatherData | undefined> {
    const [weather] = await db
      .select()
      .from(weatherData)
      .orderBy(desc(weatherData.timestamp))
      .limit(1);
    return weather;
  }

  async getWeatherCorrelations(): Promise<WeatherCorrelation[]> {
    return await db
      .select()
      .from(weatherCorrelations)
      .orderBy(desc(weatherCorrelations.correlation));
  }

  // DART disclosure operations
  async saveDartDisclosure(disclosure: Omit<DartDisclosure, 'id' | 'createdAt'>): Promise<DartDisclosure> {
    const [newDisclosure] = await db
      .insert(dartDisclosures)
      .values(disclosure)
      .returning();
    return newDisclosure;
  }

  async getRecentDartDisclosures(limit: number): Promise<DartDisclosure[]> {
    return await db
      .select()
      .from(dartDisclosures)
      .orderBy(desc(dartDisclosures.submittedDate))
      .limit(limit);
  }

  async getDisclosuresForStock(stockCode: string): Promise<DartDisclosure[]> {
    return await db
      .select()
      .from(dartDisclosures)
      .where(eq(dartDisclosures.stockCode, stockCode))
      .orderBy(desc(dartDisclosures.submittedDate));
  }

  // Alert operations
  async createUserAlert(alert: InsertUserAlert): Promise<UserAlert> {
    const [newAlert] = await db
      .insert(userAlerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async getUserAlerts(userId: string): Promise<UserAlert[]> {
    return await db
      .select()
      .from(userAlerts)
      .where(eq(userAlerts.userId, userId))
      .orderBy(desc(userAlerts.createdAt));
  }

  async updateUserAlert(id: string, updates: Partial<InsertUserAlert>): Promise<UserAlert> {
    const [alert] = await db
      .update(userAlerts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userAlerts.id, id))
      .returning();
    return alert;
  }

  async deleteUserAlert(id: string): Promise<void> {
    await db.delete(userAlerts).where(eq(userAlerts.id, id));
  }

  // Portfolio performance
  async savePortfolioPerformance(performance: Omit<PortfolioPerformance, 'id'>): Promise<PortfolioPerformance> {
    const [newPerformance] = await db
      .insert(portfolioPerformance)
      .values(performance)
      .returning();
    return newPerformance;
  }

  async getPortfolioPerformanceHistory(portfolioId: string, days: number): Promise<PortfolioPerformance[]> {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);
    
    return await db
      .select()
      .from(portfolioPerformance)
      .where(
        and(
          eq(portfolioPerformance.portfolioId, portfolioId),
          gte(portfolioPerformance.timestamp, daysAgo)
        )
      )
      .orderBy(desc(portfolioPerformance.timestamp));
  }

  // Stock search operations
  async searchStocks(query: string, limit: number = 20): Promise<StockMaster[]> {
    if (!query.trim()) return [];
    
    const searchTerm = query.trim();
    console.log('Searching for:', searchTerm);
    
    try {
      // 간단한 방식으로 먼저 시도 - 모든 주식을 가져와서 JavaScript에서 필터링
      const allStocks = await db.select().from(stockMaster).where(eq(stockMaster.isActive, true));
      
      const filtered = allStocks.filter(stock => {
        const term = searchTerm.toLowerCase();
        return (
          stock.stockName?.includes(searchTerm) || // 한글 정확 매칭
          stock.stockName?.toLowerCase().includes(term) || // 영어 case-insensitive
          stock.stockNameEng?.toLowerCase().includes(term) ||
          stock.stockCode?.toLowerCase().includes(term) ||
          stock.market?.toLowerCase().includes(term) || // 마켓 검색 (KOSPI, KOSDAQ)
          stock.sector?.includes(searchTerm) || // 한글 업종 검색
          stock.sector?.toLowerCase().includes(term) ||
          stock.industry?.includes(searchTerm) || // 한글 산업 검색
          stock.industry?.toLowerCase().includes(term) ||
          // 초성 검색 지원 (간단한 패턴)
          (searchTerm.length <= 3 && this.matchesInitials(stock.stockName || '', searchTerm))
        );
      });
      
      // 관련성에 따라 정렬
      const sorted = filtered.sort((a, b) => {
        // 종목코드 정확 일치가 최우선
        if (a.stockCode === searchTerm) return -1;
        if (b.stockCode === searchTerm) return 1;
        
        // 종목명 정확 일치가 두 번째
        if (a.stockName === searchTerm) return -1;
        if (b.stockName === searchTerm) return 1;
        
        // 종목코드로 시작하는 것이 세 번째
        if (a.stockCode?.startsWith(searchTerm)) return -1;
        if (b.stockCode?.startsWith(searchTerm)) return 1;
        
        // 종목명으로 시작하는 것이 네 번째
        if (a.stockName?.startsWith(searchTerm)) return -1;
        if (b.stockName?.startsWith(searchTerm)) return 1;
        
        // 시가총액 순으로 정렬
        const aMarketCap = parseFloat(a.marketCap || '0');
        const bMarketCap = parseFloat(b.marketCap || '0');
        return bMarketCap - aMarketCap;
      });
      
      console.log(`Found ${sorted.length} results for "${searchTerm}"`);
      return sorted.slice(0, limit);
      
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }

  // 한글 초성 검색을 위한 도우미 함수
  private matchesInitials(text: string, initials: string): boolean {
    const initialMap: Record<string, string> = {
      'ㄱ': '[가-깋]', 'ㄴ': '[나-닣]', 'ㄷ': '[다-딯]', 'ㄹ': '[라-맇]',
      'ㅁ': '[마-밓]', 'ㅂ': '[바-빟]', 'ㅅ': '[사-싷]', 'ㅇ': '[아-잏]',
      'ㅈ': '[자-짛]', 'ㅊ': '[차-칳]', 'ㅋ': '[카-킿]', 'ㅌ': '[타-팋]',
      'ㅍ': '[파-핗]', 'ㅎ': '[하-힣]'
    };

    try {
      const pattern = initials.split('').map(char => initialMap[char] || char).join('');
      const regex = new RegExp(pattern);
      return regex.test(text);
    } catch {
      return false;
    }
  }

  async getAllStocks(): Promise<StockMaster[]> {
    return await db.select()
      .from(stockMaster)
      .where(sql`${stockMaster.isActive} = true`)
      .orderBy(sql`${stockMaster.marketCap} DESC NULLS LAST`);
  }

  async upsertStockMaster(stock: InsertStockMaster): Promise<StockMaster> {
    const [result] = await db.insert(stockMaster)
      .values(stock)
      .onConflictDoUpdate({
        target: stockMaster.stockCode,
        set: {
          stockName: stock.stockName,
          stockNameEng: stock.stockNameEng,
          market: stock.market,
          sector: stock.sector,
          industry: stock.industry,
          marketCap: stock.marketCap,
          isActive: stock.isActive,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
