// backend/src/routes/spotify.route.js
import express from "express";
import axios from "axios";
import querystring from "querystring";

const router = express.Router();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
console.log("Client ID from env:", client_id);
router.get("/login", (req, res) => {
  const scopes = [
    "streaming",
    "user-read-private",
    "user-read-email",
    "user-modify-playback-state",
  ];

  const authorizeUrl =
    "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id,
      scope: scopes.join(" "),
      redirect_uri,
    });

  res.redirect(authorizeUrl);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code || null;
  if (!code) {
    return res.status(400).send("No code provided in callback");
  }

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(client_id + ":" + client_secret).toString("base64"),
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    console.log("Spotify Access Token:", access_token);
    console.log("Spotify Refresh Token:", refresh_token);

    // Redirect to the frontend with tokens in query parameters (adjust as needed)
    res.redirect(
      "http://localhost:5173/settings?" +
        querystring.stringify({
          access_token,
          refresh_token,
          expires_in,
        })
    );
  } catch (error) {
    console.error("Error exchanging code for tokens:", error.response?.data || error);
    res.status(500).send("Error getting tokens from Spotify");
  }
});

export default router;
