const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const rankVideos = (videos, originalQuery) => {
  const keywords = originalQuery.toLowerCase().split(" ");

  const POSITIVE_WEIGHTS = {
    official: 10,
    commercial: 8,
    showreel: 8,
    ad: 5,
    campaign: 5,
    promo: 4,
    trailer: 4,
    cinematic: 3,
    "4k": 2,
  };

  const NEGATIVE_WEIGHTS = {
    review: -15,
    reaction: -15,
    gameplay: -15,
    unboxing: -10,
    tutorial: -5,
    opinion: -5,
  };

  return videos
    .map((video) => {
      let score = 0;
      const title = (video.snippet.title || "").toLowerCase();
      const desc = (video.snippet.description || "").toLowerCase();
      const fullText = `${title} ${desc}`;

      
      keywords.forEach((word) => {
        if (fullText.includes(word) && word.length > 2) score += 5;
      });

      
      Object.keys(POSITIVE_WEIGHTS).forEach((term) => {
        if (title.includes(term)) score += POSITIVE_WEIGHTS[term];
      });

      
      Object.keys(NEGATIVE_WEIGHTS).forEach((term) => {
        if (title.includes(term)) score += NEGATIVE_WEIGHTS[term];
      });

     
      const matches = keywords.filter(
        (k) => fullText.includes(k) && k.length > 2
      );

      let reason = "Contextual industry match";
      if (matches.length > 0)
        reason = `Matches intent: "${matches.join(", ")}"`;
      if (score > 15) reason = "High-Confidence Brand Asset";

      return { ...video, b2wScore: score, reason };
    })
    .filter((v) => v.b2wScore > -5) 
    .sort((a, b) => b.b2wScore - a.b2wScore); 
};

// --- API ENDPOINT ---
app.post("/api/recommend", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log(`[Search] Query: ${query}`);

    
    const searchTerms = `${query} commercial ad reference 4k`;

    
    const youtubeResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: searchTerms,
          type: "video",
          maxResults: 25,
          videoEmbeddable: "true",
          key: process.env.YOUTUBE_API_KEY,
        },
        // 
        headers: {
         
          Referer: "http://localhost:5000",
        },
      }
    );

  

    const rawVideos = youtubeResponse.data.items || [];
    const rankedVideos = rankVideos(rawVideos, query);

   
    res.json({
      count: rankedVideos.length,
      results: rankedVideos.slice(0, 9), 
    });
  } catch (error) {
    console.error(
      "API Error:",
      error.response?.data?.error?.message || error.message
    );
    res.status(500).json({
      error: "Failed to fetch recommendations",
      details: error.response?.data?.error?.message || "Internal Server Error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
