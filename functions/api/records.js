import { ensureSchema, json, readJson } from '../_lib/common.js';

export async function onRequestPost(context) {
  try {
    await ensureSchema(context.env);
    const body = await readJson(context.request);
    const { info, questionnaireAnswers, source } = body || {};

    if (!info || !questionnaireAnswers) {
      return json({ message: '缺少问卷信息' }, 400);
    }

    const id = crypto.randomUUID();
    const submitTime = new Date().toISOString();
    const cleanSource = source === 'user' ? 'user' : 'guest';

    await context.env.DB.prepare(
      'INSERT INTO records (id, info_json, answers_json, source, submit_time) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      id,
      JSON.stringify(info),
      JSON.stringify(questionnaireAnswers),
      cleanSource,
      submitTime
    ).run();

    return json({ success: true, id });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
