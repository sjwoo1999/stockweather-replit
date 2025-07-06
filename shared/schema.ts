import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio table
export const portfolios = pgTable("portfolios", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull().default("내 포트폴리오"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock holdings table
export const stockHoldings = pgTable("stock_holdings", {
  id: uuid("id").primaryKey().defaultRandom(),
  portfolioId: uuid("portfolio_id").references(() => portfolios.id).notNull(),
  stockCode: varchar("stock_code").notNull(), // Korean stock code (e.g., "005930")
  stockName: varchar("stock_name").notNull(),
  shares: integer("shares").notNull(),
  averagePrice: decimal("average_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  confidenceLevel: integer("confidence_level").default(50), // 1-100 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock price history table
export const stockPrices = pgTable("stock_prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  stockCode: varchar("stock_code").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }),
  volume: integer("volume"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Weather data table
export const weatherData = pgTable("weather_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  city: varchar("city").notNull().default("서울"),
  temperature: decimal("temperature", { precision: 5, scale: 2 }).notNull(),
  humidity: integer("humidity"),
  precipitation: decimal("precipitation", { precision: 5, scale: 2 }),
  windSpeed: decimal("wind_speed", { precision: 5, scale: 2 }),
  condition: varchar("condition"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Weather-stock correlation table
export const weatherCorrelations = pgTable("weather_correlations", {
  id: uuid("id").primaryKey().defaultRandom(),
  stockCode: varchar("stock_code").notNull(),
  weatherFactor: varchar("weather_factor").notNull(), // 'temperature', 'precipitation', 'wind_speed'
  correlation: decimal("correlation", { precision: 5, scale: 4 }).notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DART disclosure table
export const dartDisclosures = pgTable("dart_disclosures", {
  id: uuid("id").primaryKey().defaultRandom(),
  stockCode: varchar("stock_code").notNull(),
  companyName: varchar("company_name").notNull(),
  title: text("title").notNull(),
  type: varchar("type").notNull(), // 'quarterly', 'annual', 'material', 'fair_disclosure'
  submittedDate: timestamp("submitted_date").notNull(),
  url: text("url"),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User alerts table
export const userAlerts = pgTable("user_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stockCode: varchar("stock_code"),
  alertType: varchar("alert_type").notNull(), // 'price_target', 'weather_condition', 'dart_disclosure'
  condition: jsonb("condition").notNull(), // Flexible condition storage
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock master data for search functionality
export const stockMaster = pgTable("stock_master", {
  id: uuid("id").primaryKey().defaultRandom(),
  stockCode: varchar("stock_code", { length: 10 }).notNull().unique(),
  stockName: varchar("stock_name", { length: 100 }).notNull(),
  stockNameEng: varchar("stock_name_eng", { length: 100 }),
  market: varchar("market", { length: 20 }).notNull(), // KOSPI, KOSDAQ, KONEX
  sector: varchar("sector", { length: 50 }),
  industry: varchar("industry", { length: 100 }),
  marketCap: decimal("market_cap", { precision: 15, scale: 0 }),
  isActive: boolean("is_active").default(true),
  listedDate: timestamp("listed_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Portfolio performance history
export const portfolioPerformance = pgTable("portfolio_performance", {
  id: uuid("id").primaryKey().defaultRandom(),
  portfolioId: uuid("portfolio_id").references(() => portfolios.id).notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  dayChange: decimal("day_change", { precision: 10, scale: 2 }),
  dayChangePercent: decimal("day_change_percent", { precision: 5, scale: 2 }),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  portfolios: many(portfolios),
  alerts: many(userAlerts),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  holdings: many(stockHoldings),
  performance: many(portfolioPerformance),
}));

export const stockHoldingsRelations = relations(stockHoldings, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [stockHoldings.portfolioId],
    references: [portfolios.id],
  }),
}));

export const portfolioPerformanceRelations = relations(portfolioPerformance, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioPerformance.portfolioId],
    references: [portfolios.id],
  }),
}));

export const userAlertsRelations = relations(userAlerts, ({ one }) => ({
  user: one(users, {
    fields: [userAlerts.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockHoldingSchema = createInsertSchema(stockHoldings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAlertSchema = createInsertSchema(userAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type StockHolding = typeof stockHoldings.$inferSelect;
export type InsertStockHolding = z.infer<typeof insertStockHoldingSchema>;
export type StockPrice = typeof stockPrices.$inferSelect;
export type StockMaster = typeof stockMaster.$inferSelect;
export type InsertStockMaster = typeof stockMaster.$inferInsert;
export type WeatherData = typeof weatherData.$inferSelect;
export type WeatherCorrelation = typeof weatherCorrelations.$inferSelect;
export type DartDisclosure = typeof dartDisclosures.$inferSelect;
export type UserAlert = typeof userAlerts.$inferSelect;
export type InsertUserAlert = z.infer<typeof insertUserAlertSchema>;
export type PortfolioPerformance = typeof portfolioPerformance.$inferSelect;
