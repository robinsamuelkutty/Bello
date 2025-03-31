import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSpotifySidebarStore } from "../store/useSpotifySidebarStore";
import SpotifyPlayer from "./SpotifyPlayer";
import SongSearch from "./SongSearch";
import VolumeControl from "./VolumeControl";
import SeekBar from "./SeekBar";
import axios from "axios";
import { X, Play, Pause, SkipForward, SkipBack, Shuffle } from "lucide-react";
import { Link } from "react-router-dom";

const SpotifySidebar = () => {
  const { isVisible, setVisible } = useSpotifySidebarStore();

  // For a consistent Spotify theme, we use fixed color values.
  const primaryText = "text-white";
  const secondaryText = "text-gray-300";
  const borderColor = "border-[#282828]";
  const bgOverlay = "bg-[#121212] bg-opacity-80";

  const [token, setToken] = useState(localStorage.getItem("spotify_access_token"));

  useEffect(() => {
    if (isVisible) {
      setToken(localStorage.getItem("spotify_access_token"));
    }
  }, [isVisible]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "spotify_access_token") {
        setToken(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const [user, setUser] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [searchQueue, setSearchQueue] = useState(null);

  const intervalRef = useRef(null);
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user profile:", err));

      axios
        .get("https://api.spotify.com/v1/me/playlists", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setPlaylists(res.data.items))
        .catch((err) => console.error("Error fetching playlists:", err));
    } else {
      setUser(null);
      setPlaylists([]);
    }
  }, [token]);

  const handleStateChange = useCallback(
    (state) => {
      if (!state) return;
      const newTrack = state.track_window?.current_track;
      if (
        nowPlaying &&
        newTrack &&
        nowPlaying.track &&
        newTrack.id === nowPlaying.track.id &&
        state.position === currentTime
      ) {
        return;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      setNowPlaying({
        track: newTrack,
        isPaused: state.paused,
        duration: state.duration,
      });
      setCurrentTime(state.position);
      if (!state.paused) {
        intervalRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            const newTime = prev + 1000;
            return newTime > state.duration ? state.duration : newTime;
          });
        }, 1000);
      }
      setIsPlaying(!state.paused);
      console.log("Updated playback state:", state);
    },
    [currentTime, nowPlaying]
  );

  const handleCloseClick = () => setVisible(false);

  const handlePlayPause = () => {
    if (!deviceId) {
      console.error("No active device or missing token");
      return;
    }
    if (isPlaying) {
      axios
        .put(
          "https://api.spotify.com/v1/me/player/pause",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setIsPlaying(false);
          console.log("Playback paused");
        })
        .catch((err) => console.error("Error pausing playback:", err));
    } else {
      axios
        .put(
          "https://api.spotify.com/v1/me/player/play",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => {
          setIsPlaying(true);
          console.log("Playback started/resumed");
        })
        .catch((err) => console.error("Error resuming playback:", err));
    }
  };

  const handleSkipForward = () => {
    if (!deviceId) {
      console.error("No active device or missing token");
      return;
    }
    if (searchQueue && searchQueue.length > 0) {
      const randomTrack =
        searchQueue[Math.floor(Math.random() * searchQueue.length)];
      const uris = searchQueue.map((t) => t.uri);
      axios
        .put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            uris,
            offset: { uri: randomTrack.uri },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => console.log("Random skip forward to:", randomTrack.name))
        .catch((err) =>
          console.error("Error playing random track from search:", err)
        );
    } else {
      axios
        .post(
          "https://api.spotify.com/v1/me/player/next",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch((err) => console.error("Error skipping forward:", err));
    }
  };

  const handleSkipBack = () => {
    if (!deviceId) {
      console.error("No active device or missing token");
      return;
    }
    if (searchQueue && searchQueue.length > 0) {
      const randomTrack =
        searchQueue[Math.floor(Math.random() * searchQueue.length)];
      const uris = searchQueue.map((t) => t.uri);
      axios
        .put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            uris,
            offset: { uri: randomTrack.uri },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(() => console.log("Random skip back to:", randomTrack.name))
        .catch((err) =>
          console.error("Error playing random track from search:", err)
        );
    } else {
      axios
        .post(
          "https://api.spotify.com/v1/me/player/previous",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .catch((err) => console.error("Error skipping back:", err));
    }
  };

  const handleSeek = async (newTime) => {
    if (!deviceId) {
      console.error("No device available for seeking");
      return;
    }
    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
      await axios.put(
        `https://api.spotify.com/v1/me/player/seek?position_ms=${newTime}&device_id=${deviceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimeout(() => {
        setCurrentTime(newTime);
        console.log("Seek successful to:", newTime);
      }, 500);
    } catch (err) {
      console.error("Error seeking playback:", err);
    }
  };

  const handleVolumeChange = async (newVolume) => {
    if (!deviceId) {
      console.error("No device available for volume change");
      return;
    }
    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}&device_id=${deviceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVolume(newVolume);
      console.log("Volume changed to:", newVolume);
    } catch (err) {
      console.error("Error changing volume:", err);
    }
  };

  const handleShuffleToggle = async () => {
    if (!deviceId) {
      console.error("No active device or missing token");
      return;
    }
    try {
      const newState = !shuffle;
      await axios.put(
        `https://api.spotify.com/v1/me/player/shuffle?state=${newState}&device_id=${deviceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShuffle(newState);
      console.log("Shuffle mode set to:", newState);
    } catch (err) {
      console.error("Error toggling shuffle mode:", err);
    }
  };

  const handlePlaylistClick = async (playlist) => {
    if (!deviceId) {
      console.error("Missing device or token.");
      return;
    }
    try {
      setNowPlaying(null);
      setCurrentTime(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      await axios.put(
        `https://api.spotify.com/v1/me/player/shuffle?state=${shuffle}&device_id=${deviceId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          context_uri: playlist.uri,
          offset: { position: 0 },
          position_ms: 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Playlist started:", playlist.name);
    } catch (err) {
      console.error("Error starting playlist:", err);
    }
  };

  const handlePlaylistWheel = (e) => {
    e.currentTarget.scrollLeft += e.deltaY;
  };

  return (
    <div
      className={`fixed top-16 right-4 h-[calc(100vh-80px)] w-96 ${bgOverlay} backdrop-blur-lg rounded-xl p-4 transition-transform duration-300 ease-in-out 
        ${isVisible ? "translate-x-0" : "translate-x-full"} shadow-2xl z-50`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <img src="/Bello AI white.svg" alt="BMusic" className="h-12 w-12" />
          <span className={`text-lg font-bold ${primaryText}`}>Bello Music</span>
        </div>
        <button
          onClick={handleCloseClick}
          className="hover:bg-gray-800 p-2 rounded-full"
          title="Close sidebar"
        >
          <X size={20} className={primaryText} />
        </button>
      </div>

      {/* Conditional Content */}
      {!token ? (
        <div className="flex h-full items-center justify-center">
          <div className="p-4 text-center">
            <p className={`mb-4 ${primaryText}`}>
              You are not connected to Spotify. Please connect your account via the{" "}
              <Link to="/settings" className="underline text-[#1db954]">
                Settings
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* User Profile */}
          {user ? (
            <div className={`flex items-center space-x-3 mb-4 border-b ${borderColor} pb-4`}>
              <img
                src={user.images?.[0]?.url || "/default-avatar.png"}
                alt={user.display_name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className={`font-semibold ${primaryText}`}>{user.display_name}</div>
                <div className={`text-sm ${secondaryText}`}>
                  {user.product === "premium" ? "Premium Member" : "Free Account"}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4 text-gray-400">Loading user...</div>
          )}

          {/* Now Playing */}
          <div className={`mb-4 border-b ${borderColor} pb-4`}>
            <h3 className={`text-sm uppercase ${secondaryText} mb-2`}>Now Playing</h3>
            {nowPlaying && nowPlaying.track ? (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={nowPlaying.track.album?.images?.[0]?.url || "/default-album.png"}
                    alt="Album art"
                    className="w-16 h-16 rounded"
                  />
                  <div>
                    <div className={`font-semibold ${primaryText}`}>{nowPlaying.track.name}</div>
                    <div className={`text-sm ${secondaryText}`}>
                      {nowPlaying.track.artists?.[0]?.name}
                    </div>
                    <div className="text-[#1db954] text-xs mt-1">
                      {nowPlaying.isPaused ? "Paused" : "Playing"}
                    </div>
                  </div>
                </div>
                <SeekBar
                  duration={nowPlaying.duration}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex space-x-4">
                    <button onClick={handleSkipBack} className="hover:text-[#1db954]">
                      <SkipBack size={20} />
                    </button>
                    <button onClick={handlePlayPause} className="hover:text-[#1db954]">
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={handleSkipForward} className="hover:text-[#1db954]">
                      <SkipForward size={20} />
                    </button>
                    <button
                      onClick={handleShuffleToggle}
                      className="relative hover:text-[#1db954]"
                    >
                      <Shuffle size={20} color={shuffle ? "#1db954" : "currentColor"} />
                      {shuffle && (
                        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#1db954] rounded-full"></span>
                      )}
                    </button>
                  </div>
                  <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />
                </div>
              </div>
            ) : (
              <div className={secondaryText}>No track playing</div>
            )}
          </div>

          {/* Playlist Slider */}
          <div className={`mb-4 border-b ${borderColor} pb-4`}>
            <h3 className={`text-sm uppercase ${secondaryText} mb-2`}>Your Playlists</h3>
            <div className="flex space-x-4 overflow-x-auto" onWheel={handlePlaylistWheel}>
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => handlePlaylistClick(pl)}
                  className="min-w-[28%] max-w-[28%] flex-shrink-0 hover:bg-gray-800 p-2 rounded cursor-pointer"
                >
                  <img
                    src={pl.images?.[0]?.url || "/default-playlist.png"}
                    alt={pl.name}
                    className="w-full rounded"
                  />
                  <div className="mt-2">
                    <div className={`font-semibold text-sm ${primaryText} truncate`}>{pl.name}</div>
                    <div className={`text-xs ${secondaryText} truncate`}>{pl.tracks.total} songs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Song Search */}
          <div className={`border-t ${borderColor} pt-4`}>
            <SongSearch
              token={token}
              deviceId={deviceId}
              onTrackPlay={(trackInfo) => {
                console.log("Track played from search:", trackInfo);
              }}
              onSearchPlay={(results) => {
                setSearchQueue(results);
              }}
            />
          </div>

          {/* Hidden Spotify Player for SDK functionality */}
          <SpotifyPlayer token={token} onStateChange={handleStateChange} onDeviceReady={setDeviceId} />
        </>
      )}
    </div>
  );
};

export default SpotifySidebar;
