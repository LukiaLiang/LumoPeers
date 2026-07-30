import { ensureSchema, json, requireAdmin } from '../../_lib/common.js';

export async function onRequestGet(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth.error) return auth.error;

    await ensureSchema(context.env);
    const result = await context.env.DB.prepare(
      `SELECT id, username, type, status, submitted_at, reviewed_by, reviewed_at, admin_decision
       FROM registration_apps
       ORDER BY submitted_at DESC`
    ).all();

    const apps = (result.results || []).map((app) => ({
      id: app.id,
      username: app.username,
      type: app.type,
      status: app.status,
      submittedAt: app.submitted_at,
      reviewedBy: app.reviewed_by,
      reviewedAt: app.reviewed_at,
      adminDecision: app.admin_decision
    }));

    return json({ apps });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
