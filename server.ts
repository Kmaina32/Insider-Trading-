import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
}) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes Mocking

  let sessionKeys = {
    polymarket: false,
    polygon: false,
    oanda: false
  };

  app.get("/api/keys", (req, res) => {
    res.json(sessionKeys);
  });

  app.post("/api/keys", (req, res) => {
    const { polymarketKey, polygonKey, oandaKey } = req.body;
    if (polymarketKey !== undefined) sessionKeys.polymarket = !!polymarketKey;
    if (polygonKey !== undefined) sessionKeys.polygon = !!polygonKey;
    if (oandaKey !== undefined) sessionKeys.oanda = !!oandaKey;
    res.json({ success: true, keys: sessionKeys });
  });

  app.get("/api/portfolio", (req, res) => {
    if (!sessionKeys.polygon && !sessionKeys.oanda && !sessionKeys.polymarket) {
      return res.json({ balance: 0, pnl: 0, pnlPercent: 0, assets: [] });
    }

    res.json({
      balance: 1425000,
      pnl: 12500,
      pnlPercent: 0.88,
      assets: [
        ...(sessionKeys.polygon ? [{ symbol: "AAPL", shares: 1500, avgPrice: 150.5, currentPrice: 185.3, allocation: 20 }] : []),
        ...(sessionKeys.oanda ? [{ symbol: "EURUSD", shares: 100000, avgPrice: 1.0500, currentPrice: 1.0850, allocation: 25 }] : []),
        ...(sessionKeys.polymarket ? [{ symbol: "POLY_YES_AI", shares: 5000, avgPrice: 0.65, currentPrice: 0.72, allocation: 20 }] : []),
        { symbol: "BTC", shares: 4.5, avgPrice: 42000, currentPrice: 61200, allocation: 35 }
      ]
    });
  });

  app.get("/api/market/:symbol", (req, res) => {
    const { symbol } = req.params;

    let hasAccess = false;
    if (symbol === 'BTC') hasAccess = true;
    if (symbol === 'AAPL' && sessionKeys.polygon) hasAccess = true;
    if (symbol === 'EURUSD' && sessionKeys.oanda) hasAccess = true;
    if (symbol === 'POLY_YES_AI' && sessionKeys.polymarket) hasAccess = true;

    if (!hasAccess) {
      return res.json({ symbol, history: [], currentPrice: 0 });
    }
    
    const history = [];
    let currentPrice = symbol === "BTC" ? 61000 : symbol === "AAPL" ? 180 : symbol === "EURUSD" ? 1.08 : 0.7;
    
    // Generate some mock history (7 days, 15 min intervals approx)
    const now = Date.now();
    for (let i = 0; i < 100; i++) {
       const time = now - (100 - i) * 15 * 60000;
       currentPrice = currentPrice * (1 + (Math.random() * 0.04 - 0.02));
       history.push({
           time: new Date(time).toISOString(),
           price: parseFloat(currentPrice.toFixed(4)),
           volume: Math.floor(Math.random() * 10000)
       });
    }
    res.json({ symbol, history, currentPrice });
  });

  function analyzeSentiment(symbol: string): { score: number, drivers: string[], stance: string } {
    // Simulate scraping news, social media, regulatory filings
    const drivers = [
      "Federal Reserve rate decision implications processed from Bloomberg feed",
      "Retail trader sentiment indexed from StockTwits and Reddit",
      "Recent SEC 8-K filings parsing indicates positive structural changes"
    ];
    
    // Random sentiment for demo purposes (-1 to 1)
    const score = (Math.random() * 2) - 1; 
    let stance = "Neutral";
    if (score > 0.3) stance = "Bullish";
    if (score < -0.3) stance = "Bearish";
    if (score > 0.7) stance = "Strong Bullish";
    if (score < -0.7) stance = "Strong Bearish";
    
    return { score, drivers, stance };
  }

  app.post("/api/ai-signal", async (req, res) => {
    if (!ai) {
      return res.status(500).json({ error: "Gemini API key missing on server." });
    }

    const { symbol, timeframe, context } = req.body;
    
    // 1. Run Enhanced Sentiment Analysis Pipeline
    const sentiment = analyzeSentiment(symbol);
    
    // 2. Synthesize Context for LLM
    const enrichedContext = {
      ...context,
      nlpSentimentScore: sentiment.score,
      marketStance: sentiment.stance,
      primaryDrivers: sentiment.drivers,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Act as a quantitative portfolio manager. Analyze this enriched market context for ${symbol} on timeframe ${timeframe}. 
        Incorporate the NLP sentiment analysis and market drivers. 
        Provide a trading signal (BUY, SELL, or HOLD), a confidence percentage (0-100), and a concise 1-sentence reasoning focused on sentiment and technicals. 
        Context: ${JSON.stringify(enrichedContext)}. 
        Return strictly as JSON: { "signal": "BUY"|"SELL"|"HOLD", "confidence": number, "reasoning": "string" }`,
        config: {
            responseMimeType: "application/json"
        }
      });
      
      const text = response.text;
      let parsed = { signal: "HOLD", confidence: 50, reasoning: "Error parsing AI response" };
      try {
          if (text) {
              parsed = JSON.parse(text);
          }
      } catch (e) {
          console.error("Failed to parse", text);
      }
      res.json(parsed);
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support Express v5 routing wildcard if needed, but we can safely use * for v4
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Insider Trader Backend running on port ${PORT}`);
  });
}

startServer();
