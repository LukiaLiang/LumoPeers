import { ensureSchema, json, readJson, verifyPassword } from '../../_lib/common.js';

export async function onRequestPost(context) {
  try {
    await ensureSchema(context.env);
    const body = await readJson(context.request);
    const { username, password } = body || {};

    if (!username || !password) {
      return json({ message: '用户名和密码不能为空' }, 400);
    }

    const account = await context.env.DB.prepare(
      'SELECT username, password_hash, salt, type FROM user_accounts WHERE username = ?'
    ).bind(username).first();

    if (!account || !(await verifyPassword(password, account.salt, account.password_hash))) {
      return json({ message: '用户名或密码错误，或账号尚未通过审核' }, 401);
    }

    return json({ success: true, username: account.username, type: account.type || null });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
