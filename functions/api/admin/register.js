import {
  ensureSchema,
  hashPassword,
  json,
  readJson,
  timingSafeEqualText
} from '../../_lib/common.js';

export async function onRequestPost(context) {
  try {
    await ensureSchema(context.env);
    const body = await readJson(context.request);
    const { username, password, registerKey } = body || {};
    const expectedKey = context.env.ADMIN_REGISTER_KEY;

    if (!expectedKey || !timingSafeEqualText(registerKey, expectedKey)) {
      return json({ message: '管理员校验码错误' }, 403);
    }
    if (!username || !password) {
      return json({ message: '用户名和密码不能为空' }, 400);
    }
    if (password.length < 6) {
      return json({ message: '密码长度至少 6 位' }, 400);
    }

    const existing = await context.env.DB.prepare('SELECT username FROM admins WHERE username = ?')
      .bind(username)
      .first();
    if (existing) {
      return json({ message: '用户名已存在' }, 409);
    }

    const { hash, salt } = await hashPassword(password);
    await context.env.DB.prepare(
      'INSERT INTO admins (username, password_hash, salt, created_at) VALUES (?, ?, ?, ?)'
    ).bind(username, hash, salt, new Date().toISOString()).run();

    return json({ success: true });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
