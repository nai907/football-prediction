import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { createServer } from "http";
import { Server } from "socket.io";

const url = "https://api.football-data.org/v4/teams/66/matches";
const FOOTBALL_API_TOKEN = "";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

/* =========================
   HTTP + SOCKET SETUP
========================= */
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

/* =========================
   MYSQL CONNECTION POOL
========================= */
const db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "football_app",
    waitForConnections: true,
    connectionLimit: 10
});

/* =========================
   SOCKET CONNECTION
========================= */
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

/* =========================
   MATCHES ENDPOINT
========================= */
app.get("/matches", async (req, res) => {
    try {
        const response = await fetch(url, {
            headers: {
                "X-Auth-Token": FOOTBALL_API_TOKEN
            }
        });

        const data = await response.json();

        const matches = data.matches.map(match => ({
            matchday: match.matchday,
            homeTeam: match.homeTeam.shortName,
            awayTeam: match.awayTeam.shortName,
            homeScore: match.score.fullTime.home,
            awayScore: match.score.fullTime.away
        }));

        // 🔥 broadcast to all connected clients
        io.emit("matchesUpdate", matches);

        res.json(matches);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch matches" });
    }
});

/* =========================
   LEADERBOARD - GET
========================= */
app.get("/leaderboard", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM leaderboard ORDER BY score DESC"
        );

        res.json(rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "DB error" });
    }
});

/* =========================
   LEADERBOARD - POST (UPSERT)
========================= */
app.post("/leaderboard", async (req, res) => {
    try {
        const { username, score } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Username required" });
        }

        await db.query(
            `
            INSERT INTO leaderboard (username, score)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE score = ?
            `,
            [username, score, score]
        );

        // 🔥 notify frontend in real-time
        const [rows] = await db.query(
            "SELECT * FROM leaderboard ORDER BY score DESC"
        );

        io.emit("leaderboardUpdate", rows);

        res.json({ message: "Score saved successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "DB error" });
    }
});

/* =========================
   START SERVER (IMPORTANT CHANGE)
========================= */
httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});