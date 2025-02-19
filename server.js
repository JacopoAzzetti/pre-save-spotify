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
const ALBUM_ID = '6FSbKS6KuV7xMkpYX5xRx7';

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
        // Scambio del 'code' con un 'access_token'
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

        // Ora che abbiamo il token, facciamo la richiesta per aggiungere l'album
        await axios.put(`https://api.spotify.com/v1/me/albums`, { ids: [ALBUM_ID] }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Invia una risposta di successo, puoi anche fare un redirect qui se lo desideri
        res.send("Album aggiunto alla tua libreria con successo!");

    } catch (error) {
        console.error(error);
        res.send("Errore nell'autenticazione o nell'aggiunta dell'album");
    }
});

app.listen(3000, () => console.log("Server avviato su http://localhost:3000"));
