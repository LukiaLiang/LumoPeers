import { ensureSchema, json, normalizeRecord, requireAdmin } from '../../../_lib/common.js';

export async function onRequestGet(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth.error) return auth.error;

    await ensureSchema(context.env);
    const record = await context.env.DB.prepare(
      'SELECT id, info_json, answers_json, source, submit_time FROM records WHERE id = ?'
    ).bind(context.params.id).first();

    if (!record) {
      return json({ message: '记录不存在' }, 404);
    }

    return json(normalizeRecord(record));
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth.error) return auth.error;

    await ensureSchema(context.env);
    const existing = await context.env.DB.prepare('SELECT id FROM records WHERE id = ?')
      .bind(context.params.id)
      .first();

    if (!existing) {
      return json({ message: '记录不存在' }, 404);
    }

    await context.env.DB.prepare('DELETE FROM records WHERE id = ?')
      .bind(context.params.id)
      .run();

    return json({ success: true });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
