/* ==========================================================================
   DASHBOARD.JS — Page logic for the main dashboard
   ========================================================================== */

let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  // Wait for shared.js to render sidebar/topbar
  setTimeout(() => {
    initDashboard();
  }, 50);
});

// Re-render when language or theme changes
document.addEventListener('langchange', () => initDashboard());
document.addEventListener('themechange', () => {
  // Re-render charts with new theme colors
  Object.values(charts).forEach(c => c?.destroy());
  charts = {};
  initDashboard();
});

function initDashboard() {
  renderRecentStudents();
  renderUpcomingExams();
  renderRecentLessons();
  renderPendingReviews();
  renderActivityFeed();
  renderSparklines();
  renderActivityChart();
  renderExamChart();
  renderHomeworkChart();
  renderPerfChart();
  refreshIcons();
}

/* ----------  Recent Students  ---------- */
function renderRecentStudents() {
  const container = document.getElementById('recentStudents');
  if (!container) return;
  const lang = STATE.lang;
  const recent = STUDENTS.slice(0, 5).reverse().slice(0, 5);
  container.innerHTML = recent.map(s => `
    <div class="list-item" onclick="window.location.href='students.html'">
      <div class="avatar" style="background:${s.avatarColor}">${s.initials}</div>
      <div class="li-content">
        <div class="li-title">${s.name}</div>
        <div class="li-sub">${lang === 'ar' ? s.gradeAr : s.grade} · ${s.id}</div>
      </div>
      <div class="li-meta">${fmtDate(s.enrolled)}</div>
    </div>
  `).join('');
}

/* ----------  Upcoming Exams  ---------- */
function renderUpcomingExams() {
  const container = document.getElementById('upcomingExams');
  if (!container) return;
  const lang = STATE.lang;
  container.innerHTML = EXAMS.filter(e => e.status === 'scheduled' || e.status === 'active').slice(0, 5).map(e => `
    <div class="list-item" onclick="window.location.href='exams.html'">
      <div class="li-icon" style="background:${e.subjectColor}">
        <i data-lucide="file-text" class="icon"></i>
      </div>
      <div class="li-content">
        <div class="li-title">${lang === 'ar' ? e.titleAr : e.titleEn}</div>
        <div class="li-sub">${lang === 'ar' ? e.gradeAr : e.grade} · ${e.numQuestions} ${t('num_questions').toLowerCase()}</div>
      </div>
      <div class="li-meta">${statusBadge(e.status)}</div>
    </div>
  `).join('');
}

/* ----------  Recent Lessons  ---------- */
function renderRecentLessons() {
  const container = document.getElementById('recentLessons');
  if (!container) return;
  const lang = STATE.lang;
  container.innerHTML = LESSONS.filter(l => l.status === 'published').slice(-5).reverse().map(l => `
    <div class="list-item" onclick="window.location.href='lessons.html'">
      <div class="li-icon" style="background:${l.subjectColor}">
        <i data-lucide="${l.subjectIcon}" class="icon"></i>
      </div>
      <div class="li-content">
        <div class="li-title">${lang === 'ar' ? l.titleAr : l.titleEn}</div>
        <div class="li-sub">${lang === 'ar' ? l.gradeAr : l.grade} · ${l.views} ${t('views')}</div>
      </div>
      <div class="li-meta">${statusBadge(l.status)}</div>
    </div>
  `).join('');
}

/* ----------  Pending Reviews Table  ---------- */
function renderPendingReviews() {
  const tbody = document.getElementById('pendingReviewsTbody');
  if (!tbody) return;
  const lang = STATE.lang;
  const items = HOMEWORK.filter(h => h.status === 'under_review' || h.status === 'submitted').slice(0, 5);
  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-2" style="padding:32px">${t('no_results')}</td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(h => `
    <tr style="cursor:pointer" onclick="window.location.href='homework.html'">
      <td>
        <div class="user-name">${lang === 'ar' ? h.titleAr : h.titleEn}</div>
        <div class="user-meta">${lang === 'ar' ? h.gradeAr : h.grade} · ${h.class}</div>
      </td>
      <td>
        <span class="badge badge-neutral" style="background:${h.subjectColor}22;color:${h.subjectColor}">
          ${lang === 'ar' ? h.subjectAr : h.subject}
        </span>
      </td>
      <td><strong>${h.submissions}</strong></td>
      <td>${statusBadge(h.status)}</td>
    </tr>
  `).join('');
}

/* ----------  Activity Feed  ---------- */
function renderActivityFeed() {
  const container = document.getElementById('activityFeed');
  if (!container) return;
  const lang = STATE.lang;
  container.innerHTML = ACTIVITY.map(a => `
    <div class="activity-item">
      <div class="activity-icon" style="background:${a.color}">
        <i data-lucide="${a.icon}" class="icon"></i>
      </div>
      <div class="activity-content">
        <div class="activity-text">${lang === 'ar' ? a.textAr : a.textEn}</div>
        <div class="activity-time">${lang === 'ar' ? a.timeAr : a.time}</div>
      </div>
    </div>
  `).join('');
}

/* ----------  Chart helpers  ---------- */
function chartColors() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: dark ? '#94A3B8' : '#64748B',
    grid: dark ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.12)',
    tooltipBg: dark ? '#1E293B' : '#FFFFFF',
    tooltipText: dark ? '#F1F5F9' : '#1E293B',
    border: dark ? '#1E293B' : '#E2E8F0',
  };
}

function chartDefaults() {
  const c = chartColors();
  Chart.defaults.font.family = STATE.lang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif";
  Chart.defaults.color = c.text;
  Chart.defaults.borderColor = c.grid;
}

/* ----------  Sparklines  ---------- */
function renderSparklines() {
  const dataSets = [
    { id: 'spark1', color: '#2563EB', data: [12, 18, 15, 22, 28, 25, 32, 30, 38, 42] },
    { id: 'spark2', color: '#10B981', data: [40, 38, 45, 42, 48, 50, 47, 52, 55, 58] },
    { id: 'spark3', color: '#7C3AED', data: [120, 135, 142, 138, 156, 162, 170, 168, 175, 186] },
    { id: 'spark4', color: '#F59E0B', data: [50, 48, 45, 47, 44, 46, 43, 42, 44, 42] },
    { id: 'spark5', color: '#EF4444', data: [40, 45, 52, 48, 55, 60, 58, 62, 65, 68] },
    { id: 'spark6', color: '#0EA5E9', data: [72, 74, 73, 76, 75, 77, 76, 78, 77, 78.4] },
  ];
  dataSets.forEach(d => {
    const el = document.getElementById(d.id);
    if (!el) return;
    if (charts[d.id]) charts[d.id].destroy();
    charts[d.id] = new Chart(el, {
      type: 'line',
      data: {
        labels: d.data.map((_, i) => i),
        datasets: [{
          data: d.data,
          borderColor: d.color,
          borderWidth: 2,
          fill: true,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 36);
            g.addColorStop(0, d.color + '40');
            g.addColorStop(1, d.color + '00');
            return g;
          },
          tension: 0.4,
          pointRadius: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });
  });
}

/* ----------  Activity Chart (Bar)  ---------- */
function renderActivityChart() {
  const el = document.getElementById('activityChart');
  if (!el) return;
  if (charts.activity) charts.activity.destroy();
  const c = chartColors();
  const lang = STATE.lang;
  const days = lang === 'ar'
    ? ['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const grad1 = el.getContext('2d').createLinearGradient(0, 0, 0, 260);
  grad1.addColorStop(0, '#2563EB');
  grad1.addColorStop(1, '#7C3AED');
  const grad2 = el.getContext('2d').createLinearGradient(0, 0, 0, 260);
  grad2.addColorStop(0, 'rgba(148,163,184,0.5)');
  grad2.addColorStop(1, 'rgba(148,163,184,0.1)');
  charts.activity = new Chart(el, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        { label: t('active'), data: [320, 410, 380, 460, 420, 280, 340], backgroundColor: grad1, borderRadius: 6, barPercentage: 0.6 },
        { label: t('inactive'), data: [80, 95, 70, 110, 90, 60, 75], backgroundColor: grad2, borderRadius: 6, barPercentage: 0.6 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8, displayColors: true },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: c.grid }, border: { display: false }, beginAtZero: true },
      },
    },
  });
}

/* ----------  Exam Performance Chart (Doughnut)  ---------- */
function renderExamChart() {
  const el = document.getElementById('examChart');
  if (!el) return;
  if (charts.exam) charts.exam.destroy();
  const c = chartColors();
  const lang = STATE.lang;
  const labels = SUBJECTS.map(s => lang === 'ar' ? s.ar : s.en);
  const data = SUBJECTS.map((_, i) => 65 + ((i * 17) % 30));
  charts.exam = new Chart(el, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: SUBJECTS.map(s => s.color),
        borderColor: c.tooltipBg,
        borderWidth: 3,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 }, color: c.text, usePointStyle: true, pointStyle: 'circle' },
        },
        tooltip: { backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8, callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } },
      },
    },
  });
}

/* ----------  Homework Chart (Line)  ---------- */
function renderHomeworkChart() {
  const el = document.getElementById('homeworkChart');
  if (!el) return;
  if (charts.homework) charts.homework.destroy();
  const c = chartColors();
  const lang = STATE.lang;
  const labels = lang === 'ar'
    ? ['الأسبوع 1','الأسبوع 2','الأسبوع 3','الأسبوع 4']
    : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  const grad = el.getContext('2d').createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, 'rgba(16,185,129,0.30)');
  grad.addColorStop(1, 'rgba(16,185,129,0)');
  charts.homework = new Chart(el, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: t('submitted'), data: [180, 220, 195, 260], borderColor: '#10B981', backgroundColor: grad, fill: true, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#10B981', pointBorderColor: '#fff', pointBorderWidth: 2 },
        { label: t('pending'), data: [40, 55, 35, 48], borderColor: '#F59E0B', backgroundColor: 'transparent', fill: false, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#F59E0B', pointBorderColor: '#fff', pointBorderWidth: 2, borderDash: [6,4] },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 10, boxHeight: 10, padding: 14, font: { size: 11.5 }, color: c.text, usePointStyle: true } },
        tooltip: { backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8 },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: c.grid }, border: { display: false }, beginAtZero: true },
      },
    },
  });
}

/* ----------  Performance Over Time (Line multi)  ---------- */
function renderPerfChart() {
  const el = document.getElementById('perfChart');
  if (!el) return;
  if (charts.perf) charts.perf.destroy();
  const c = chartColors();
  const lang = STATE.lang;
  const labels = lang === 'ar'
    ? ['يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر']
    : ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const grad = el.getContext('2d').createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, 'rgba(37,99,235,0.25)');
  grad.addColorStop(1, 'rgba(37,99,235,0)');
  charts.perf = new Chart(el, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: t('exam_results'), data: [68, 72, 70, 75, 78, 82], borderColor: '#2563EB', backgroundColor: grad, fill: true, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#2563EB', pointBorderColor: '#fff', pointBorderWidth: 2 },
        { label: t('homework_submissions'), data: [62, 65, 68, 72, 74, 78], borderColor: '#7C3AED', backgroundColor: 'transparent', fill: false, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#7C3AED', pointBorderColor: '#fff', pointBorderWidth: 2 },
        { label: t('attendance_rate'), data: [85, 88, 86, 90, 92, 94], borderColor: '#10B981', backgroundColor: 'transparent', fill: false, tension: 0.4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#10B981', pointBorderColor: '#fff', pointBorderWidth: 2 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 10, boxHeight: 10, padding: 14, font: { size: 11.5 }, color: c.text, usePointStyle: true } },
        tooltip: { backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8 },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: c.grid }, border: { display: false }, beginAtZero: false, min: 50, max: 100, ticks: { callback: (v) => v + '%' } },
      },
    },
  });
}

/* Date range button cycle */
document.addEventListener('click', (e) => {
  if (e.target.closest('#dateRangeBtn')) {
    showToast('info', t('this_month'), 'Showing data for current month.');
  }
  if (e.target.closest('#periodBtn')) {
    showToast('info', t('this_month'), 'Period updated.');
  }
});
