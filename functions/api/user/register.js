import { ensureSchema, hashPassword, json, readJson } from '../../_lib/common.js';

export async function onRequestPost(context) {
  try {
    await ensureSchema(context.env);
    const body = await readJson(context.request);
    const { username, password, type } = body || {};
    const cleanType = ['A', 'B', 'C', 'D'].includes(type) ? type : 'B';

    if (!username || !password) {
      return json({ message: '用户名和密码不能为空' }, 400);
    }
    if (password.length < 6) {
      return json({ message: '密码至少 6 位' }, 400);
    }

    const existingAccount = await context.env.DB.prepare('SELECT username FROM user_accounts WHERE username = ?')
      .bind(username)
      .first();
    if (existingAccount) {
      return json({ message: '该用户名已被占用' }, 409);
    }

    const existingPending = await context.env.DB.prepare(
      'SELECT id FROM registration_apps WHERE username = ? AND status = ?'
    ).bind(username, 'pending').first();
    if (existingPending) {
      return json({ message: '该用户名已有待审核申请' }, 409);
    }

    const id = 'app_' + Date.now() + '_' + Math.floor(Math.random() * 9000 + 1000);
    const { hash, salt } = await hashPassword(password);
    await context.env.DB.prepare(
      `INSERT INTO registration_apps
       (id, username, password_hash, salt, type, status, submitted_at, reviewed_by, reviewed_at, admin_decision)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL)`
    ).bind(id, username, hash, salt, cleanType, 'pending', new Date().toISOString()).run();

    return json({ success: true, id });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
