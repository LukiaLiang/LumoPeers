import { calculateStats, ensureSchema, json, normalizeRecord, requireAdmin } from '../../_lib/common.js';

export async function onRequestGet(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth.error) return auth.error;

    await ensureSchema(context.env);
    const url = new URL(context.request.url);
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();

    const result = await context.env.DB.prepare(
      'SELECT id, info_json, answers_json, source, submit_time FROM records ORDER BY submit_time DESC'
    ).all();

    const records = (result.results || [])
      .map(normalizeRecord)
      .filter((record) => {
        if (!q) return true;
        const info = record.info || {};
        return [info.name, info.school, info.department, info.grade, info.graduation, info.phone, info.wechat]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q));
      });

    return json({ records, stats: calculateStats(records) });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
