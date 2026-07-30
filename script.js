document.addEventListener('DOMContentLoaded', function() {
    const homePage = document.getElementById('home-page');
    const membersPage = document.getElementById('members-page');
    const questionnairePage = document.getElementById('questionnaire-page');
    const infoPage = document.getElementById('info-page');
    const thankyouPage = document.getElementById('thankyou-page');
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const adminPage = document.getElementById('admin-page');
    const adminDetailPage = document.getElementById('admin-detail-page');

    const membersBtn = document.getElementById('members-btn');
    const questionnaireBtn = document.getElementById('questionnaire-btn');
    const membersBackBtn = document.getElementById('members-back-btn');
    const questionnaireBackBtn = document.getElementById('questionnaire-back-btn');
    const infoBackBtn = document.getElementById('info-back-btn');
    const infoSubmitBtn = document.getElementById('info-submit-btn');
    const thankyouHomeBtn = document.getElementById('thankyou-home-btn');
    const loginBackBtn = document.getElementById('login-back-btn');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const registerBackBtn = document.getElementById('register-back-btn');
    const registerSubmitBtn = document.getElementById('register-submit-btn');
    const openRegisterBtn = document.getElementById('open-register-btn');
    const adminBackBtn = document.getElementById('admin-back-btn');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const detailBackBtn = document.getElementById('detail-back-btn');
    const adminEntry = document.getElementById('admin-entry');
    const adminExportBtn = document.getElementById('admin-export-btn');
    const adminSearchInput = document.getElementById('admin-search-input');

    const membersContainer = document.querySelector('.members-container');
    const progressFill = document.getElementById('progress-fill');
    const completedCount = document.getElementById('completed-count');
    const submitBtn = document.getElementById('submit-btn');
    const registerUsername = document.getElementById('register-username');
    const registerPassword = document.getElementById('register-password');
    const registerConfirmPassword = document.getElementById('register-confirm-password');
    const registerKeyInput = document.getElementById('register-key');

    const userLoginUsername = document.getElementById('login-username');
    const userLoginPassword = document.getElementById('login-password');

    const API_BASE = (window.location.protocol === 'file:' || window.location.origin === 'null')
        ? 'http://localhost:3000'
        : window.location.origin;

    let currentQuestionnaireAnswers = null;
    let currentViewingRecordId = null;
    let isAdminLoggedIn = false;
    let adminToken = null;
    let adminUsername = '';

    let isUserLoggedIn = false;
    let loggedInUser = '';
    let loggedInUserType = null;
    let userAccessMode = 'login';
    const USER_SESSION_KEY = 'userSession';
    const USER_ACCOUNTS_KEY = 'userAccounts';

    const userEntry = document.getElementById('user-entry');
    const loginEntryBtn = document.getElementById('login-entry-btn');
    const registerEntryBtn = document.getElementById('register-entry-btn');
    const guestEntryBtn = document.getElementById('guest-entry-btn');
    const userAccessModal = document.getElementById('user-access-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const closeUserModalBtn = document.getElementById('close-user-modal');
    const userModalTitle = document.getElementById('user-modal-title');
    const userModalUsername = document.getElementById('user-modal-username');
    const userModalPassword = document.getElementById('user-modal-password');
    const userModalSubmit = document.getElementById('user-modal-submit');
    const switchRegisterBtn = document.getElementById('switch-register');

    const studentsData = [
        {
            category: '沉迷游戏类',
            students: ['x', 'x', 'x']
        },
        {
            category: '学业困难类',
            students: ['x', 'x', 'x', 'x']
        },
        {
            category: '心态躺平类',
            students: ['x', 'x']
        }
    ];

    const questionnaireData = {
        section1: [
            { id: 's1q1', text: '我最近很难产生学习的兴趣。' },
            { id: 's1q2', text: '即使知道应该学习，我也提不起劲。' },
            { id: 's1q3', text: '我觉得努力学习没有什么意义。' },
            { id: 's1q4', text: '我经常觉得"以后再说"。' },
            { id: 's1q5', text: '我已经很久没有因为学习获得成就感。' }
        ],
        section2: [
            { id: 's2q1', text: '我经常拖到最后才开始复习。' },
            { id: 's2q2', text: '我知道应该做什么，但就是做不到。' },
            { id: 's2q3', text: '我经常因为手机、游戏而中断学习。' },
            { id: 's2q4', text: '我很难坚持每天学习。' },
            { id: 's2q5', text: '我的作息影响了学习。' }
        ],
        section3: [
            { id: 's3q1', text: '我经常怀疑自己是否适合这个专业。' },
            { id: 's3q2', text: '我最近经常觉得很压抑。' },
            { id: 's3q3', text: '我觉得自己比别人差很多。' },
            { id: 's3q4', text: '我害怕面对考试。' },
            { id: 's3q5', text: '我觉得很多事情已经无法改变。' }
        ],
        section4: [
            { id: 's4q1', text: '我遇到问题时，不知道可以找谁。' },
            { id: 's4q2', text: '我不太愿意主动向老师提问。' },
            { id: 's4q3', text: '我觉得自己融不进周围同学。' },
            { id: 's4q4', text: '我经常一个人待着。' },
            { id: 's4q5', text: '我觉得别人无法理解我。' }
        ],
        section5: [
            { id: 's5q1', text: '我不知道以后想做什么。' },
            { id: 's5q2', text: '我不知道现在为什么学习。' },
            { id: 's5q3', text: '我觉得每天只是完成任务。' },
            { id: 's5q4', text: '我没有长期目标。' },
            { id: 's5q5', text: '我不知道未来几年应该怎样规划。' }
        ],
        behavior: [
            { id: 'b1', text: '缺课' },
            { id: 'b2', text: '熬夜到3点以后' },
            { id: 'b3', text: '连续打游戏超过6小时' },
            { id: 'b4', text: '连续一天没有离开宿舍' },
            { id: 'b5', text: '因为害怕而没有参加考试' }
        ],
        severity: [
            { id: 'sevA', text: '我能够正常完成课程。' },
            { id: 'sevB', text: '我能够按时起床。' },
            { id: 'sevC', text: '我能够按计划学习。' },
            { id: 'sevD', text: '我愿意主动和别人交流。' },
            { id: 'sevE', text: '我觉得生活仍然有希望。' }
        ]
    };

    const likertLabels = ['完全不同意', '比较不同意', '一般', '比较同意', '完全同意'];
    let answers = {};

    function showPage(page) {
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        setTimeout(() => {
            page.classList.add('active');
        }, 50);
    }

    function showToast(message, duration) {
        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration || 3000);
    }

    function getStoredUser() {
        try {
            return JSON.parse(localStorage.getItem('adminSession') || 'null');
        } catch (e) {
            return null;
        }
    }

    function setStoredUser(user) {
        localStorage.setItem('adminSession', JSON.stringify(user));
    }

    function clearStoredUser() {
        localStorage.removeItem('adminSession');
    }

    function getAuthHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (adminToken) {
            headers.Authorization = 'Bearer ' + adminToken;
        }
        return headers;
    }

    function apiRequest(url, options = {}) {
        const fetchOptions = Object.assign({}, options, {
            credentials: 'include',
            headers: Object.assign({}, getAuthHeaders(), options.headers || {})
        });

        return fetch(API_BASE + url, fetchOptions).then(function(res) {
            if (res.status === 401 || res.status === 403) {
                showToast('请先登录管理员账号');
                showPage(loginPage);
                throw new Error('Unauthorized');
            }
            return res.json().then(function(data) {
                if (!res.ok) {
                    throw new Error(data && data.message ? data.message : ('HTTP ' + res.status));
                }
                return data;
            }, function() {
                if (!res.ok) {
                    throw new Error('HTTP ' + res.status);
                }
                return null;
            });
        }).catch(function(err) {
            if (err.message !== 'Unauthorized') {
                showToast('网络错误：' + err.message);
            }
            throw err;
        });
    }

    function apiRequestText(url) {
        return fetch(API_BASE + url, {
            credentials: 'include',
            headers: getAuthHeaders()
        }).then(function(res) {
            if (res.status === 401 || res.status === 403) {
                showToast('请先登录管理员账号');
                showPage(loginPage);
                throw new Error('Unauthorized');
            }
            if (!res.ok) {
                throw new Error('导出失败');
            }
            return res.text();
        }).catch(function(err) {
            if (err.message !== 'Unauthorized') {
                showToast('网络错误：' + err.message);
            }
            throw err;
        });
    }

    function loadAdminSession() {
        const session = getStoredUser();
        if (session && session.token) {
            isAdminLoggedIn = true;
            adminToken = session.token;
            adminUsername = session.username || '';
        }
    }

    function getStoredUserSession() {
        try {
            return JSON.parse(localStorage.getItem(USER_SESSION_KEY) || 'null');
        } catch (e) {
            return null;
        }
    }

    function setStoredUserSession(user) {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    }

    function clearStoredUserSession() {
        localStorage.removeItem(USER_SESSION_KEY);
    }

    function getStoredUserAccounts() {
        try {
            return JSON.parse(localStorage.getItem(USER_ACCOUNTS_KEY) || '{}');
        } catch (e) {
            return {};
        }
    }

    function setStoredUserAccounts(accounts) {
        localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    function getAccountInfo(accounts, username) {
        const account = accounts[username];
        if (!account) return null;
        if (typeof account === 'string') {
            return { password: account, type: null };
        }
        return account;
    }

    // registration applications storage
    const USER_APPS_KEY = 'userRegistrationApps';
    function getStoredRegistrationApps() {
        try {
            return JSON.parse(localStorage.getItem(USER_APPS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function setStoredRegistrationApps(apps) {
        localStorage.setItem(USER_APPS_KEY, JSON.stringify(apps));
    }

    function submitRegistrationApplication(username, password, type) {
        const apps = getStoredRegistrationApps();
        const id = 'app_' + Date.now() + '_' + Math.floor(Math.random() * 9000 + 1000);
        const app = {
            id: id,
            username: username,
            password: password,
            type: type, // 'A'|'B'|'C'|'D'
            status: 'pending',
            submittedAt: new Date().toISOString(),
            reviewedBy: null,
            reviewedAt: null,
            adminDecision: null
        };
        apps.unshift(app);
        setStoredRegistrationApps(apps);
        renderAdminReviewNotification();
        return app;
    }

    function updateUserEntryUI() {
        if (isUserLoggedIn) {
            userEntry.innerHTML = `
                <div class="user-status">
                    <span>欢迎，<strong>${loggedInUser}</strong>${loggedInUserType ? '（' + loggedInUserType + '类）' : ''}</span>
                    <button class="entry-btn entry-btn-outline" id="logout-entry-btn">退出登录</button>
                </div>
            `;
            const logoutEntryBtn = document.getElementById('logout-entry-btn');
            logoutEntryBtn.addEventListener('click', function() {
                logoutUser();
            });
        } else {
            userEntry.innerHTML = `
                <button class="entry-btn" id="login-entry-btn">登录</button>
                <button class="entry-btn entry-btn-outline" id="register-entry-btn">注册</button>
                <button class="entry-btn entry-btn-guest" id="guest-entry-btn">访客浏览</button>
            `;
            bindUserEntryButtons();
        }
    }

    function bindUserEntryButtons() {
        const loginButton = document.getElementById('login-entry-btn');
        const registerButton = document.getElementById('register-entry-btn');
        const guestButton = document.getElementById('guest-entry-btn');

        if (loginButton) {
            loginButton.addEventListener('click', function() {
                openUserAccessModal('login');
            });
        }
        if (registerButton) {
            registerButton.addEventListener('click', function() {
                openUserAccessModal('register');
            });
        }
        if (guestButton) {
            guestButton.addEventListener('click', function() {
                enterAsGuest();
            });
        }
    }

    function openUserAccessModal(mode) {
        userAccessMode = mode;
        userModalTitle.textContent = mode === 'login' ? '用户登录' : '用户注册';
        userModalSubmit.textContent = mode === 'login' ? '登录' : '提交申请';
        switchRegisterBtn.textContent = mode === 'login' ? '立即注册' : '已有账号，去登录';
        userModalUsername.value = '';
        userModalPassword.value = '';
        const regTypeField = document.getElementById('modal-reg-type');
        if (mode === 'register') {
            if (regTypeField) regTypeField.style.display = 'block';
        } else {
            if (regTypeField) regTypeField.style.display = 'none';
        }
        userAccessModal.classList.remove('hidden');
    }

    function closeUserAccessModal() {
        userAccessModal.classList.add('hidden');
    }

    function logoutUser() {
        isUserLoggedIn = false;
        loggedInUser = '';
        loggedInUserType = null;
        clearStoredUserSession();
        updateUserEntryUI();
        showToast('已退出登录');
    }

    function userAccessSubmit() {
        const username = userModalUsername.value.trim();
        const password = userModalPassword.value.trim();

        if (!username) {
            showToast('请输入用户名');
            return;
        }
        if (!password) {
            showToast('请输入密码');
            return;
        }

        if (userAccessMode === 'register') {
            if (password.length < 6) {
                showToast('密码至少 6 位');
                return;
            }
            const regTypeEl = document.getElementById('user-modal-type');
            const regType = regTypeEl ? regTypeEl.value : 'B';
            userModalSubmit.disabled = true;
            apiRequest('/api/user/register', {
                method: 'POST',
                body: JSON.stringify({ username: username, password: password, type: regType })
            }).then(function() {
                showToast('注册申请已提交，等待管理员审核');
                closeUserAccessModal();
                renderAdminReviewNotification();
            }).catch(function() {
            }).finally(function() {
                userModalSubmit.disabled = false;
            });
            return;
        }

        userModalSubmit.disabled = true;
        apiRequest('/api/user/login', {
            method: 'POST',
            body: JSON.stringify({ username: username, password: password })
        }).then(function(result) {
            showToast('登录成功');
            isUserLoggedIn = true;
            loggedInUser = result.username || username;
            loggedInUserType = result.type || null;
            setStoredUserSession({ username: loggedInUser, type: loggedInUserType });
            updateUserEntryUI();
            closeUserAccessModal();
        }).catch(function() {
        }).finally(function() {
            userModalSubmit.disabled = false;
        });
    }

    function toggleUserAccessMode() {
        openUserAccessModal(userAccessMode === 'login' ? 'register' : 'login');
    }

    function loadUserSession() {
        const session = getStoredUserSession();
        if (session && session.username) {
            isUserLoggedIn = true;
            loggedInUser = session.username;
            loggedInUserType = session.type || null;
        }
    }

    function initUserEntry() {
        loadUserSession();
        updateUserEntryUI();

        modalBackdrop.addEventListener('click', closeUserAccessModal);
        closeUserModalBtn.addEventListener('click', closeUserAccessModal);
        userModalSubmit.addEventListener('click', userAccessSubmit);
        switchRegisterBtn.addEventListener('click', toggleUserAccessMode);

        // admin review modal bindings
        const adminReviewBtn = document.getElementById('admin-review-btn');
        const adminReviewModal = document.getElementById('admin-review-modal');
        const adminReviewBackdrop = document.getElementById('admin-review-backdrop');
        const closeAdminReviewBtn = document.getElementById('close-admin-review-modal');

        if (adminReviewBtn) {
            adminReviewBtn.addEventListener('click', function() {
                openAdminReviewModal();
            });
        }
        if (adminReviewBackdrop) adminReviewBackdrop.addEventListener('click', closeAdminReviewModal);
        if (closeAdminReviewBtn) closeAdminReviewBtn.addEventListener('click', closeAdminReviewModal);

        renderAdminReviewNotification();
    }

    function validateInfoForm() {
        const name = document.getElementById('info-name').value.trim();
        const gender = document.querySelector('input[name="gender"]:checked');
        const school = document.getElementById('info-school').value;
        const schoolOther = document.getElementById('info-school-other').value.trim();
        const department = document.getElementById('info-department').value.trim();
        const grade = document.getElementById('info-grade').value;
        const graduation = document.getElementById('info-graduation').value;
        const phone = document.getElementById('info-phone').value.trim();
        const wechat = document.getElementById('info-wechat').value.trim();

        if (!name) { showToast('请输入姓名'); return null; }
        if (!gender) { showToast('请选择性别'); return null; }
        if (!school) { showToast('请选择学校'); return null; }
        if (school === '其他' && !schoolOther) { showToast('请填写学校名称'); return null; }
        if (!department) { showToast('请填写院系'); return null; }
        if (!grade) { showToast('请选择年级'); return null; }
        if (!graduation) { showToast('请选择毕业届'); return null; }
        if (!phone) { showToast('请输入联系电话'); return null; }
        if (!/^1[3-9]\d{9}$/.test(phone)) { showToast('请输入正确的11位手机号'); return null; }

        const finalSchool = school === '其他' ? schoolOther : school;

        return {
            name: name,
            gender: gender.value,
            school: finalSchool,
            department: department,
            grade: grade + '级',
            graduation: graduation + '届',
            phone: phone,
            wechat: wechat
        };
    }

    function clearInfoForm() {
        document.getElementById('info-name').value = '';
        document.querySelectorAll('input[name="gender"]').forEach(r => r.checked = false);
        document.getElementById('info-school').value = '';
        document.getElementById('info-school-other').value = '';
        document.getElementById('info-school-other').style.display = 'none';
        document.getElementById('info-department').value = '';
        document.getElementById('info-grade').value = '';
        document.getElementById('info-graduation').value = '';
        document.getElementById('info-phone').value = '';
        document.getElementById('info-wechat').value = '';
    }

    function renderStudents() {
        membersContainer.innerHTML = '';

        studentsData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.id = ['gaming-category', 'study-category', 'attitude-category'][index];

            let studentItems = '';
            item.students.forEach(name => {
                studentItems += `
                    <div class="student-item">
                        <div class="student-avatar">${name}</div>
                        <span class="student-name">${name}同学</span>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="category-header">
                    <h3>${item.category}</h3>
                    <span class="student-count">${item.students.length}人</span>
                </div>
                <div class="student-list">
                    ${studentItems}
                </div>
            `;

            membersContainer.appendChild(card);
        });
    }

    function renderLikertQuestion(question) {
        let optionsHtml = '';
        likertLabels.forEach((label, index) => {
            const value = index + 1;
            optionsHtml += `
                <button class="likert-btn" data-value="${value}" onclick="selectLikert('${question.id}', ${value}, this)">
                    ${label}
                </button>
            `;
        });

        return `
            <div class="question-item">
                <p class="question-text">${question.text}</p>
                <div class="likert-options">${optionsHtml}</div>
            </div>
        `;
    }

    function renderBehaviorQuestion(question) {
        return `
            <div class="behavior-item" onclick="toggleBehavior('${question.id}', this)">
                <div class="behavior-checkbox"></div>
                <span class="behavior-text">${question.text}</span>
            </div>
        `;
    }

    function renderQuestionnaire() {
        const sections = ['section1', 'section2', 'section3', 'section4', 'section5'];

        sections.forEach((section, index) => {
            const container = document.getElementById(`questions-${index + 1}`);
            container.innerHTML = '';

            questionnaireData[section].forEach(question => {
                container.innerHTML += renderLikertQuestion(question);
            });
        });

        const behaviorContainer = document.getElementById('questions-behavior');
        behaviorContainer.innerHTML = '';
        questionnaireData.behavior.forEach(question => {
            behaviorContainer.innerHTML += renderBehaviorQuestion(question);
        });

        const severityContainer = document.getElementById('questions-severity');
        severityContainer.innerHTML = '';
        questionnaireData.severity.forEach(question => {
            severityContainer.innerHTML += renderLikertQuestion(question);
        });

        answers = {};
        updateProgress();
    }

    window.selectLikert = function(questionId, value, btn) {
        answers[questionId] = value;

        const options = btn.parentElement.querySelectorAll('.likert-btn');
        options.forEach(opt => opt.classList.remove('selected'));
        btn.classList.add('selected');

        updateProgress();
    };

    window.toggleBehavior = function(questionId, item) {
        if (!answers['behavior']) {
            answers['behavior'] = [];
        }

        const index = answers['behavior'].indexOf(questionId);
        if (index > -1) {
            answers['behavior'].splice(index, 1);
            item.classList.remove('selected');
        } else {
            answers['behavior'].push(questionId);
            item.classList.add('selected');
        }

        updateProgress();
    };

    function updateProgress() {
        let totalRequired = 30;
        let completedRequired = 0;
        let completedBehavior = 0;

        const likertQuestions = [
            ...questionnaireData.section1,
            ...questionnaireData.section2,
            ...questionnaireData.section3,
            ...questionnaireData.section4,
            ...questionnaireData.section5,
            ...questionnaireData.severity
        ];

        likertQuestions.forEach(q => {
            if (answers[q.id]) completedRequired++;
        });

        if (answers['behavior']) {
            completedBehavior = answers['behavior'].length;
        }

        const completedTotal = completedRequired + completedBehavior;
        completedCount.textContent = `${completedTotal} (必填${completedRequired}/30)`;

        const percentage = (completedRequired / totalRequired) * 100;
        progressFill.style.width = `${percentage}%`;

        submitBtn.disabled = completedRequired < totalRequired;
    }

    function initGradeAndGraduation() {
        const gradeSelect = document.getElementById('info-grade');
        const graduationSelect = document.getElementById('info-graduation');

        for (let year = 2030; year >= 2010; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '级';
            gradeSelect.appendChild(option);
        }

        for (let year = 2034; year >= 2014; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year + '届';
            graduationSelect.appendChild(option);
        }
    }

    // ----- admin registration review UI -----
    function renderAdminReviewNotification() {
        const btn = document.getElementById('admin-review-btn');
        const countEl = document.getElementById('admin-review-count');
        if (!btn || !countEl) return;
        if (!isAdminLoggedIn) {
            countEl.style.display = 'none';
            return;
        }
        apiRequest('/api/admin/user-apps', { method: 'GET' }).then(function(result) {
            const apps = result && result.apps ? result.apps : [];
            const pending = apps.filter(a => a.status === 'pending').length;
            if (pending > 0) {
                countEl.style.display = 'inline-block';
                countEl.textContent = pending;
            } else {
                countEl.style.display = 'none';
            }
        }).catch(function() {
            countEl.style.display = 'none';
        });
    }

    function openAdminReviewModal() {
        const modal = document.getElementById('admin-review-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        renderAdminReviewList();
    }

    function closeAdminReviewModal() {
        const modal = document.getElementById('admin-review-modal');
        if (!modal) return;
        modal.classList.add('hidden');
    }

    function renderAdminReviewList() {
        const body = document.getElementById('admin-review-body');
        if (!body) return;
        body.innerHTML = '<div class="admin-empty"><p>正在加载注册申请...</p></div>';
        apiRequest('/api/admin/user-apps', { method: 'GET' }).then(function(result) {
            const apps = result && result.apps ? result.apps : [];
            if (!apps || apps.length === 0) {
                body.innerHTML = '<div class="admin-empty"><p>暂无注册申请</p></div>';
                return;
            }
            const rows = apps.map(app => {
                const statusLabel = app.status === 'pending' ? '待审核' : (app.status === 'approved' ? '已通过' : '已拒绝');
                const submittedAt = app.submittedAt ? app.submittedAt.slice(0, 19).replace('T', ' ') : '未知时间';
                const actionBtns = app.status === 'pending' ? `
                    <button class="submit-btn" data-action="approve" data-id="${app.id}">通过</button>
                    <button class="text-btn" data-action="reject" data-id="${app.id}">拒绝</button>
                ` : '';

                return `
                    <div class="detail-section" style="margin-bottom:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="font-weight:700;color:#374a73">${app.username} <span style="font-size:0.9rem;color:#6b7ba7;margin-left:8px">类型：${app.type}</span></div>
                                <div style="font-size:0.9rem;color:#6b7ba7">提交时间：${submittedAt}</div>
                            </div>
                            <div style="text-align:right">
                                <div style="margin-bottom:6px;color:#5b7bb4;font-weight:600">${statusLabel}</div>
                                ${actionBtns}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            body.innerHTML = rows;

            body.querySelectorAll('[data-action]').forEach(btn => {
                const action = btn.getAttribute('data-action');
                const id = btn.getAttribute('data-id');
                btn.addEventListener('click', function() {
                    if (action === 'approve') approveApplication(id);
                    else if (action === 'reject') rejectApplication(id);
                });
            });
        }).catch(function() {
            body.innerHTML = '<div class="admin-empty"><p>加载失败，请检查后端服务</p></div>';
        });
    }

    function approveApplication(appId) {
        if (!isAdminLoggedIn) { showToast('请先以管理员身份登录'); return; }
        apiRequest('/api/admin/user-apps/' + encodeURIComponent(appId) + '/approve', {
            method: 'POST'
        }).then(function() {
            showToast('注册申请已通过');
            renderAdminReviewList();
            renderAdminReviewNotification();
        }).catch(function() {});
    }

    function rejectApplication(appId) {
        if (!isAdminLoggedIn) { showToast('请先以管理员身份登录'); return; }
        apiRequest('/api/admin/user-apps/' + encodeURIComponent(appId) + '/reject', {
            method: 'POST'
        }).then(function() {
            showToast('注册申请已拒绝');
            renderAdminReviewList();
            renderAdminReviewNotification();
        }).catch(function() {});
    }

    function initSchoolSelect() {
        const schoolSelect = document.getElementById('info-school');
        const schoolOther = document.getElementById('info-school-other');

        schoolSelect.addEventListener('change', function() {
            if (this.value === '其他') {
                schoolOther.style.display = 'block';
            } else {
                schoolOther.style.display = 'none';
                schoolOther.value = '';
            }
        });
    }

    function validateRegisterForm() {
        const username = registerUsername.value.trim();
        const password = registerPassword.value.trim();
        const confirmPassword = registerConfirmPassword.value.trim();
        const registerKey = registerKeyInput.value.trim();

        if (!username) {
            showToast('请输入用户名');
            return null;
        }
        if (!password) {
            showToast('请输入密码');
            return null;
        }
        if (password.length < 6) {
            showToast('密码长度至少 6 位');
            return null;
        }
        if (password !== confirmPassword) {
            showToast('两次输入的密码不一致');
            return null;
        }
        if (!registerKey) {
            showToast('请输入管理员校验码');
            return null;
        }

        return { username: username, password: password, registerKey: registerKey };
    }

    function clearRegisterForm() {
        registerUsername.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        registerKeyInput.value = '';
    }

    function loginAdmin(username, token) {
        isAdminLoggedIn = true;
        adminToken = token;
        adminUsername = username;
        setStoredUser({ username: username, token: token });
        // 更新审核通知
        renderAdminReviewNotification();
    }

    function logoutAdmin() {
        isAdminLoggedIn = false;
        adminToken = null;
        adminUsername = '';
        clearStoredUser();
        renderAdminReviewNotification();
    }

    function registerUser() {
        const data = validateRegisterForm();
        if (!data) return;

        registerSubmitBtn.disabled = true;
        fetch(API_BASE + '/api/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(function(res) {
            if (res.status === 403) {
                throw new Error('register-key');
            }
            if (res.status === 409) {
                throw new Error('username-exists');
            }
            return res.json().then(function(body) {
                if (!res.ok) {
                    throw new Error(body.message || '注册失败');
                }
                return body;
            });
        }).then(function() {
            showToast('管理员注册成功，请登录');
            clearRegisterForm();
            showPage(loginPage);
        }).catch(function(err) {
            if (err.message === 'register-key') {
                showToast('管理员校验码错误');
            } else if (err.message === 'username-exists') {
                showToast('用户名已存在');
            } else {
                showToast(err.message || '注册失败');
            }
        }).finally(function() {
            registerSubmitBtn.disabled = false;
        });
    }

    function loginSubmit() {
        const username = userLoginUsername.value.trim();
        const password = userLoginPassword.value.trim();

        if (!username || !password) {
            showToast('请输入账号和密码');
            return;
        }

        loginSubmitBtn.disabled = true;
        fetch(API_BASE + '/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        }).then(function(res) {
            return res.json().then(function(body) {
                if (!res.ok) {
                    throw new Error(body.message || '登录失败');
                }
                return body;
            });
        }).then(function(data) {
            loginAdmin(data.username, data.token);
            showToast('登录成功');
            renderAdminList();
            showPage(adminPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(function(err) {
            showToast(err.message || '登录失败');
        }).finally(function() {
            loginSubmitBtn.disabled = false;
        });
    }

    function doLogout() {
        const token = adminToken;
        logoutAdmin();
        if (!token) {
            showToast('已退出登录');
            showPage(homePage);
            return;
        }

        fetch(API_BASE + '/api/admin/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        }).catch(function() {
            // 无论服务端是否可用，都清除本地登录状态
        }).finally(function() {
            showToast('已退出登录');
            showPage(homePage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function enterAsGuest() {
        renderQuestionnaire();
        showPage(questionnairePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderAdminList() {
        const listContainer = document.getElementById('admin-list');
        const searchText = (adminSearchInput.value || '').trim();

        listContainer.innerHTML = `
            <div class="admin-empty">
                <div class="empty-icon">⏳</div>
                <p>正在加载数据...</p>
            </div>
        `;

        const statTotal = document.getElementById('stat-total');
        const statToday = document.getElementById('stat-today');
        const statMale = document.getElementById('stat-male');
        const statFemale = document.getElementById('stat-female');
        statTotal.textContent = '-';
        statToday.textContent = '-';
        statMale.textContent = '-';
        statFemale.textContent = '-';

        apiRequest('/api/admin/records' + (searchText ? '?q=' + encodeURIComponent(searchText) : ''), {
            method: 'GET'
        }).then(function(result) {
            const records = result && result.records ? result.records : [];
            const stats = result && result.stats ? result.stats : {};

            statTotal.textContent = stats.total != null ? stats.total : records.length;
            statToday.textContent = stats.today != null ? stats.today : 0;
            statMale.textContent = stats.male != null ? stats.male : 0;
            statFemale.textContent = stats.female != null ? stats.female : 0;

            if (records.length === 0) {
                listContainer.innerHTML = `
                    <div class="admin-empty">
                        <div class="empty-icon">📭</div>
                        <p>${searchText ? '没有找到匹配的问卷记录' : '暂无问卷记录'}</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = records.map(record => {
                const info = record.info || {};
                const score = calculateScore(record);
                const time = record.submitTime ? String(record.submitTime).replace('T', ' ').slice(0, 16) : '未知时间';
                const levelClass = 'level-' + (score.level === '重度' ? 'high' : score.level === '中度' ? 'mid' : 'low');
                const sourceClass = record.source === 'user' ? 'record-source-user' : 'record-source-guest';
                const sourceLabel = record.source === 'user' ? '用户' : '访客';

                return `
                    <div class="admin-record-card" onclick="viewRecordDetail('${record.id}')">
                        <div class="record-main">
                            <div class="record-avatar">${info.name ? info.name.charAt(0) : '?'}</div>
                            <div class="record-info">
                                <div class="record-name-row">
                                    <span class="record-name">${info.name || '匿名'}</span>
                                    <span class="record-gender">${info.gender || ''}</span>
                                    <span class="record-level ${levelClass}">${score.level}风险</span>
                                </div>
                                <div class="record-meta">
                                    <span>🏫 ${info.school || '未填写'}</span>
                                    <span>📚 ${info.department || ''}</span>
                                </div>
                                <div class="record-meta">
                                    <span>🎓 ${info.grade || ''} / ${info.graduation || ''}</span>
                                    <span>📱 ${info.phone || ''}</span>
                                </div>
                                <div class="record-time">提交时间：${time}</div>
                            </div>
                        </div>
                        <div class="record-extra">
                            <div class="score-box">
                                <div>
                                    <div class="score-num">${score.total}</div>
                                    <div class="score-label">得分</div>
                                </div>
                            </div>
                            <div class="view-detail-arrow">查看详情 →</div>
                        </div>
                        <div style="margin-top:12px; font-size:0.85rem; color:#5b7bb4;">
                            来源：<span class="record-source ${sourceClass}">${sourceLabel}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }).catch(function() {
            listContainer.innerHTML = `
                <div class="admin-empty">
                    <div class="empty-icon">❌</div>
                    <p>加载失败，请检查后端服务是否已启动</p>
                </div>
            `;
        });
    }

    window.viewRecordDetail = function(recordId) {
        currentViewingRecordId = recordId;
        const container = document.getElementById('detail-container');

        container.innerHTML = `
            <div class="admin-empty">
                <div class="empty-icon">⏳</div>
                <p>正在加载详情...</p>
            </div>
        `;
        showPage(adminDetailPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        apiRequest('/api/admin/records/' + encodeURIComponent(recordId), {
            method: 'GET'
        }).then(function(record) {
            if (!record) {
                showToast('记录不存在');
                showPage(adminPage);
                return;
            }
            const info = record.info || {};
            const qa = record.questionnaireAnswers || {};
            const score = calculateScore(record);
            const time = record.submitTime ? String(record.submitTime).replace('T', ' ').slice(0, 16) : '未知时间';
            const levelClass = 'level-' + (score.level === '重度' ? 'high' : score.level === '中度' ? 'mid' : 'low');

            const behaviorList = questionnaireData.behavior
                .filter(q => qa.behavior && qa.behavior.includes(q.id))
                .map(q => q.text)
                .join('、') || '无';

            function renderSection(title, questions) {
                const items = questions.map(q => {
                    const val = qa[q.id] || '-';
                    const label = val !== '-' ? likertLabels[val - 1] : '未答';
                    const valClass = 'val-' + (val >= 4 ? 'high' : val >= 3 ? 'mid' : 'low');
                    return `
                        <div class="detail-q-row">
                            <span class="detail-q-text">${q.text}</span>
                            <span class="detail-q-val ${valClass}">${label} (${val})</span>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="detail-section">
                        <h3 class="detail-section-title">${title}</h3>
                        <div class="detail-q-list">${items}</div>
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="detail-header-card">
                    <div class="detail-avatar">${info.name ? info.name.charAt(0) : '?'}</div>
                    <div class="detail-header-info">
                        <h2 class="detail-name">${info.name || '匿名'}
                            <span class="record-gender">${info.gender || ''}</span>
                            <span class="record-level ${levelClass}">${score.level}风险 (${score.total}分)</span>
                        </h2>
                        <div class="detail-meta-row">
                            <span>🏫 ${info.school || '未填写'}</span>
                            <span>📚 ${info.department || ''}</span>
                            <span>🎓 ${info.grade || ''} / ${info.graduation || ''}</span>
                        </div>
                        <div class="detail-meta-row">
                            <span>📱 ${info.phone || '未填写'}</span>
                            <span>💬 微信：${info.wechat || '未填写'}</span>
                        </div>
                        <div class="detail-meta-row">
                            <span>🕐 提交时间：${time}</span>
                            <span>来源：${record.source === 'user' ? '用户' : '访客'}</span>
                        </div>
                    </div>
                </div>

                <div class="detail-summary-card">
                    <h3 class="detail-section-title">📊 问卷摘要</h3>
                    <div class="summary-behavior">
                        <strong>异常行为（过去一个月）：</strong>${behaviorList}
                    </div>
                </div>

                ${renderSection('第一维度：学习动力', questionnaireData.section1)}
                ${renderSection('第二维度：学习执行', questionnaireData.section2)}
                ${renderSection('第三维度：情绪状态', questionnaireData.section3)}
                ${renderSection('第四维度：社交支持', questionnaireData.section4)}
                ${renderSection('第五维度：未来规划', questionnaireData.section5)}
                ${renderSection('严重程度指数（过去两周）', questionnaireData.severity)}

                <div class="detail-delete-section">
                    <button id="detail-delete-btn" class="detail-delete-btn">🗑️ 删除此记录</button>
                </div>
            `;

            document.getElementById('detail-delete-btn').addEventListener('click', function() {
                if (!confirm('确定要删除这条记录吗？此操作不可撤销。')) return;
                apiRequest('/api/admin/records/' + encodeURIComponent(recordId), {
                    method: 'DELETE'
                }).then(function() {
                    showToast('记录已删除');
                    showPage(adminPage);
                    renderAdminList();
                }).catch(function() {});
            });
        }).catch(function() {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="empty-icon">❌</div>
                    <p>加载失败，请检查后端服务</p>
                </div>
            `;
        });
    };

    function calculateScore(record) {
        if (!record.questionnaireAnswers) return { total: 0, level: '未知' };
        const a = record.questionnaireAnswers;
        let total = 0;
        const sections = ['section1', 'section2', 'section3', 'section4', 'section5', 'severity'];
        sections.forEach(sec => {
            questionnaireData[sec].forEach(q => {
                if (a[q.id]) total += a[q.id];
            });
        });
        let level = '轻度';
        if (total >= 80) level = '重度';
        else if (total >= 50) level = '中度';
        return { total: total, level: level };
    }

    membersBtn.addEventListener('click', function() {
        renderStudents();
        showPage(membersPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    questionnaireBtn.addEventListener('click', function() {
        if (!isUserLoggedIn) {
            showToast('请先登录');
            openUserAccessModal('login');
            return;
        }
        renderQuestionnaire();
        showPage(questionnairePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    membersBackBtn.addEventListener('click', function() {
        showPage(homePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    questionnaireBackBtn.addEventListener('click', function() {
        showPage(homePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    submitBtn.addEventListener('click', function() {
        currentQuestionnaireAnswers = JSON.parse(JSON.stringify(answers));
        clearInfoForm();
        showPage(infoPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    infoBackBtn.addEventListener('click', function() {
        showPage(questionnairePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    infoSubmitBtn.addEventListener('click', function() {
        const info = validateInfoForm();
        if (!info) return;
        if (!currentQuestionnaireAnswers) {
            showToast('问卷数据丢失，请返回重新填写');
            showPage(questionnairePage);
            return;
        }

        infoSubmitBtn.disabled = true;
        apiRequest('/api/records', {
            method: 'POST',
            body: JSON.stringify({
                info: info,
                questionnaireAnswers: currentQuestionnaireAnswers,
                source: isUserLoggedIn ? 'user' : 'guest'
            })
        }).then(function() {
            currentQuestionnaireAnswers = null;
            clearInfoForm();
            renderQuestionnaire();
            showPage(thankyouPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(function() {
        }).finally(function() {
            infoSubmitBtn.disabled = false;
        });
    });

    thankyouHomeBtn.addEventListener('click', function() {
        showPage(homePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    adminEntry.addEventListener('click', function() {
        userLoginUsername.value = '';
        userLoginPassword.value = '';
        showPage(loginPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    loginBackBtn.addEventListener('click', function() {
        showPage(homePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    openRegisterBtn.addEventListener('click', function() {
        clearRegisterForm();
        showPage(registerPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    loginSubmitBtn.addEventListener('click', function() {
        loginSubmit();
    });

    registerBackBtn.addEventListener('click', function() {
        showPage(homePage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    registerSubmitBtn.addEventListener('click', function() {
        registerUser();
    });

    function downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    adminBackBtn.addEventListener('click', doLogout);
    adminLogoutBtn.addEventListener('click', doLogout);

    detailBackBtn.addEventListener('click', function() {
        renderAdminList();
        showPage(adminPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    adminExportBtn.addEventListener('click', function() {
        const searchText = (adminSearchInput.value || '').trim();
        const url = '/api/admin/records/export' + (searchText ? '?q=' + encodeURIComponent(searchText) : '');
        apiRequestText(url)
            .then(function(csv) {
                downloadCSV(csv, 'records-export.csv');
            }).catch(function() {
            // 错误提示已经由 apiRequestText 处理
        });
    });

    let searchTimer = null;
    adminSearchInput.addEventListener('input', function() {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(renderAdminList, 300);
    });

    initGradeAndGraduation();
    initSchoolSelect();
    loadAdminSession();
    initUserEntry();
});
