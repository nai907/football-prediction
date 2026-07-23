import { getDb } from "./_db.js";

export default function handler(req, res) {
    const db = getDb();

    if (req.method === "GET") {
        try {
            const rows = db.prepare(
                "SELECT username, score FROM leaderboard ORDER BY score DESC"
            ).all();
            return res.status(200).json(rows);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "DB error" });
        }
    }

    if (req.method === "POST") {
        try {
            const { username, score } = req.body || {};

            if (!username) {
                return res.status(400).json({ error: "Username required" });
            }

            db.prepare(`
                INSERT INTO leaderboard (username, score)
                VALUES (?, ?)
                ON CONFLICT(username) DO UPDATE SET score = excluded.score
            `).run(username, score ?? 0);

            const rows = db.prepare(
                "SELECT username, score FROM leaderboard ORDER BY score DESC"
            ).all();

            return res.status(200).json(rows);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "DB error" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: "Method not allowed" });
}
