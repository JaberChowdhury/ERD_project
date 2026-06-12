import { Database } from "bun:sqlite";
import path from 'path';

// Define the path to the SQLite file
// In a real production deployment on a persistent server, this file should be stored outside the build dir.
const dbPath = path.join(process.cwd(), 'links.db');

const db = new Database(dbPath);

// Initialize the table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export function saveLink(id: string, payload: string) {
  const stmt = db.prepare('INSERT INTO links (id, payload) VALUES (?, ?)');
  stmt.run(id, payload);
}

export function getLink(id: string): string | null {
  const stmt = db.prepare('SELECT payload FROM links WHERE id = ?');
  const row = stmt.get(id) as { payload: string } | undefined;
  return row ? row.payload : null;
}
