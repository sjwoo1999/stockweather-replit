import {
  users,
  portfolios,
  stockHoldings,
  stockPrices,
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
  type WeatherData,
  type WeatherCorrelation,
  type DartDisclosure,
  type UserAlert,
  type InsertUserAlert,
  type PortfolioPerformance,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
