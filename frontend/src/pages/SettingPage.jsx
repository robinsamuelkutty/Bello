import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore"; // assuming this exists
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { authUser } = useAuthStore(); // user authentication state
  const [searchParams, setSearchParams] = useSearchParams();
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  // On load, check for tokens in query params or localStorage
  useEffect(() => {
    const urlAccessToken = searchParams.get("access_token");
    const urlRefreshToken = searchParams.get("refresh_token");
    const urlExpiresIn = searchParams.get("expires_in");

    if (urlAccessToken && urlRefreshToken) {
      localStorage.setItem("spotify_access_token", urlAccessToken);
      localStorage.setItem("spotify_refresh_token", urlRefreshToken);
      localStorage.setItem("spotify_expires_in", urlExpiresIn);

      setAccessToken(urlAccessToken);
      setSpotifyConnected(true);

      // Clear tokens from URL
      searchParams.delete("access_token");
      searchParams.delete("refresh_token");
      searchParams.delete("expires_in");
      setSearchParams(searchParams);
    } else {
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) {
        setAccessToken(storedToken);
        setSpotifyConnected(true);
      }
    }
  }, [searchParams, setSearchParams]);

  // Disconnect function: clear tokens and update state
  const handleDisconnectSpotify = () => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_expires_in");
    setAccessToken("");
    setSpotifyConnected(false);
  };

  return (
    <div className="h-screen max-h-screen container mx-auto px-4 pt-20 max-w-5xl overflow-y-auto ">
      <div className="space-y-6">
        {/* Theme Section */}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">
            Choose a theme for your chat interface
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
              `}
              onClick={() => setTheme(t)}
            >
              <div
                className="relative h-8 w-full rounded-md overflow-hidden"
                data-theme={t}
              >
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Connect to Spotify Section: only show if logged in */}
        {authUser && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Bello Music</h2>
            <p className="text-sm text-base-content/70">
              Connect your Spotify account to enable Spotify features.
            </p>
            {spotifyConnected ? (
              <div className="flex flex-col items-center">
                <p className="text-green-500 font-medium mt-3">
                  You are connected to Spotify!
                </p>
                <button
                  className="btn btn-secondary mt-3 rounded-full px-6"
                  onClick={handleDisconnectSpotify}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <>
                <a
                  href="https://bello-ob8m.onrender.com/auth/spotify/login"
                  className="btn btn-primary mt-3 rounded-full px-6"
                >
                  Connect to Spotify
                </a>
                <p className="text-xs text-center text-base-content/70 mt-1">
                  Requires Spotify Premium
                </p>
              </>
            )}
          </div>
        )}

        {/* Preview Section */}
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
        <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
          <div className="p-4 bg-base-200">
            <div className="max-w-lg mx-auto">
              {/* Mock Chat UI */}
              <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">John Doe</h3>
                      <p className="text-xs text-base-content/70">Online</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[80%] rounded-xl p-3 shadow-sm
                          ${message.isSent ? "bg-primary text-white" : "bg-neutral text-white"}
                        `}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-[10px] mt-1.5 text-white">12:00 PM</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-base-300 bg-base-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1 text-sm h-10"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                    />
                    <button className="btn btn-primary h-10 min-h-0">
                      <Send size={18} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
