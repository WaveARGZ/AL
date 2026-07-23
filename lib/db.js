import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";

// Store the SQLite file under /data so it persists between runs.
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "friends.db");

// Reuse a single connection across hot reloads in dev.
const globalForDb = globalThis;
const db = globalForDb.__friendsDb ?? new Database(dbPath);
globalForDb.__friendsDb = db;

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS friends (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT,
    phone      TEXT,
    note       TEXT,
    favorite   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed A / B / C / D once, on an empty table.
const count = db.prepare("SELECT COUNT(*) AS n FROM friends").get().n;
if (count === 0) {
  const insert = db.prepare(
    "INSERT INTO friends (name, email, phone, note, favorite) VALUES (@name, @email, @phone, @note, @favorite)"
  );
  const seed = [
    { name: "Aさん", email: "a@example.com", phone: "090-1000-0001", note: "学生時代からの友達", favorite: 1 },
    { name: "Bさん", email: "b@example.com", phone: "090-1000-0002", note: "職場の同僚", favorite: 0 },
    { name: "Cさん", email: "c@example.com", phone: "090-1000-0003", note: "テニスサークル仲間", favorite: 1 },
    { name: "Dさん", email: "d@example.com", phone: "090-1000-0004", note: "ご近所さん", favorite: 0 },
  ];
  const seedAll = db.transaction((rows) => rows.forEach((r) => insert.run(r)));
  seedAll(seed);
}

export function listFriends() {
  return db
    .prepare("SELECT * FROM friends ORDER BY favorite DESC, id ASC")
    .all();
}

export function getFriend(id) {
  return db.prepare("SELECT * FROM friends WHERE id = ?").get(id);
}

export function createFriend({ name, email, phone, note, favorite }) {
  const info = db
    .prepare(
      "INSERT INTO friends (name, email, phone, note, favorite) VALUES (?, ?, ?, ?, ?)"
    )
    .run(name, email ?? null, phone ?? null, note ?? null, favorite ? 1 : 0);
  return getFriend(info.lastInsertRowid);
}

export function updateFriend(id, fields) {
  const current = getFriend(id);
  if (!current) return null;
  const merged = { ...current, ...fields };
  db.prepare(
    "UPDATE friends SET name = ?, email = ?, phone = ?, note = ?, favorite = ? WHERE id = ?"
  ).run(
    merged.name,
    merged.email ?? null,
    merged.phone ?? null,
    merged.note ?? null,
    merged.favorite ? 1 : 0,
    id
  );
  return getFriend(id);
}

export function deleteFriend(id) {
  return db.prepare("DELETE FROM friends WHERE id = ?").run(id).changes > 0;
}

export default db;
