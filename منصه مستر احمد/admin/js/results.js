/* ==========================================================================
   RESULTS.JS — Page logic for results & grades
   ========================================================================== */

let resultsData = JSON.parse(JSON.stringify(RESULTS));
let filters = { search: '', grade: '', subject: '', status: '' };
let currentPage = 1;
const PER_PAGE = 8;
let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => initResultsPage(), 50);
});

document.addEventListener('langchange', () => {
  populateFilters();
  renderTable();
  renderCharts();
});

document.addEventListener('themechange', () => {
  Object.values(charts).forEach(c => c?.destroy());
  charts = {};
  renderCharts();
});

function initResultsPage() {
  populateFilters();
  renderTable();
  renderCharts();
  wireEvents();
  refreshIcons();
}

function populateFilters() {
  const lang = STATE.lang;
  document.getElementById('filterGrade').innerHTML = `<option value="">${t('grade')}</option>` +
    GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
  document.getElementById('filterSubject').innerHTML = `<option value="">${t('subject')}</option>` +
    SUBJECTS.map((s, i) => `<option value="${i}">${lang === 'ar' ? s.ar : s.en}</option>`).join('');
}

function getFiltered() {
  return resultsData.filter(r => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!(r.name + ' ' + r.studentId).toLowerCase().includes(q)) return false;
    }
    if (filters.grade !== '' && GRADES[filters.grade] !== r.grade && GRADES_AR[filters.grade] !== r.grade) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });
}

function renderTable() {
  const tbody = document.getElementById('resultsTbody');
  const lang = STATE.lang;
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PER_PAGE;
  const pageData = filtered.slice(start, start + PER_PAGE);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <div class="icon-wrap"><i data-lucide="award" class="icon"></i></div>
      <h3>${t('no_results')}</h3><p>${t('no_results_desc')}</p>
    </div></td></tr>`;
    document.getElementById('resultsPagination').innerHTML = '';
    refreshIcons();
    return;
  }

  tbody.innerHTML = pageData.map(r => {
    const rankClass = r.rank === 1 ? 'gold' : (r.rank === 2 ? 'silver' : (r.rank === 3 ? 'bronze' : 'normal'));
    const examColor = r.examScore >= 75 ? 'var(--success)' : (r.examScore >= 50 ? 'var(--warning)' : 'var(--danger)');
    const overallColor = r.overall >= 75 ? 'var(--success)' : (r.overall >= 50 ? 'var(--warning)' : 'var(--danger)');
    return `
      <tr>
        <td><div class="rank-badge ${rankClass}">${r.rank}</div></td>
        <td>
          <div class="user-cell">
            <div class="avatar" style="background:${r.avatarColor}">${r.initials}</div>
            <div><div class="user-name">${r.name}</div><div class="user-meta">${r.studentId}</div></div>
          </div>
        </td>
        <td>${r.grade}</td>
        <td>
          <div class="score-cell">
            <span class="score-num" style="color:${examColor}">${r.examScore}%</span>
            <div class="progress"><div class="progress-bar ${r.examScore >= 75 ? 'success' : (r.examScore >= 50 ? 'warning' : 'danger')}" style="width:${r.examScore}%"></div></div>
          </div>
        </td>
        <td><strong>${r.hwScore}%</strong></td>
        <td><strong>${r.attendance}%</strong></td>
        <td>
          <div class="overall-cell">
            <span class="overall-num" style="color:${overallColor}">${r.overall}%</span>
            <div class="progress" style="max-width:60px"><div class="progress-bar ${r.overall >= 75 ? 'success' : (r.overall >= 50 ? 'warning' : 'danger')}" style="width:${r.overall}%"></div></div>
          </div>
        </td>
        <td>${statusBadge(r.status)}</td>
      </tr>
    `;
  }).join('');

  renderPagination(
    document.getElementById('resultsPagination'),
    currentPage, totalPages, filtered.length, PER_PAGE,
    (p) => { currentPage = p; renderTable(); }
  );
  refreshIcons();
}

function wireEvents() {
  document.getElementById('filterSearch').addEventListener('input', e => { filters.search = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('filterGrade').addEventListener('change', e => { filters.grade = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('filterSubject').addEventListener('change', e => { filters.subject = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('filterStatus').addEventListener('change', e => { filters.status = e.target.value; currentPage = 1; renderTable(); });
  document.getElementById('exportPdfBtn').addEventListener('click', () => exportResults('pdf'));
  document.getElementById('exportExcelBtn').addEventListener('click', () => exportResults('excel'));
}

function chartColors() {
  const dark = STATE.theme === 'dark';
  return {
    text: dark ? '#94A3B8' : '#64748B',
    grid: dark ? 'rgba(148,163,184,0.10)' : 'rgba(148,163,184,0.12)',
    tooltipBg: dark ? '#1E293B' : '#FFFFFF',
    tooltipText: dark ? '#F1F5F9' : '#1E293B',
    border: dark ? '#1E293B' : '#E2E8F0',
  };
}

function renderCharts() {
  const c = chartColors();
  // Distribution chart
  const distEl = document.getElementById('distChart');
  if (distEl) {
    if (charts.dist) charts.dist.destroy();
    const buckets = STATE.lang === 'ar'
      ? ['ممتاز 90+','جيد جداً 75-89','جيد 60-74','مقبول 50-59','راسب <50']
      : ['Excellent 90+', 'Very Good 75-89', 'Good 60-74', 'Pass 50-59', 'Fail <50'];
    const counts = [
      resultsData.filter(r => r.overall >= 90).length,
      resultsData.filter(r => r.overall >= 75 && r.overall < 90).length,
      resultsData.filter(r => r.overall >= 60 && r.overall < 75).length,
      resultsData.filter(r => r.overall >= 50 && r.overall < 60).length,
      resultsData.filter(r => r.overall < 50).length,
    ];
    const colors = ['#10B981', '#2563EB', '#7C3AED', '#F59E0B', '#EF4444'];
    const grad = distEl.getContext('2d').createLinearGradient(0, 0, 0, 240);
    grad.addColorStop(0, '#2563EB');
    grad.addColorStop(1, '#7C3AED');
    charts.dist = new Chart(distEl, {
      type: 'bar',
      data: {
        labels: buckets,
        datasets: [{ label: t('total_students'), data: counts, backgroundColor: colors.map(c => c + 'DD'), borderRadius: 8, barPercentage: 0.6 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8 },
        },
        scales: { x: { grid: { display: false }, border: { display: false } }, y: { grid: { color: c.grid }, border: { display: false }, beginAtZero: true } },
      },
    });
  }

  // Pass/Fail by subject
  const pfEl = document.getElementById('passFailChart');
  if (pfEl) {
    if (charts.pf) charts.pf.destroy();
    const labels = SUBJECTS.map(s => STATE.lang === 'ar' ? s.ar : s.en);
    const passData = SUBJECTS.map((_, i) => 25 + ((i * 7) % 10));
    const failData = SUBJECTS.map((_, i) => 2 + ((i * 3) % 5));
    charts.pf = new Chart(pfEl, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: t('pass'), data: passData, backgroundColor: '#10B981', borderRadius: 4, barPercentage: 0.7 },
          { label: t('fail'), data: failData, backgroundColor: '#EF4444', borderRadius: 4, barPercentage: 0.7 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { boxWidth: 10, boxHeight: 10, padding: 14, font: { size: 11.5 }, color: c.text, usePointStyle: true } },
          tooltip: { backgroundColor: c.tooltipBg, titleColor: c.tooltipText, bodyColor: c.tooltipText, borderColor: c.border, borderWidth: 1, padding: 10, cornerRadius: 8 },
        },
        scales: { x: { grid: { display: false }, border: { display: false } }, y: { grid: { color: c.grid }, border: { display: false }, beginAtZero: true, stacked: true } },
      },
    });
  }
}

function exportResults(format) {
  if (format === 'excel') {
    const rows = [['Rank', t('full_name'), t('grade'), t('exam_results'), t('homework_submissions'), t('attendance_rate'), t('overall_performance'), t('status')]];
    resultsData.forEach(r => rows.push([r.rank, r.name, r.grade, r.examScore + '%', r.hwScore + '%', r.attendance + '%', r.overall + '%', r.status]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('success', t('export_excel'), resultsData.length + ' results exported.');
  } else {
    showToast('success', t('export_pdf'), 'Results PDF exported.');
    // Trigger print dialog as PDF export simulation
    setTimeout(() => window.print(), 400);
  }
}
