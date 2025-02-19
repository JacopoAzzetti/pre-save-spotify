require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// URL per avviare il login con Spotify
app.get("/login", (req, res) => {
    const scope = "user-library-modify user-library-read"; // Permesso per salvare album
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${scope}`;
    res.redirect(authUrl);
});

// Callback dopo il login (scambia il codice per un token)
app.get("/callback", async (req, res) => {
    const code = req.query.code;

    try {
        const tokenResponse = await axios.post("https://accounts.spotify.com/api/token", null, {
            params: {
                grant_type: "authorization_code",
                code,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            },
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const accessToken = tokenResponse.data.access_token;
        res.redirect(`${FRONTEND_URL}?token=${accessToken}`);
    } catch (error) {
        console.error(error);
        res.send("Errore nell'autenticazione");
    }
});

// Endpoint per salvare l'album
app.post("/presave", async (req, res) => {
    const { token, albumId } = req.body;

    try {
        await axios.put(`https://api.spotify.com/v1/me/albums`, { ids: [albumId] }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, error: error.response.data });
    }
});

app.listen(3000, () => console.log("Server avviato su http://localhost:3000"));
