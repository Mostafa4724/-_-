/* ==========================================================================
   STUDENTS.JS — Page logic for student management
   ========================================================================== */

let studentsData = JSON.parse(JSON.stringify(STUDENTS));
let filters = { search: '', grade: '', class: '', status: '' };
let currentPage = 1;
const PER_PAGE = 8;
let profileChart = null;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initStudentsPage();
  }, 50);
});

document.addEventListener('langchange', () => {
  populateFilters();
  renderTable();
});

function initStudentsPage() {
  populateFilters();
  renderTable();
  updateMiniStats();
  wireEvents();
  refreshIcons();
}

/* ----------  Populate filter dropdowns  ---------- */
function populateFilters() {
  const lang = STATE.lang;
  const gradeSel = document.getElementById('filterGrade');
  const fGrade = document.getElementById('f_grade');
  const clsSel = document.getElementById('filterClass');
  const fClass = document.getElementById('f_class');

  // Grade filter
  const currentGrade = gradeSel.value;
  gradeSel.innerHTML = `<option value="">${t('grade')}</option>` +
    GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
  gradeSel.value = currentGrade;

  // Form grade select
  const currentFGrade = fGrade.value;
  fGrade.innerHTML = GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
  fGrade.value = currentFGrade;

  // Class filter
  const currentClass = clsSel.value;
  clsSel.innerHTML = `<option value="">${t('class')}</option>` +
    CLASSES.map(c => `<option value="${c}">${t('class')} ${c}</option>`).join('');
  clsSel.value = currentClass;

  // Form class select
  const currentFClass = fClass.value;
  fClass.innerHTML = CLASSES.map(c => `<option value="${c}">${t('class')} ${c}</option>`).join('');
  fClass.value = currentFClass;
}

/* ----------  Mini stats  ---------- */
function updateMiniStats() {
  document.getElementById('mstat-total').textContent = studentsData.length;
  document.getElementById('mstat-active').textContent = studentsData.filter(s => s.status === 'active').length;
  document.getElementById('mstat-inactive').textContent = studentsData.filter(s => s.status === 'inactive').length;
}

/* ----------  Filter logic  ---------- */
function getFiltered() {
  return studentsData.filter(s => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = (s.name + ' ' + s.email + ' ' + s.id + ' ' + s.phone).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.grade !== '' && s.gradeIdx !== parseInt(filters.grade)) return false;
    if (filters.class && s.class !== filters.class) return false;
    if (filters.status && s.status !== filters.status) return false;
    return true;
  });
}

/* ----------  Render table  ---------- */
function renderTable() {
  const tbody = document.getElementById('studentsTbody');
  const lang = STATE.lang;
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PER_PAGE;
  const pageData = filtered.slice(start, start + PER_PAGE);

  if (pageData.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="8">
        <div class="empty-state">
          <div class="icon-wrap"><i data-lucide="users-x" class="icon"></i></div>
          <h3>${t('no_results')}</h3>
          <p>${t('no_results_desc')}</p>
        </div>
      </td></tr>`;
    document.getElementById('studentsPagination').innerHTML = '';
    refreshIcons();
    return;
  }

  tbody.innerHTML = pageData.map(s => `
    <tr>
      <td><span style="font-weight:700;color:var(--secondary)">${s.id}</span></td>
      <td>
        <div class="user-cell">
          <div class="avatar" style="background:${s.avatarColor}">${s.initials}</div>
          <div>
            <div class="user-name">${s.name}</div>
            <div class="user-meta">${s.email}</div>
          </div>
        </div>
      </td>
      <td>${lang === 'ar' ? s.gradeAr : s.grade}</td>
      <td><span class="badge badge-neutral">${t('class')} ${s.class}</span></td>
      <td>${fmtDate(s.enrolled)}</td>
      <td>
        <div class="flex items-center gap-2">
          <strong style="color:${s.avgScore >= 75 ? 'var(--success)' : s.avgScore >= 50 ? 'var(--warning)' : 'var(--danger)'}">${s.avgScore}%</strong>
        </div>
      </td>
      <td>${statusBadge(s.status)}</td>
      <td>
        <div class="actions">
          <button class="action-btn" onclick="viewStudent('${s.id}')" data-i18n-title="view" title="View"><i data-lucide="eye" class="icon"></i></button>
          <button class="action-btn" onclick="editStudent('${s.id}')" data-i18n-title="edit" title="Edit"><i data-lucide="pencil" class="icon"></i></button>
          <button class="action-btn danger" onclick="deleteStudent('${s.id}')" data-i18n-title="delete" title="Delete"><i data-lucide="trash-2" class="icon"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(
    document.getElementById('studentsPagination'),
    currentPage, totalPages, filtered.length, PER_PAGE,
    (p) => { currentPage = p; renderTable(); }
  );
  refreshIcons();
}

/* ----------  Wire events  ---------- */
function wireEvents() {
  document.getElementById('filterSearch').addEventListener('input', (e) => {
    filters.search = e.target.value; currentPage = 1; renderTable();
  });
  document.getElementById('filterGrade').addEventListener('change', (e) => {
    filters.grade = e.target.value; currentPage = 1; renderTable();
  });
  document.getElementById('filterClass').addEventListener('change', (e) => {
    filters.class = e.target.value; currentPage = 1; renderTable();
  });
  document.getElementById('filterStatus').addEventListener('change', (e) => {
    filters.status = e.target.value; currentPage = 1; renderTable();
  });
  document.getElementById('viewMode').addEventListener('change', (e) => {
    filters.status = e.target.value === 'all' ? '' : e.target.value;
    document.getElementById('filterStatus').value = filters.status;
    currentPage = 1; renderTable();
  });
  document.getElementById('clearFilters').addEventListener('click', () => {
    filters = { search: '', grade: '', class: '', status: '' };
    document.getElementById('filterSearch').value = '';
    document.getElementById('filterGrade').value = '';
    document.getElementById('filterClass').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('viewMode').value = 'all';
    currentPage = 1; renderTable();
  });
  document.getElementById('addStudentBtn').addEventListener('click', () => openAddModal());
  document.getElementById('saveStudentBtn').addEventListener('click', saveStudent);
  document.getElementById('exportBtn').addEventListener('click', exportStudents);
}

/* ----------  Add/Edit  ---------- */
function openAddModal() {
  document.getElementById('studentModalTitle').textContent = t('add_student');
  document.getElementById('studentIdField').value = '';
  document.getElementById('f_name').value = '';
  document.getElementById('f_email').value = '';
  document.getElementById('f_phone').value = '';
  document.getElementById('f_grade').value = '0';
  document.getElementById('f_class').value = CLASSES[0];
  document.getElementById('f_enrolled').value = new Date().toISOString().slice(0, 10);
  document.getElementById('f_status').value = 'active';
  openModal('studentModal');
  applyTranslations();
}

function editStudent(id) {
  const s = studentsData.find(x => x.id === id);
  if (!s) return;
  document.getElementById('studentModalTitle').textContent = t('edit_student');
  document.getElementById('studentIdField').value = s.id;
  document.getElementById('f_name').value = s.name;
  document.getElementById('f_email').value = s.email;
  document.getElementById('f_phone').value = s.phone;
  document.getElementById('f_grade').value = s.gradeIdx;
  document.getElementById('f_class').value = s.class;
  document.getElementById('f_enrolled').value = s.enrolled;
  document.getElementById('f_status').value = s.status;
  openModal('studentModal');
}

function saveStudent() {
  const name = document.getElementById('f_name').value.trim();
  const email = document.getElementById('f_email').value.trim();
  const gradeIdx = parseInt(document.getElementById('f_grade').value);
  if (!name || !email) {
    showToast('error', t('error') || 'Error', 'Please fill all required fields.');
    return;
  }
  const id = document.getElementById('studentIdField').value;
  if (id) {
    // Edit
    const s = studentsData.find(x => x.id === id);
    if (s) {
      s.name = name;
      s.email = email;
      s.phone = document.getElementById('f_phone').value;
      s.gradeIdx = gradeIdx;
      s.grade = GRADES[gradeIdx];
      s.gradeAr = GRADES_AR[gradeIdx];
      s.class = document.getElementById('f_class').value;
      s.enrolled = document.getElementById('f_enrolled').value;
      s.status = document.getElementById('f_status').value;
      s.initials = initials(name);
      s.avatarColor = avatarColor(name);
    }
    showToast('success', t('updated'), name + ' has been updated.');
  } else {
    // Add
    const newId = 'STU-' + String(1001 + studentsData.length + Math.floor(Math.random() * 100));
    studentsData.push({
      id: newId,
      name, email,
      phone: document.getElementById('f_phone').value || '+212 600000000',
      gradeIdx, grade: GRADES[gradeIdx], gradeAr: GRADES_AR[gradeIdx],
      class: document.getElementById('f_class').value || CLASSES[0],
      enrolled: document.getElementById('f_enrolled').value || new Date().toISOString().slice(0, 10),
      status: document.getElementById('f_status').value,
      avgScore: 50 + Math.floor(Math.random() * 40),
      avatarColor: avatarColor(name),
      initials: initials(name),
      completedLessons: Math.floor(Math.random() * 40) + 10,
      submittedHomework: Math.floor(Math.random() * 25) + 5,
      attendance: 70 + Math.floor(Math.random() * 30),
      parentName: 'Parent of ' + name.split(' ')[0],
      parentPhone: '+212 6' + String(20000000 + Math.floor(Math.random() * 9999999)),
      address: 'Rabat, Morocco',
    });
    showToast('success', t('created'), name + ' has been added.');
  }
  closeModal('studentModal');
  updateMiniStats();
  renderTable();
}

function deleteStudent(id) {
  const s = studentsData.find(x => x.id === id);
  if (!s) return;
  confirmDelete(`${t('confirm_delete')} <br><b>${s.name}</b> (${s.id})`, () => {
    studentsData = studentsData.filter(x => x.id !== id);
    showToast('success', t('deleted'), s.name + ' deleted.');
    updateMiniStats();
    renderTable();
  });
}

/* ----------  View Profile  ---------- */
function viewStudent(id) {
  const s = studentsData.find(x => x.id === id);
  if (!s) return;
  const lang = STATE.lang;
  document.getElementById('profileSubtitle').textContent = s.id + ' · ' + (lang === 'ar' ? s.gradeAr : s.grade) + ' · ' + s.class;
  document.getElementById('profileBody').innerHTML = `
    <div class="profile-hero">
      <div class="profile-hero-avatar" style="background:${s.avatarColor}">${s.initials}</div>
      <div class="profile-hero-info">
        <div class="profile-hero-name">${s.name}</div>
        <div class="profile-hero-meta">
          <span><i data-lucide="mail" class="icon"></i>${s.email}</span>
          <span><i data-lucide="phone" class="icon"></i>${s.phone}</span>
          <span><i data-lucide="map-pin" class="icon"></i>${s.address}</span>
        </div>
      </div>
      ${statusBadge(s.status)}
    </div>
    <div class="profile-stats">
      <div class="profile-stat">
        <div class="profile-stat-value">${s.avgScore}%</div>
        <div class="profile-stat-label">${t('avg_exam_score')}</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-value">${s.completedLessons}</div>
        <div class="profile-stat-label">${t('completed_lessons')}</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-value">${s.submittedHomework}</div>
        <div class="profile-stat-label">${t('submitted_homework')}</div>
      </div>
      <div class="profile-stat">
        <div class="profile-stat-value">${s.attendance}%</div>
        <div class="profile-stat-label">${t('attendance_rate')}</div>
      </div>
    </div>
    <div class="profile-section">
      <div class="profile-section-title"><i data-lucide="user" class="icon"></i>${t('personal_info')}</div>
      <div class="profile-info-grid">
        <div class="profile-info-item"><div class="profile-info-label">${t('student_id')}</div><div class="profile-info-value">${s.id}</div></div>
        <div class="profile-info-item"><div class="profile-info-label">${t('full_name')}</div><div class="profile-info-value">${s.name}</div></div>
        <div class="profile-info-item"><div class="profile-info-label">${t('email')}</div><div class="profile-info-value">${s.email}</div></div>
        <div class="profile-info-item"><div class="profile-info-label">${t('phone')}</div><div class="profile-info-value">${s.phone}</div></div>
        <div class="profile-info-item"><div class="profile-info-label">${t('grade')}</div><div class="profile-info-value">${lang === 'ar' ? s.gradeAr : s.grade}</div></div>
        <div class="profile-info-item"><div class="profile-info-label">${t('class')}</div><div class="profile-info-value">${t('class')} ${s.class}</div></div>
        <div class="profile-info-item"><div class="profile-info-label">${t('enrollment_date')}</div><div class="profile-info-value">${fmtDate(s.enrolled)}</div></div>
        <div class="profile-info-item"><div class="profile-info-label">${t('account_status')}</div><div class="profile-info-value">${statusBadge(s.status)}</div></div>
      </div>
    </div>
    <div class="profile-section">
      <div class="profile-section-title"><i data-lucide="bar-chart-3" class="icon"></i>${t('overall_performance')}</div>
      <div class="profile-chart-wrap"><canvas id="profileChart"></canvas></div>
    </div>
    <div class="profile-section">
      <div class="profile-section-title"><i data-lucide="file-text" class="icon"></i>${t('exam_results')}</div>
      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>${t('exam_title')}</th><th>${t('subject')}</th><th>${t('score')}</th><th>${t('status')}</th></tr></thead>
          <tbody>
            ${EXAMS.slice(0, 4).map(e => {
              const sc = Math.min(100, s.avgScore + (Math.random() * 20 - 10));
              return `<tr>
                <td>${lang === 'ar' ? e.titleAr : e.titleEn}</td>
                <td><span class="badge badge-neutral" style="background:${e.subjectColor}22;color:${e.subjectColor}">${lang === 'ar' ? e.subjectAr : e.subject}</span></td>
                <td><strong>${sc.toFixed(0)}/${e.totalMarks}</strong></td>
                <td>${statusBadge(sc >= e.passingScore ? 'pass' : 'fail')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  openModal('profileModal');
  refreshIcons();
  setTimeout(() => renderProfileChart(s), 80);
}

function renderProfileChart(s) {
  const el = document.getElementById('profileChart');
  if (!el) return;
  if (profileChart) profileChart.destroy();
  const lang = STATE.lang;
  const c = {
    text: STATE.theme === 'dark' ? '#94A3B8' : '#64748B',
    grid: STATE.theme === 'dark' ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.12)',
    tooltipBg: STATE.theme === 'dark' ? '#1E293B' : '#FFFFFF',
    tooltipText: STATE.theme === 'dark' ? '#F1F5F9' : '#1E293B',
    border: STATE.theme === 'dark' ? '#1E293B' : '#E2E8F0',
  };
  const labels = lang === 'ar'
    ? ['سبتمبر','أكتوبر','نوفمبر','ديسمبر','يناير','فبراير']
    : ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const grad = el.getContext('2d').createLinearGradient(0, 0, 0, 220);
  grad.addColorStop(0, 'rgba(37,99,235,0.25)');
  grad.addColorStop(1, 'rgba(37,99,235,0)');
  profileChart = new Chart(el, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: t('score'),
        data: labels.map((_, i) => Math.max(50, Math.min(100, s.avgScore + (Math.random() * 16 - 8) + i * 1.5))),
        borderColor: '#2563EB', backgroundColor: grad, fill: true, tension: 0.4, borderWidth: 3,
        pointRadius: 4, pointBackgroundColor: '#2563EB', pointBorderColor: '#fff', pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8 } },
      scales: { x: { grid: { display: false }, border: { display: false } }, y: { grid: { color: c.grid }, border: { display: false }, min: 0, max: 100, ticks: { callback: v => v + '%' } } },
    },
  });
}

/* ----------  Export  ---------- */
function exportStudents() {
  // Build CSV
  const lang = STATE.lang;
  const rows = [['ID', t('full_name'), t('email'), t('phone'), t('grade'), t('class'), t('enrollment_date'), t('status'), t('avg_score')]];
  studentsData.forEach(s => {
    rows.push([s.id, s.name, s.email, s.phone, lang === 'ar' ? s.gradeAr : s.grade, s.class, s.enrolled, s.status, s.avgScore + '%']);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'students.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('success', t('export_excel'), studentsData.length + ' students exported.');
}
