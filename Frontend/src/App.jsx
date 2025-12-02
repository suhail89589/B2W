import React, { useState } from "react";
import {
  Search,
  Play,
  Zap,
  Loader2,
  CheckCircle,
  Video,
  ExternalLink,
  AlertCircle,
} from "lucide-react";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api/recommend";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchStats, setSearchStats] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearchStats(null);
    const startTime = Date.now();

    try {
      
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query }),
      });

     
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server connection failed");
      }

      
      const data = await response.json();

      setResults(data.results);
      setSearchStats({
        count: data.count,
        time: ((Date.now() - startTime) / 1000).toFixed(2),
      });
    } catch (err) {
      console.error("Search Error:", err);
      
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to server. Is 'node server.js' running in a separate terminal?"
          : err.message
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block leading-none">
                b2w.tv
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                Real-Time Intelligence
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/20 border border-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-400">
              Server Online
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-600 tracking-tight">
            Curated Reference <br /> Search Engine.
          </h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">
            A semantic search tool connected to YouTube API, filtering for
            professional commercial references.
          </p>

          <form
            onSubmit={handleSearch}
            className="relative group max-w-2xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try 'Nike High Energy', 'Tesla Cinematic', or 'Apple Minimalist'..."
                className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-xl py-5 pl-7 pr-16 text-lg shadow-2xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none placeholder:text-gray-600 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-3 bg-white hover:bg-gray-200 text-black p-3 rounded-lg transition-all duration-200"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800 text-red-200 rounded-xl flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              "Kinetic Typography",
              "Car Commercial",
              "Tech Product Launch",
              "Fashion Film",
              "Luxury Brand",
            ].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="text-xs font-medium px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-purple-500 hover:text-purple-400 transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="min-h-[400px]">
          {searchStats && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Top Matches for <span className="text-white">"{query}"</span>
              </h2>
              <span className="text-xs text-gray-600 font-mono">
                Process Time: {searchStats.time}s • {searchStats.count} Curated
                Results
              </span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white/5 rounded-2xl h-80 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((video, idx) => (
                <a
                  key={idx}
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={
                        video.snippet.thumbnails.high
                          ? video.snippet.thumbnails.high.url
                          : video.snippet.thumbnails.medium.url
                      }
                      alt={video.snippet.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-1 rounded-md uppercase tracking-wide truncate max-w-[150px]">
                        {video.snippet.channelTitle}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        Score: {video.b2wScore}
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                        {video.snippet.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
                    </div>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                      {video.snippet.description}
                    </p>

                    <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-500 font-medium">
                        {video.reason}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && query && !error && (
            <div className="text-center py-20 opacity-50">
              <Video className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No matches passed the quality filter.</p>
              <p className="text-sm text-gray-600 mt-2">
                Try broadening your search terms.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
