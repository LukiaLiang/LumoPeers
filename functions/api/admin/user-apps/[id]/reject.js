import { ensureSchema, json, requireAdmin } from '../../../../_lib/common.js';

export async function onRequestPost(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth.error) return auth.error;

    await ensureSchema(context.env);
    const app = await context.env.DB.prepare(
      'SELECT id, username, status FROM registration_apps WHERE id = ?'
    ).bind(context.params.id).first();

    if (!app) {
      return json({ message: '未找到申请' }, 404);
    }
    if (app.status !== 'pending') {
      return json({ message: '该申请已处理' }, 409);
    }

    await context.env.DB.prepare(
      `UPDATE registration_apps
       SET status = ?, reviewed_by = ?, reviewed_at = ?, admin_decision = ?
       WHERE id = ?`
    ).bind('rejected', auth.username, new Date().toISOString(), 'rejected', app.id).run();

    return json({ success: true });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
