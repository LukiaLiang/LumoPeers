const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_REGISTER_KEY = 'WG2026@SecretKey';

const adminDB = new Map();
const recordsDB = new Map();
const authSessions = new Map();
const userAccountsDB = new Map();
const registrationAppsDB = new Map();

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function getTokenFromRequest(req) {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth) {
        return null;
    }

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

function authMiddleware(req, res, next) {
    const token = getTokenFromRequest(req);
    if (!token || !authSessions.has(token)) {
        return res.status(401).json({ message: '未登录或会话失效' });
    }
    req.admin = { username: authSessions.get(token) };
    next();
}

app.post('/api/records', (req, res) => {
    const { info, questionnaireAnswers, source } = req.body;
    if (!info || !questionnaireAnswers) {
        return res.status(400).json({ message: '缺少问卷信息' });
    }

    const id = crypto.randomUUID();
    const submitTime = new Date().toISOString();
    const record = {
        id,
        info,
        questionnaireAnswers,
        source: source || 'guest',
        submitTime
    };

    recordsDB.set(id, record);
    res.json({ success: true, id });
});

app.post('/api/admin/register', async (req, res) => {
    const { username, password, registerKey } = req.body;
    if (registerKey !== ADMIN_REGISTER_KEY) {
        return res.status(403).json({ message: '管理员校验码错误' });
    }
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    if (adminDB.has(username)) {
        return res.status(409).json({ message: '用户名已存在' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    adminDB.set(username, { username, passwordHash });

    res.json({ success: true });
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    const admin = adminDB.get(username);
    if (!admin) {
        return res.status(401).json({ message: '用户名或密码错误' });
    }

    const matched = await bcrypt.compare(password, admin.passwordHash);
    if (!matched) {
        return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = crypto.randomUUID();
    authSessions.set(token, username);

    res.json({ success: true, token, username });
});

app.post('/api/admin/logout', authMiddleware, (req, res) => {
    const token = getTokenFromRequest(req);
    if (token) {
        authSessions.delete(token);
    }
    res.json({ success: true });
});

app.get('/api/admin/records', authMiddleware, (req, res) => {
    const q = req.query.q ? String(req.query.q).trim().toLowerCase() : '';
    const records = [...recordsDB.values()].filter(record => {
        if (!q) return true;
        const info = record.info || {};
        return [info.name, info.school, info.department, info.grade, info.graduation, info.phone, info.wechat]
            .filter(Boolean)
            .some(field => String(field).toLowerCase().includes(q));
    }).sort((a, b) => b.submitTime.localeCompare(a.submitTime));

    const today = new Date().toISOString().slice(0, 10);
    const stats = {
        total: records.length,
        today: records.filter(r => r.submitTime.slice(0, 10) === today).length,
        male: records.filter(r => r.info && r.info.gender === '男').length,
        female: records.filter(r => r.info && r.info.gender === '女').length
    };

    res.json({ records, stats });
});

app.get('/api/admin/records/export', authMiddleware, (req, res) => {
    const q = req.query.q ? String(req.query.q).trim().toLowerCase() : '';
    const records = [...recordsDB.values()].filter(record => {
        if (!q) return true;
        const info = record.info || {};
        return [info.name, info.school, info.department, info.grade, info.graduation, info.phone, info.wechat]
            .filter(Boolean)
            .some(field => String(field).toLowerCase().includes(q));
    }).sort((a, b) => b.submitTime.localeCompare(a.submitTime));

    const escapeCell = value => {
        if (value == null) return '';
        const raw = String(value);
        return raw.includes(',') || raw.includes('"') || raw.includes('\n')
            ? '"' + raw.replace(/"/g, '""') + '"'
            : raw;
    };

    const header = ['ID', '提交时间', '来源', '姓名', '性别', '学校', '院系', '年级', '毕业届', '电话', '微信', '问卷答案'];
    const rows = records.map(record => {
        const info = record.info || {};
        const questionnaire = JSON.stringify(record.questionnaireAnswers || {});
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
            questionnaire
        ].map(escapeCell).join(',');
    });

    const csv = [header.map(escapeCell).join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="records-export.csv"');
    res.send(csv);
});

app.get('/api/admin/records/:id', authMiddleware, (req, res) => {
    const record = recordsDB.get(req.params.id);
    if (!record) {
        return res.status(404).json({ message: '记录不存在' });
    }
    res.json(record);
});

app.delete('/api/admin/records/:id', authMiddleware, (req, res) => {
    if (!recordsDB.has(req.params.id)) {
        return res.status(404).json({ message: '记录不存在' });
    }
    recordsDB.delete(req.params.id);
    res.json({ success: true });
});

app.post('/api/user/register', async (req, res) => {
    const { username, password, type } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: '密码至少 6 位' });
    }
    if (userAccountsDB.has(username)) {
        return res.status(409).json({ message: '该用户名已被占用' });
    }

    const pending = [...registrationAppsDB.values()].find(app => app.username === username && app.status === 'pending');
    if (pending) {
        return res.status(409).json({ message: '该用户名已有待审核申请' });
    }

    const id = 'app_' + Date.now() + '_' + Math.floor(Math.random() * 9000 + 1000);
    const passwordHash = await bcrypt.hash(password, 10);
    const app = {
        id,
        username,
        passwordHash,
        type: ['A', 'B', 'C', 'D'].includes(type) ? type : 'B',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null,
        adminDecision: null
    };
    registrationAppsDB.set(id, app);
    res.json({ success: true, id });
});

app.post('/api/user/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    const account = userAccountsDB.get(username);
    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
        return res.status(401).json({ message: '用户名或密码错误，或账号尚未通过审核' });
    }

    res.json({ success: true, username, type: account.type || null });
});

app.get('/api/admin/user-apps', authMiddleware, (req, res) => {
    const apps = [...registrationAppsDB.values()]
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        .map(app => ({
            id: app.id,
            username: app.username,
            type: app.type,
            status: app.status,
            submittedAt: app.submittedAt,
            reviewedBy: app.reviewedBy,
            reviewedAt: app.reviewedAt,
            adminDecision: app.adminDecision
        }));
    res.json({ apps });
});

app.post('/api/admin/user-apps/:id/approve', authMiddleware, (req, res) => {
    const app = registrationAppsDB.get(req.params.id);
    if (!app) {
        return res.status(404).json({ message: '未找到申请' });
    }
    if (app.status !== 'pending') {
        return res.status(409).json({ message: '该申请已处理' });
    }

    if (!userAccountsDB.has(app.username)) {
        userAccountsDB.set(app.username, {
            username: app.username,
            passwordHash: app.passwordHash,
            type: app.type
        });
    }
    app.status = 'approved';
    app.reviewedBy = req.admin.username;
    app.reviewedAt = new Date().toISOString();
    app.adminDecision = 'approved';
    registrationAppsDB.set(app.id, app);
    res.json({ success: true });
});

app.post('/api/admin/user-apps/:id/reject', authMiddleware, (req, res) => {
    const app = registrationAppsDB.get(req.params.id);
    if (!app) {
        return res.status(404).json({ message: '未找到申请' });
    }
    if (app.status !== 'pending') {
        return res.status(409).json({ message: '该申请已处理' });
    }

    app.status = 'rejected';
    app.reviewedBy = req.admin.username;
    app.reviewedAt = new Date().toISOString();
    app.adminDecision = 'rejected';
    registrationAppsDB.set(app.id, app);
    res.json({ success: true });
});

app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: '接口未找到' });
    }
    next();
});

app.use((err, req, res, next) => {
    console.error(err.stack || err);
    res.status(500).json({ message: '服务器内部错误' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
