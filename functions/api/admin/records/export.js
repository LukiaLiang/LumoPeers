import { ensureSchema, escapeCsvCell, normalizeRecord, requireAdmin } from '../../../_lib/common.js';

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

    const header = ['ID', '提交时间', '来源', '姓名', '性别', '学校', '院系', '年级', '毕业届', '电话', '微信', '问卷答案'];
    const rows = records.map((record) => {
      const info = record.info || {};
      return [
        record.id,
        record.submitTime,
        record.source || 'guest',
        info.name || '',
        info.gender || '',
        info.school || '',
        info.department || '',
        info.grade || '',
        info.graduation || '',
        info.phone || '',
        info.wechat || '',
        JSON.stringify(record.questionnaireAnswers || {})
      ].map(escapeCsvCell).join(',');
    });

    const csv = [header.map(escapeCsvCell).join(','), ...rows].join('\n');
    return new Response(csv, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename="records-export.csv"'
      }
    });
  } catch (error) {
    return Response.json({ message: error.message || '服务器内部错误' }, { status: 500 });
  }
}
