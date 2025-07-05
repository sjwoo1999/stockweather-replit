import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPortfolioSchema, insertStockHoldingSchema, insertUserAlertSchema } from "@shared/schema";
import { stockApi } from "./services/stockApi";
import { weatherApi } from "./services/weatherApi";
import { dartApi } from "./services/dartApi";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Portfolio routes
  app.get('/api/portfolios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portfolios = await storage.getUserPortfolios(userId);
      res.json(portfolios);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.post('/api/portfolios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portfolioData = insertPortfolioSchema.parse({
        ...req.body,
        userId,
      });
      
      const portfolio = await storage.createPortfolio(portfolioData);
      res.json(portfolio);
    } catch (error) {
      console.error("Error creating portfolio:", error);
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });

  app.get('/api/portfolios/:id', isAuthenticated, async (req: any, res) => {
    try {
      const portfolio = await storage.getPortfolio(req.params.id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.get('/api/portfolios/:id/holdings', isAuthenticated, async (req: any, res) => {
    try {
      const holdings = await storage.getPortfolioHoldings(req.params.id);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      res.status(500).json({ message: "Failed to fetch holdings" });
    }
  });

  app.post('/api/portfolios/:id/holdings', isAuthenticated, async (req: any, res) => {
    try {
      const holdingData = insertStockHoldingSchema.parse({
        ...req.body,
        portfolioId: req.params.id,
      });
      
      const holding = await storage.addStockHolding(holdingData);
      res.json(holding);
    } catch (error) {
      console.error("Error adding holding:", error);
      res.status(500).json({ message: "Failed to add holding" });
    }
  });

  app.put('/api/holdings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updates = insertStockHoldingSchema.partial().parse(req.body);
      const holding = await storage.updateStockHolding(req.params.id, updates);
      res.json(holding);
    } catch (error) {
      console.error("Error updating holding:", error);
      res.status(500).json({ message: "Failed to update holding" });
    }
  });

  app.delete('/api/holdings/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteStockHolding(req.params.id);
      res.json({ message: "Holding deleted successfully" });
    } catch (error) {
      console.error("Error deleting holding:", error);
      res.status(500).json({ message: "Failed to delete holding" });
    }
  });

  // Stock routes
  app.get('/api/stocks/search', isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      const results = await stockApi.searchStocks(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching stocks:", error);
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  app.get('/api/stocks/:code/quote', isAuthenticated, async (req: any, res) => {
    try {
      const quote = await stockApi.getStockQuote(req.params.code);
      if (!quote) {
        return res.status(404).json({ message: "Stock not found" });
      }
      res.json(quote);
    } catch (error) {
      console.error("Error fetching stock quote:", error);
      res.status(500).json({ message: "Failed to fetch stock quote" });
    }
  });

  app.get('/api/stocks/:code/history', isAuthenticated, async (req: any, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const history = await storage.getStockPriceHistory(req.params.code, days);
      res.json(history);
    } catch (error) {
      console.error("Error fetching stock history:", error);
      res.status(500).json({ message: "Failed to fetch stock history" });
    }
  });

  // Weather routes
  app.get('/api/weather/current', isAuthenticated, async (req: any, res) => {
    try {
      const city = req.query.city as string || '서울';
      const weather = await weatherApi.getCurrentWeather(city);
      res.json(weather);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather" });
    }
  });

  app.get('/api/weather/correlations', isAuthenticated, async (req: any, res) => {
    try {
      const correlations = await storage.getWeatherCorrelations();
      res.json(correlations);
    } catch (error) {
      console.error("Error fetching weather correlations:", error);
      res.status(500).json({ message: "Failed to fetch weather correlations" });
    }
  });

  // DART routes
  app.get('/api/dart/recent', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const disclosures = await dartApi.getRecentDisclosures(limit);
      res.json(disclosures);
    } catch (error) {
      console.error("Error fetching DART disclosures:", error);
      res.status(500).json({ message: "Failed to fetch DART disclosures" });
    }
  });

  app.get('/api/dart/stock/:code', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const disclosures = await dartApi.getCompanyDisclosures(req.params.code, limit);
      res.json(disclosures);
    } catch (error) {
      console.error("Error fetching stock disclosures:", error);
      res.status(500).json({ message: "Failed to fetch stock disclosures" });
    }
  });

  // Alert routes
  app.get('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await storage.getUserAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertData = insertUserAlertSchema.parse({
        ...req.body,
        userId,
      });
      
      const alert = await storage.createUserAlert(alertData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.put('/api/alerts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updates = insertUserAlertSchema.partial().parse(req.body);
      const alert = await storage.updateUserAlert(req.params.id, updates);
      res.json(alert);
    } catch (error) {
      console.error("Error updating alert:", error);
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  app.delete('/api/alerts/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteUserAlert(req.params.id);
      res.json({ message: "Alert deleted successfully" });
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ message: "Failed to delete alert" });
    }
  });

  // Portfolio performance routes
  app.get('/api/portfolios/:id/performance', isAuthenticated, async (req: any, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const performance = await storage.getPortfolioPerformanceHistory(req.params.id, days);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching portfolio performance:", error);
      res.status(500).json({ message: "Failed to fetch portfolio performance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
