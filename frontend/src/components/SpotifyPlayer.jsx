// SpotifyPlayer.jsx
import React, { useState, useEffect } from 'react';

const SpotifyPlayer = ({ token, onStateChange, onDeviceReady }) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    // Load the Spotify SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Web Playback SDK Player',
        getOAuthToken: (cb) => { cb(token); },
        volume: 0.5
      });

      // When ready, send the device_id to parent component
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        if (onDeviceReady) onDeviceReady(device_id);
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      spotifyPlayer.addListener('player_state_changed', (state) => {
        if (state) {
          onStateChange(state);
        }
      });

      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log('Spotify Player connected successfully');
          setPlayer(spotifyPlayer);
        }
      });

      // Cleanup on unmount
      return () => {
        spotifyPlayer.disconnect();
      };
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [token, onStateChange, onDeviceReady]);

  return null;
};

export default SpotifyPlayer;
