import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPortfolioSchema, insertStockHoldingSchema, insertUserAlertSchema } from "@shared/schema";
import { stockApi } from "./services/stockApi";
import { weatherApi } from "./services/weatherApi";
import { dartApi } from "./services/dartApi";
import { marketWeatherService } from "./services/marketWeatherService";
import { stockMasterService } from "./services/stockMasterService";

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

  // Stock routes (public access) - 실제 데이터베이스 검색
  app.get('/api/stocks/search', async (req: any, res) => {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter is required" });
      }
      
      // 데이터베이스에서 검색 (한국어, 영어, 종목코드, 업종 등 지원)
      const results = await storage.searchStocks(query, limit);
      
      // 기존 API 형식에 맞게 변환
      const searchResults = results.map(stock => ({
        code: stock.stockCode,
        name: stock.stockName,
        market: stock.market,
        sector: stock.sector,
        industry: stock.industry,
        marketCap: stock.marketCap
      }));
      
      res.json(searchResults);
    } catch (error) {
      console.error("Error searching stocks:", error);
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  // 전체 종목 목록 (시가총액 순)
  app.get('/api/stocks/all', async (req: any, res) => {
    try {
      const allStocks = await storage.getAllStocks();
      const stockList = allStocks.map(stock => ({
        code: stock.stockCode,
        name: stock.stockName,
        market: stock.market,
        sector: stock.sector,
        industry: stock.industry,
        marketCap: stock.marketCap
      }));
      
      res.json(stockList);
    } catch (error) {
      console.error("Error fetching all stocks:", error);
      res.status(500).json({ message: "Failed to fetch all stocks" });
    }
  });

  app.get('/api/stocks/:code/quote', async (req: any, res) => {
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

  app.get('/api/stocks/:code/history', async (req: any, res) => {
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

  // DART routes (public access)
  app.get('/api/dart/recent', async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const disclosures = await dartApi.getRecentDisclosures(limit);
      res.json(disclosures);
    } catch (error) {
      console.error("Error fetching DART disclosures:", error);
      res.status(500).json({ message: "Failed to fetch DART disclosures" });
    }
  });

  app.get('/api/dart/stock/:code', async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const disclosures = await dartApi.getCompanyDisclosures(req.params.code, limit);
      res.json(disclosures);
    } catch (error) {
      console.error("Error fetching stock disclosures:", error);
      res.status(500).json({ message: "Failed to fetch stock disclosures" });
    }
  });

  // Company information from DART
  app.get('/api/dart/company/:code', async (req: any, res) => {
    try {
      const stockCode = req.params.code;
      const companyInfo = await dartApi.getCompanyInfo(stockCode);
      
      if (!companyInfo) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(companyInfo);
    } catch (error) {
      console.error(`Error fetching company info for ${req.params.code}:`, error);
      res.status(500).json({ message: "Failed to fetch company information" });
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

  // Market Weather API endpoints
  app.get('/api/market/weather', async (req: any, res) => {
    try {
      const { marketWeatherService } = await import('./services/marketWeatherService');
      const result = await marketWeatherService.generateMarketWeather();
      res.json(result);
    } catch (error) {
      console.error('Error fetching market weather:', error);
      res.status(500).json({ message: 'Failed to fetch market weather data' });
    }
  });

  app.get('/api/market/weather/summary', async (req: any, res) => {
    try {
      const { marketWeatherService } = await import('./services/marketWeatherService');
      const result = await marketWeatherService.generateMarketWeather();
      
      // 요약 정보만 반환
      res.json({
        marketWeather: result.marketWeather,
        topStocksCount: result.topStocks.length,
        sectorsCount: result.sectorAnalysis.length,
        insights: result.marketInsights.slice(0, 2)
      });
    } catch (error) {
      console.error('Error fetching market weather summary:', error);
      res.status(500).json({ message: 'Failed to fetch market weather summary' });
    }
  });

  app.get('/api/market/sectors', async (req: any, res) => {
    try {
      const { marketWeatherService } = await import('./services/marketWeatherService');
      const result = await marketWeatherService.generateMarketWeather();
      res.json(result.sectorAnalysis);
    } catch (error) {
      console.error('Error fetching sector analysis:', error);
      res.status(500).json({ message: 'Failed to fetch sector analysis' });
    }
  });

  // Search with filters
  app.get('/api/market/stocks/filter', async (req: any, res) => {
    try {
      const { market, sector, limit } = req.query;
      const searchLimit = parseInt(limit as string) || 20;
      
      let allStocks = await storage.getAllStocks();
      
      // 시장별 필터
      if (market && typeof market === 'string') {
        allStocks = allStocks.filter(stock => 
          stock.market?.toLowerCase() === market.toLowerCase()
        );
      }
      
      // 섹터별 필터
      if (sector && typeof sector === 'string') {
        allStocks = allStocks.filter(stock => 
          stock.sector?.includes(sector)
        );
      }
      
      // 시가총액 순 정렬 후 제한
      const results = allStocks
        .sort((a, b) => parseFloat(b.marketCap || '0') - parseFloat(a.marketCap || '0'))
        .slice(0, searchLimit);
      
      res.json(results.map(stock => ({
        code: stock.stockCode,
        name: stock.stockName,
        market: stock.market,
        sector: stock.sector,
        industry: stock.industry,
        marketCap: stock.marketCap
      })));
    } catch (error) {
      console.error('Error filtering stocks:', error);
      res.status(500).json({ message: 'Failed to filter stocks' });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket 서버 설정 (실시간 검색용)
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket 연결 및 이벤트 처리
  wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 WebSocket client connected');
    
    // 클라이언트 연결 확인 응답
    ws.send(JSON.stringify({
      type: 'connection',
      message: '실시간 검색 서비스에 연결되었습니다.',
      timestamp: new Date().toISOString()
    }));
    
    // 메시지 수신 처리
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // 검색 요청 처리
        if (data.type === 'search') {
          const searchQuery = data.query;
          const limit = data.limit || 10;
          
          if (!searchQuery || searchQuery.length < 1) {
            ws.send(JSON.stringify({
              type: 'searchResult',
              results: [],
              query: searchQuery,
              timestamp: new Date().toISOString()
            }));
            return;
          }
          
          // 실시간 검색 수행
          const results = await storage.searchStocks(searchQuery, limit);
          
          // 클라이언트 형식에 맞게 변환
          const searchResults = results.map(stock => ({
            code: stock.stockCode,
            name: stock.stockName,
            market: stock.market,
            sector: stock.sector,
            industry: stock.industry,
            marketCap: stock.marketCap
          }));
          
          // 검색 결과 전송
          ws.send(JSON.stringify({
            type: 'searchResult',
            results: searchResults,
            query: searchQuery,
            count: searchResults.length,
            timestamp: new Date().toISOString()
          }));
          
          console.log(`🔍 실시간 검색 완료: "${searchQuery}" -> ${searchResults.length}개 결과`);
        }
        
        // 종목 추천 요청 처리
        else if (data.type === 'suggest') {
          const partial = data.partial || '';
          
          if (partial.length < 1) {
            ws.send(JSON.stringify({
              type: 'suggestions',
              suggestions: [],
              partial: partial,
              timestamp: new Date().toISOString()
            }));
            return;
          }
          
          // 부분 검색으로 추천 결과 생성
          const suggestions = await storage.searchStocks(partial, 5);
          
          ws.send(JSON.stringify({
            type: 'suggestions',
            suggestions: suggestions.map(stock => ({
              code: stock.stockCode,
              name: stock.stockName,
              displayText: `${stock.stockName} (${stock.stockCode})`
            })),
            partial: partial,
            timestamp: new Date().toISOString()
          }));
        }
        
      } catch (error) {
        console.error('❌ WebSocket 메시지 처리 오류:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: '검색 처리 중 오류가 발생했습니다.',
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    // 연결 종료 처리
    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
    });
    
    // 오류 처리
    ws.on('error', (error) => {
      console.error('❌ WebSocket 오류:', error);
    });
  });
  
  return httpServer;
}
