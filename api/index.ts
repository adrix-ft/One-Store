import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// API proxy to search Steam store
app.get("/api/games/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const response = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=english&cc=US`);
    const data = await response.json();

    if (data && data.items) {
      const games = data.items.map((item: any) => ({
        steam_app_id: item.id,
        title: item.name,
        cover_image_url: item.tiny_image,
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

export default app;