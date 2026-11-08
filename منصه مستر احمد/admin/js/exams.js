/* ==========================================================================
   EXAMS.JS — Page logic for exams management
   ========================================================================== */

let examsData = JSON.parse(JSON.stringify(EXAMS));
let filters = { search: '', subject: '', grade: '', status: '' };
let currentPage = 1;
const PER_PAGE = 7;
let questions = [];
let analyticsChart = null;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => initExamsPage(), 50);
});

document.addEventListener('langchange', () => {
  populateFilters();
  renderTable();
});

function initExamsPage() {
  populateFilters();
  renderTable();
  updateStats();
  wireEvents();
  refreshIcons();
}

function populateFilters() {
  const lang = STATE.lang;
  document.getElementById('filterSubject').innerHTML = `<option value="">${t('subject')}</option>` +
    SUBJECTS.map((s, i) => `<option value="${i}">${lang === 'ar' ? s.ar : s.en}</option>`).join('');
  document.getElementById('filterGrade').innerHTML = `<option value="">${t('grade')}</option>` +
    GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
  document.getElementById('e_subject').innerHTML = SUBJECTS.map((s, i) => `<option value="${i}">${lang === 'ar' ? s.ar : s.en}</option>`).join('');
  document.getElementById('e_grade').innerHTML = GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
}

function updateStats() {
  document.getElementById('ex-total').textContent = examsData.length;
  document.getElementById('ex-published').textContent = examsData.filter(e => e.status === 'published').length;
  document.getElementById('ex-scheduled').textContent = examsData.filter(e => e.status === 'scheduled').length;
  document.getElementById('ex-active').textContent = examsData.filter(e => e.status === 'active').length;
  document.getElementById('ex-draft').textContent = examsData.filter(e => e.status === 'draft').length;
}

function getFiltered() {
  return examsData.filter(e => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = (e.titleEn + ' ' + e.titleAr + ' ' + e.subject + ' ' + e.subjectAr).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.subject !== '' && e.subjectIdx !== parseInt(filters.subject)) return false;
    if (filters.grade !== '' && e.gradeIdx !== parseInt(filters.grade)) return false;
    if (filters.status && e.status !== filters.status) return false;
    return true;
  });
}

function renderTable() {
  const tbody = document.getElementById('examsTbody');
  const lang = STATE.lang;
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PER_PAGE;
  const pageData = filtered.slice(start, start + PER_PAGE);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <div class="icon-wrap"><i data-lucide="file-x" class="icon"></i></div>
      <h3>${t('no_results')}</h3><p>${t('no_results_desc')}</p>
    </div></td></tr>`;
    document.getElementById('examsPagination').innerHTML = '';
    refreshIcons();
    return;
  }

  tbody.innerHTML = pageData.map(e => `
    <tr>
      <td>
        <div class="user-name">${lang === 'ar' ? e.titleAr : e.titleEn}</div>
        <div class="user-meta">${lang === 'ar' ? e.subjectAr : e.subject}</div>
      </td>
      <td><span class="badge badge-neutral" style="background:${e.subjectColor}22;color:${e.subjectColor}">${lang === 'ar' ? e.subjectAr : e.subject}</span></td>
      <td>${lang === 'ar' ? e.gradeAr : e.grade}</td>
      <td><strong>${e.numQuestions}</strong></td>
      <td><strong>${e.totalMarks}</strong></td>
      <td>${e.duration} ${t('minutes')}</td>
      <td>${fmtDate(e.startDate)}</td>
      <td>${statusBadge(e.status)}</td>
      <td>
        <div class="actions">
          ${e.status === 'completed' || e.status === 'active' ? `<button class="action-btn" onclick="viewAnalytics('${e.id}')" title="${t('exam_analytics')}"><i data-lucide="bar-chart-3" class="icon"></i></button>` : ''}
          <button class="action-btn" onclick="editExam('${e.id}')" title="${t('edit')}"><i data-lucide="pencil" class="icon"></i></button>
          <button class="action-btn" onclick="duplicateExam('${e.id}')" title="${t('duplicate')}"><i data-lucide="copy" class="icon"></i></button>
          <button class="action-btn danger" onclick="deleteExam('${e.id}')" title="${t('delete')}"><i data-lucide="trash-2" class="icon"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(
    document.getElementById('examsPagination'),
    currentPage, totalPages, filtered.length, PER_PAGE,
    (p) => { currentPage = p; renderTable(); }
  );
  refreshIcons();
}

function wireEvents() {
  document.getElementById('filterSearch').addEventListener('input', e => { filters.search = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('filterSubject').addEventListener('change', e => { filters.subject = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('filterGrade').addEventListener('change', e => { filters.grade = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('filterStatus').addEventListener('change', e => { filters.status = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('createExamBtn').addEventListener('click', () => openCreateModal());
  document.getElementById('saveExamBtn').addEventListener('click', saveExam);
  document.getElementById('addQuestionBtn').addEventListener('click', () => addQuestion('multiple_choice'));
}

/* ----------  Question Builder  ---------- */
function addQuestion(type) {
  const q = {
    id: Date.now() + Math.random(),
    type,
    text: '',
    options: type === 'multiple_choice' ? ['', '', '', ''] : (type === 'true_false' ? ['True', 'False'] : []),
    correct: type === 'multiple_choice' ? 0 : (type === 'true_false' ? 0 : ''),
    points: 4,
  };
  questions.push(q);
  renderQuestions();
}

function removeQuestion(id) {
  questions = questions.filter(q => q.id !== id);
  renderQuestions();
}

function changeQuestionType(id, type) {
  const q = questions.find(qq => qq.id === id);
  if (!q) return;
  q.type = type;
  q.options = type === 'multiple_choice' ? ['', '', '', ''] : (type === 'true_false' ? ['True', 'False'] : []);
  q.correct = type === 'multiple_choice' ? 0 : (type === 'true_false' ? 0 : '');
  renderQuestions();
}

function updateQuestion(id, field, value, idx) {
  const q = questions.find(qq => qq.id === id);
  if (!q) return;
  if (field === 'options') q.options[idx] = value;
  else if (field === 'correct') q.correct = parseInt(value);
  else q[field] = value;
}

function renderQuestions() {
  const list = document.getElementById('questionsList');
  if (!questions.length) {
    list.innerHTML = `<div class="empty-state" style="padding:24px">
      <div class="icon-wrap"><i data-lucide="help-circle" class="icon"></i></div>
      <h3>${t('add_question')}</h3>
      <p>Click "Add Question" to start building your exam.</p>
    </div>`;
    refreshIcons();
    return;
  }
  list.innerHTML = questions.map((q, i) => {
    const typeOpts = [
      { v: 'multiple_choice', l: t('multiple_choice') },
      { v: 'true_false', l: t('true_false') },
      { v: 'written', l: t('written') },
    ];
    return `
      <div class="question-item">
        <div class="question-head">
          <div class="question-num">${i + 1}</div>
          <select class="form-control question-type-select" onchange="changeQuestionType(${q.id}, this.value)">
            ${typeOpts.map(o => `<option value="${o.v}" ${q.type === o.v ? 'selected' : ''}>${o.l}</option>`).join('')}
          </select>
          <div style="display:flex;align-items:center;gap:6px">
            <span class="text-xs text-2">${t('points')}:</span>
            <input type="number" class="form-control" style="width:64px;height:34px" value="${q.points}" onchange="updateQuestion(${q.id}, 'points', this.value)">
          </div>
          <button class="action-btn danger" onclick="removeQuestion(${q.id})"><i data-lucide="trash-2" class="icon"></i></button>
        </div>
        <div class="form-group mb-3">
          <label class="form-label">${t('question_text')}</label>
          <textarea class="form-control" rows="2" onchange="updateQuestion(${q.id}, 'text', this.value)" placeholder="Enter question...">${q.text}</textarea>
        </div>
        ${q.type === 'multiple_choice' ? `
          <label class="form-label">${t('options')} (${t('correct_answer')}: select radio)</label>
          ${q.options.map((opt, idx) => `
            <div class="option-row">
              <input type="radio" name="correct_${q.id}" ${q.correct === idx ? 'checked' : ''} onchange="updateQuestion(${q.id}, 'correct', ${idx})">
              <input type="text" class="form-control" value="${opt}" placeholder="Option ${idx + 1}" onchange="updateQuestion(${q.id}, 'options', this.value, ${idx})">
            </div>
          `).join('')}
        ` : q.type === 'true_false' ? `
          <label class="form-label">${t('correct_answer')}</label>
          <div class="option-row">
            <input type="radio" name="correct_${q.id}" ${q.correct === 0 ? 'checked' : ''} onchange="updateQuestion(${q.id}, 'correct', 0)">
            <span style="font-weight:600">${t('pass') === 'ناجح' ? 'صح' : 'True'}</span>
          </div>
          <div class="option-row">
            <input type="radio" name="correct_${q.id}" ${q.correct === 1 ? 'checked' : ''} onchange="updateQuestion(${q.id}, 'correct', 1)">
            <span style="font-weight:600">${t('fail') === 'راسب' ? 'خطأ' : 'False'}</span>
          </div>
        ` : `
          <div class="form-hint">${STATE.lang === 'ar' ? 'سيتم تصحيح الإجابات المقالية يدوياً' : 'Written answers will be graded manually'}</div>
        `}
      </div>
    `;
  }).join('');
  refreshIcons();
}

/* ----------  Create / Edit  ---------- */
function openCreateModal() {
  document.getElementById('examModalTitle').textContent = t('create_exam');
  document.getElementById('examIdField').value = '';
  document.getElementById('e_title').value = '';
  document.getElementById('e_subject').value = '0';
  document.getElementById('e_grade').value = '0';
  document.getElementById('e_marks').value = 100;
  document.getElementById('e_pass').value = 50;
  document.getElementById('e_duration').value = 60;
  document.getElementById('e_status').value = 'draft';
  const now = new Date();
  document.getElementById('e_start').value = now.toISOString().slice(0, 16);
  document.getElementById('e_end').value = new Date(now.getTime() + 2 * 3600 * 1000).toISOString().slice(0, 16);
  document.getElementById('e_desc').value = '';
  questions = [];
  renderQuestions();
  openModal('examModal');
}

function editExam(id) {
  const e = examsData.find(x => x.id === id);
  if (!e) return;
  document.getElementById('examModalTitle').textContent = t('edit_exam');
  document.getElementById('examIdField').value = e.id;
  document.getElementById('e_title').value = STATE.lang === 'ar' ? e.titleAr : e.titleEn;
  document.getElementById('e_subject').value = e.subjectIdx;
  document.getElementById('e_grade').value = e.gradeIdx;
  document.getElementById('e_marks').value = e.totalMarks;
  document.getElementById('e_pass').value = e.passingScore;
  document.getElementById('e_duration').value = e.duration;
  document.getElementById('e_status').value = e.status === 'active' || e.status === 'completed' ? 'published' : e.status;
  document.getElementById('e_start').value = e.startDate;
  document.getElementById('e_end').value = e.endDate;
  document.getElementById('e_desc').value = '';
  // Generate some sample questions
  questions = Array.from({ length: Math.min(e.numQuestions, 5) }, (_, i) => ({
    id: Date.now() + i,
    type: i % 3 === 0 ? 'multiple_choice' : (i % 3 === 1 ? 'true_false' : 'written'),
    text: 'Sample question ' + (i + 1),
    options: i % 3 === 0 ? ['Option A', 'Option B', 'Option C', 'Option D'] : (i % 3 === 1 ? ['True', 'False'] : []),
    correct: 0,
    points: Math.round(e.totalMarks / e.numQuestions),
  }));
  renderQuestions();
  openModal('examModal');
}

function saveExam() {
  const title = document.getElementById('e_title').value.trim();
  const subjIdx = parseInt(document.getElementById('e_subject').value);
  if (!title) {
    showToast('error', 'Error', 'Please fill all required fields.');
    return;
  }
  const subj = SUBJECTS[subjIdx];
  const id = document.getElementById('examIdField').value;
  const marks = parseInt(document.getElementById('e_marks').value);
  const numQ = questions.length || 10;
  if (id) {
    const e = examsData.find(x => x.id === id);
    if (e) {
      e.titleEn = title; e.titleAr = title;
      e.subjectIdx = subjIdx; e.subject = subj.en; e.subjectAr = subj.ar; e.subjectColor = subj.color;
      e.gradeIdx = parseInt(document.getElementById('e_grade').value);
      e.grade = GRADES[e.gradeIdx]; e.gradeAr = GRADES_AR[e.gradeIdx];
      e.totalMarks = marks;
      e.passingScore = parseInt(document.getElementById('e_pass').value);
      e.duration = parseInt(document.getElementById('e_duration').value);
      e.startDate = document.getElementById('e_start').value;
      e.endDate = document.getElementById('e_end').value;
      e.status = document.getElementById('e_status').value;
      e.numQuestions = numQ;
    }
    showToast('success', t('updated'), title + ' updated.');
  } else {
    const newId = 'EXA-' + String(301 + examsData.length + Math.floor(Math.random() * 100));
    examsData.push({
      id: newId, titleEn: title, titleAr: title,
      subjectIdx: subjIdx, subject: subj.en, subjectAr: subj.ar, subjectColor: subj.color,
      gradeIdx: parseInt(document.getElementById('e_grade').value),
      grade: GRADES[parseInt(document.getElementById('e_grade').value)],
      gradeAr: GRADES_AR[parseInt(document.getElementById('e_grade').value)],
      numQuestions: numQ, totalMarks: marks,
      passingScore: parseInt(document.getElementById('e_pass').value),
      duration: parseInt(document.getElementById('e_duration').value),
      startDate: document.getElementById('e_start').value,
      endDate: document.getElementById('e_end').value,
      status: document.getElementById('e_status').value,
      studentsTaken: 0, avgScore: 0, highestScore: 0, lowestScore: 0, passRate: 0,
    });
    showToast('success', t('created'), title + ' created.');
  }
  closeModal('examModal');
  updateStats();
  renderTable();
}

function deleteExam(id) {
  const e = examsData.find(x => x.id === id);
  if (!e) return;
  confirmDelete(`${t('confirm_delete')} <br><b>${STATE.lang === 'ar' ? e.titleAr : e.titleEn}</b>`, () => {
    examsData = examsData.filter(x => x.id !== id);
    showToast('success', t('deleted'), 'Exam deleted.');
    updateStats();
    renderTable();
  });
}

function duplicateExam(id) {
  const e = examsData.find(x => x.id === id);
  if (!e) return;
  const newId = 'EXA-' + String(301 + examsData.length + Math.floor(Math.random() * 100));
  const copy = { ...e, id: newId, titleEn: e.titleEn + ' (Copy)', titleAr: e.titleAr + ' (نسخة)', status: 'draft', studentsTaken: 0 };
  examsData.push(copy);
  showToast('success', t('duplicate') || 'Duplicated', 'Exam duplicated as draft.');
  updateStats();
  renderTable();
}

/* ----------  Analytics  ---------- */
function viewAnalytics(id) {
  const e = examsData.find(x => x.id === id);
  if (!e) return;
  const lang = STATE.lang;
  document.getElementById('anTitle').textContent = lang === 'ar' ? e.titleAr : e.titleEn;
  document.getElementById('analyticsBody').innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-stat"><div class="analytics-stat-value">${e.studentsTaken}</div><div class="analytics-stat-label">${t('students_taken')}</div></div>
      <div class="analytics-stat"><div class="analytics-stat-value" style="color:var(--secondary)">${e.avgScore}%</div><div class="analytics-stat-label">${t('average')}</div></div>
      <div class="analytics-stat"><div class="analytics-stat-value" style="color:var(--success)">${e.highestScore}%</div><div class="analytics-stat-label">${t('highest_score')}</div></div>
      <div class="analytics-stat"><div class="analytics-stat-value" style="color:var(--danger)">${e.lowestScore}%</div><div class="analytics-stat-label">${t('lowest_score')}</div></div>
    </div>
    <div class="card-pad" style="background:var(--card-2);border-radius:var(--r-md);padding:16px;margin-bottom:16px">
      <div class="flex justify-between mb-2"><span class="text-sm fw-700">${t('pass_rate')}</span><span class="text-sm fw-700" style="color:var(--success)">${e.passRate}%</span></div>
      <div class="progress"><div class="progress-bar success" style="width:${e.passRate}%"></div></div>
    </div>
    <div class="profile-section-title"><i data-lucide="bar-chart-3" class="icon"></i>${t('performance_distribution')}</div>
    <div class="analytics-chart"><canvas id="analyticsChartCanvas"></canvas></div>
  `;
  openModal('analyticsModal');
  refreshIcons();
  setTimeout(() => renderAnalyticsChart(e), 80);
}

function renderAnalyticsChart(e) {
  const el = document.getElementById('analyticsChartCanvas');
  if (!el) return;
  if (analyticsChart) analyticsChart.destroy();
  const c = {
    text: STATE.theme === 'dark' ? '#94A3B8' : '#64748B',
    grid: STATE.theme === 'dark' ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.12)',
    tooltipBg: STATE.theme === 'dark' ? '#1E293B' : '#FFFFFF',
    tooltipText: STATE.theme === 'dark' ? '#F1F5F9' : '#1E293B',
    border: STATE.theme === 'dark' ? '#1E293B' : '#E2E8F0',
  };
  const lang = STATE.lang;
  const buckets = ['0-20', '21-40', '41-60', '61-80', '81-100'];
  const data = [Math.round(e.studentsTaken * 0.05), Math.round(e.studentsTaken * 0.10), Math.round(e.studentsTaken * 0.25), Math.round(e.studentsTaken * 0.40), Math.round(e.studentsTaken * 0.20)];
  const grad = el.getContext('2d').createLinearGradient(0, 0, 0, 220);
  grad.addColorStop(0, '#2563EB');
  grad.addColorStop(1, '#7C3AED');
  analyticsChart = new Chart(el, {
    type: 'bar',
    data: {
      labels: buckets,
      datasets: [{ label: t('students_taken'), data, backgroundColor: grad, borderRadius: 6, barPercentage: 0.6 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8 } },
      scales: { x: { grid: { display: false }, border: { display: false } }, y: { grid: { color: c.grid }, border: { display: false }, beginAtZero: true } },
    },
  });
}
