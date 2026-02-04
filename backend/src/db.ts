import { Database } from "bun:sqlite";

const db = new Database("game.sqlite");

db.run(`CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
		title TEXT,
    initial_prompt TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER,
    role TEXT,
    content TEXT,
    game_time TEXT,
    core_info TEXT
)`);

export default db;