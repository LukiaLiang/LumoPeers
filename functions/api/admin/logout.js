import { json, requireAdmin } from '../../_lib/common.js';

export async function onRequestPost(context) {
  try {
    const auth = await requireAdmin(context);
    if (auth.error) return auth.error;

    await context.env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?')
      .bind(auth.token)
      .run();

    return json({ success: true });
  } catch (error) {
    return json({ message: error.message || '服务器内部错误' }, 500);
  }
}
