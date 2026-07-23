import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = process.env.VERCEL
    ? "/tmp/leaderboard.db"
    : path.join(process.cwd(), "data", "leaderboard.db");

let db;

export function getDb() {
    if (!db) {
        fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

        db = new Database(DB_PATH);
        db.exec(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                score INTEGER NOT NULL DEFAULT 0
            )
        `);
    }
    return db;
}
