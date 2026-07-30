const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 120000;

let schemaReady = false;

export function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers
    }
  });
}

export function methodNotAllowed() {
  return json({ message: 'Method not allowed' }, 405, { Allow: 'GET, POST, DELETE, OPTIONS' });
}

export function requireDb(env) {
  if (!env.DB) {
    throw new Error('D1 database binding DB is not configured');
  }
  return env.DB;
}

export async function ensureSchema(env) {
  if (schemaReady) return;
  const db = requireDb(env);
  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      info_json TEXT NOT NULL,
      answers_json TEXT NOT NULL,
      source TEXT NOT NULL,
      submit_time TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_accounts (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      type TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS registration_apps (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      reviewed_by TEXT,
      reviewed_at TEXT,
      admin_decision TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_records_submit_time ON records(submit_time);
    CREATE INDEX IF NOT EXISTS idx_registration_apps_status ON registration_apps(status);
  `);
  schemaReady = true;
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const auth = request.headers.get('Authorization') || '';
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

export async function requireAdmin(context) {
  await ensureSchema(context.env);
  const token = getTokenFromRequest(context.request);
  if (!token) {
    return { error: json({ message: '未登录或会话失效' }, 401) };
  }

  const now = new Date().toISOString();
  const session = await context.env.DB.prepare(
    'SELECT token, username, expires_at FROM admin_sessions WHERE token = ?'
  ).bind(token).first();

  if (!session || session.expires_at <= now) {
    if (session) {
      await context.env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
    }
    return { error: json({ message: '未登录或会话失效' }, 401) };
  }

  return { token, username: session.username };
}

export async function createAdminSession(env, username) {
  const token = crypto.randomUUID();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_MS);

  await env.DB.prepare(
    'INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(token, username, createdAt.toISOString(), expiresAt.toISOString()).run();

  return token;
}

export async function cleanupExpiredSessions(env) {
  await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?')
    .bind(new Date().toISOString())
    .run();
}

export function normalizeRecord(row) {
  const info = safeJsonParse(row.info_json, {});
  return {
    id: row.id,
    info,
    questionnaireAnswers: safeJsonParse(row.answers_json, {}),
    source: row.source || 'guest',
    submitTime: row.submit_time
  };
}

export function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

export function calculateStats(records) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: records.length,
    today: records.filter((record) => record.submitTime.slice(0, 10) === today).length,
    male: records.filter((record) => record.info && record.info.gender === '男').length,
    female: records.filter((record) => record.info && record.info.gender === '女').length
  };
}

export function escapeCsvCell(value) {
  if (value == null) return '';
  const raw = String(value);
  return raw.includes(',') || raw.includes('"') || raw.includes('\n')
    ? '"' + raw.replace(/"/g, '""') + '"'
    : raw;
}

export function timingSafeEqualText(a, b) {
  const left = new TextEncoder().encode(String(a || ''));
  const right = new TextEncoder().encode(String(b || ''));
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}

export async function hashPassword(password, salt = randomHex(16)) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations: PBKDF2_ITERATIONS
    },
    key,
    256
  );
  return { salt, hash: bufferToHex(bits) };
}

export async function verifyPassword(password, salt, expectedHash) {
  const { hash } = await hashPassword(password, salt);
  return timingSafeEqualText(hash, expectedHash);
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
