import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API proxy to search Steam store
  app.get("/api/games/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      // We'll use Steam's public storefront search API (returns HTML typically, but we can try other APIs)
      // Actually, standard Steam API for apps requires grabbing a huge list first.
      // Let's use a simpler proxy to a known API, or just return dummy data for this example if needed,
      // but let's try the IGDB / Steam API.
      // For Steam store search:
      const response = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=english&cc=US`);
      const data = await response.json();

      if (data && data.items) {
        const games = data.items.map((item: any) => ({
          steam_app_id: item.id,
          title: item.name,
          cover_image_url: item.tiny_image, // Or better image URL based on ID
          header_image_url: `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`,
        }));
        return res.json({ games });
      }

      res.json({ games: [] });
    } catch (error) {
      console.error("Error searching games:", error);
      res.status(500).json({ error: "Failed to search games" });
    }
  });

  // API proxy to fetch detailed game info from Steam
  app.get("/api/games/details/:appid", async (req, res) => {
    try {
      const { appid } = req.params;
      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`);
      const data = await response.json();
      
      if (data && data[appid] && data[appid].success) {
        return res.json(data[appid].data);
      }
      
      res.status(404).json({ error: "Game details not found" });
    } catch (error) {
      console.error("Error fetching game details:", error);
      res.status(500).json({ error: "Failed to fetch game details" });
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
    // Updated for Express 5 compatibility to catch all routes (SPA fallback)
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
