import Database from 'better-sqlite3';
import path from 'node:path';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

export function initDb(dbPath?: string): Database.Database {
  const resolvedPath = dbPath ?? path.join(process.cwd(), 'data', 'dashboard.db');
  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'viewer',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined as unknown as Database.Database;
  }
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  created_at: string;
}

export function createUser(email: string, hashedPassword: string): User {
  const d = getDb();
  const count = d.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  const role = count.cnt === 0 ? 'admin' : 'viewer';
  const stmt = d.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
  const result = stmt.run(email, hashedPassword, role);
  return d.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
}

export function findUserByEmail(email: string): User | undefined {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
}

export function getAllUsers(): Omit<User, 'password'>[] {
  return getDb().prepare('SELECT id, email, role, created_at FROM users').all() as Omit<User, 'password'>[];
}

export function deleteUser(id: number): boolean {
  const result = getDb().prepare('DELETE FROM users WHERE id = ?').run(id);
  return result.changes > 0;
}
