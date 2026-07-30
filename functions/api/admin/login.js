import {
  cleanupExpiredSessions,
  createAdminSession,
  ensureSchema,
  json,
  readJson,
  verifyPassword
} from '../../_lib/common.js';

export async function onRequestPost(context) {
  try {
    await ensureSchema(context.env);
    const body = await readJson(context.request);
    const { username, password } = body || {};

    if (!username || !password) {
      return json({ message: '用户名和密码不能为空' }, 400);
    }

    const admin = await context.env.DB.prepare(
      'SELECT username, password_hash, salt FROM admins WHERE username = ?'
    ).bind(username).first();

    if (!admin || !(await verifyPassword(password, admin.salt, admin.password_hash))) {
      return json({ message: '用户名或密码错误' }, 401);
    }

    await cleanupExpiredSessions(context.env);
    const token = await createAdminSession(context.env, username);

    return json({ success: true, token, username });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
