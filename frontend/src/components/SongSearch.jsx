import React, { useState, useCallback } from "react";
import axios from "axios";
import { Search, Play } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const SongSearch = ({ token, deviceId, onTrackPlay, onSearchPlay, onError }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { theme } = useChatStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          q: query, 
          type: "track", 
          limit: 20 // Increased limit for more results
        },
      });
      const tracks = res.data.tracks.items.map(track => ({
        ...track,
        isPlaying: false // Add a local playing state
      }));
      setResults(tracks);
      onSearchPlay?.(tracks); // Pass tracks to parent for queue management
      console.log("Search results:", tracks);
    } catch (err) {
      console.error("Error searching tracks:", err);
      onError?.("Could not search tracks. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackPlay = useCallback(
    async (track) => {
      if (!deviceId || !token) {
        onError?.("No active Spotify device or missing token");
        return;
      }
      try {
        // Pause current playback
        await axios.put(
          "https://api.spotify.com/v1/me/player/pause",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        await new Promise((resolve) => setTimeout(resolve, 100));
        
        await axios.put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          { uris: [track.uri] },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update results to show current track as playing
        setResults(prev => 
          prev.map(t => ({
            ...t, 
            isPlaying: t.id === track.id
          }))
        );

        onTrackPlay?.({ track, uri: track.uri });
        console.log("Playing track:", track.name);
      } catch (err) {
        console.error("Error playing track:", err);
        onError?.(
          err.response?.data?.error?.message || 
          "Could not play track. Please try again."
        );
      }
    },
    [deviceId, token, onTrackPlay, onError]
  );

  return (
    <div className="bg-[#282828] rounded-lg p-3">
      <form onSubmit={handleSearch} className="flex mb-3">
        <input
          type="text"
          placeholder="Search for a song..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow px-3 py-2 bg-[#404040] text-white rounded-l-lg 
                     focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isSearching}
        />
        <button
          type="submit"
          className="bg-green-500 text-black px-4 py-2 rounded-r-lg 
                     hover:bg-green-600 transition-colors duration-200"
          disabled={isSearching}
        >
          <Search size={20} />
        </button>
      </form>

      {isSearching && (
        <div className="text-center text-gray-400 py-2">Searching...</div>
      )}

      <div className="max-h-64 overflow-y-auto">
        {results.map((track) => (
          <div
            key={track.id}
            className="flex items-center justify-between p-2 
                        hover:bg-[#404040] rounded-lg cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <img
                src={
                  track.album.images?.[2]?.url ||
                  track.album.images?.[0]?.url ||
                  "/default-album.png"
                }
                alt={track.name}
                className="w-12 h-12 rounded"
              />
              <div>
                <div className="font-semibold text-white truncate max-w-[200px]">
                  {track.name}
                </div>
                <div className="text-xs text-gray-400 truncate max-w-[200px]">
                  {track.artists.map((a) => a.name).join(", ")}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleTrackPlay(track)}
              className={`p-2 rounded-full transition-all duration-200 
                           ${track.isPlaying 
                             ? 'bg-green-500 text-black' 
                             : 'bg-transparent text-white hover:bg-green-500/20'}`}
            >
              <Play size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongSearch;