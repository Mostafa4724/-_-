/* ==========================================================================
   HOMEWORK.JS — Page logic for homework management
   ========================================================================== */

let hwData = JSON.parse(JSON.stringify(HOMEWORK));
let filters = { search: '', subject: '', grade: '', status: '' };
let currentPage = 1;
const PER_PAGE = 8;
let uploadedFiles = [];
let currentReviewHw = null;
let currentReviewStudent = null;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => initHwPage(), 50);
});

document.addEventListener('langchange', () => {
  populateFilters();
  renderTable();
});

function initHwPage() {
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
  document.getElementById('h_subject').innerHTML = SUBJECTS.map((s, i) => `<option value="${i}">${lang === 'ar' ? s.ar : s.en}</option>`).join('');
  document.getElementById('h_grade').innerHTML = GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
  document.getElementById('h_class').innerHTML = CLASSES.map(c => `<option value="${c}">${t('class')} ${c}</option>`).join('');
}

function updateStats() {
  document.getElementById('hw-total').textContent = hwData.length;
  document.getElementById('hw-pending').textContent = hwData.filter(h => h.status === 'pending').length;
  document.getElementById('hw-submitted').textContent = hwData.filter(h => h.status === 'submitted').length;
  document.getElementById('hw-review').textContent = hwData.filter(h => h.status === 'under_review').length;
  document.getElementById('hw-done').textContent = hwData.filter(h => h.status === 'graded').length;
}

function getFiltered() {
  return hwData.filter(h => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = (h.titleEn + ' ' + h.titleAr + ' ' + h.subject + ' ' + h.subjectAr).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.subject !== '' && h.subjectIdx !== parseInt(filters.subject)) return false;
    if (filters.grade !== '' && h.gradeIdx !== parseInt(filters.grade)) return false;
    if (filters.status && h.status !== filters.status) return false;
    return true;
  });
}

function renderTable() {
  const tbody = document.getElementById('hwTbody');
  const lang = STATE.lang;
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PER_PAGE;
  const pageData = filtered.slice(start, start + PER_PAGE);

  if (pageData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <div class="icon-wrap"><i data-lucide="clipboard-x" class="icon"></i></div>
      <h3>${t('no_results')}</h3><p>${t('no_results_desc')}</p>
    </div></td></tr>`;
    document.getElementById('hwPagination').innerHTML = '';
    refreshIcons();
    return;
  }

  tbody.innerHTML = pageData.map(h => `
    <tr>
      <td>
        <div class="user-name">${lang === 'ar' ? h.titleAr : h.titleEn}</div>
        <div class="user-meta">${lang === 'ar' ? h.gradeAr : h.grade} · ${h.class}</div>
      </td>
      <td><span class="badge badge-neutral" style="background:${h.subjectColor}22;color:${h.subjectColor}">${lang === 'ar' ? h.subjectAr : h.subject}</span></td>
      <td>${lang === 'ar' ? h.gradeAr : h.grade}</td>
      <td>${fmtDate(h.deadline)}</td>
      <td><strong>${h.totalMarks}</strong></td>
      <td><strong>${h.submissions}</strong></td>
      <td>${statusBadge(h.status)}</td>
      <td>
        <div class="actions">
          ${(h.status === 'submitted' || h.status === 'under_review') ? `<button class="action-btn" onclick="openReview('${h.id}')" title="${t('review_submission')}"><i data-lucide="eye" class="icon"></i></button>` : ''}
          <button class="action-btn" onclick="editHw('${h.id}')" title="${t('edit')}"><i data-lucide="pencil" class="icon"></i></button>
          <button class="action-btn danger" onclick="deleteHw('${h.id}')" title="${t('delete')}"><i data-lucide="trash-2" class="icon"></i></button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination(
    document.getElementById('hwPagination'),
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
  document.getElementById('createHwBtn').addEventListener('click', openCreateModal);
  document.getElementById('saveHwBtn').addEventListener('click', saveHw);
  document.getElementById('saveReviewBtn').addEventListener('click', saveReview);

  document.getElementById('hwFilesDrop').addEventListener('click', () => document.getElementById('hwFilesInput').click());
  document.getElementById('hwFilesInput').addEventListener('change', e => {
    uploadedFiles = Array.from(e.target.files).map(f => f.name);
    renderHwFiles();
  });
}

function renderHwFiles() {
  const c = document.getElementById('hwFilesList');
  if (!uploadedFiles.length) { c.innerHTML = ''; return; }
  c.innerHTML = uploadedFiles.map((f, i) => `
    <div class="flex items-center gap-2" style="padding:8px;background:var(--card-2);border-radius:var(--r-sm);margin-bottom:4px">
      <i data-lucide="file-text" class="icon" style="width:16px;height:16px;color:var(--secondary)"></i>
      <span style="flex:1;font-size:12.5px">${f}</span>
      <button class="action-btn danger" onclick="removeHwFile(${i})"><i data-lucide="x" class="icon"></i></button>
    </div>
  `).join('');
  refreshIcons();
}

function removeHwFile(i) { uploadedFiles.splice(i, 1); renderHwFiles(); }

function openCreateModal() {
  document.getElementById('hwModalTitle').textContent = t('create_homework');
  document.getElementById('hwIdField').value = '';
  document.getElementById('h_title').value = '';
  document.getElementById('h_desc').value = '';
  document.getElementById('h_subject').value = '0';
  document.getElementById('h_grade').value = '0';
  document.getElementById('h_class').value = CLASSES[0];
  document.getElementById('h_marks').value = 20;
  document.getElementById('h_deadline').value = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  document.getElementById('h_status').value = 'pending';
  uploadedFiles = [];
  renderHwFiles();
  openModal('hwModal');
}

function editHw(id) {
  const h = hwData.find(x => x.id === id);
  if (!h) return;
  document.getElementById('hwModalTitle').textContent = t('edit_homework');
  document.getElementById('hwIdField').value = h.id;
  document.getElementById('h_title').value = STATE.lang === 'ar' ? h.titleAr : h.titleEn;
  document.getElementById('h_desc').value = '';
  document.getElementById('h_subject').value = h.subjectIdx;
  document.getElementById('h_grade').value = h.gradeIdx;
  document.getElementById('h_class').value = h.class;
  document.getElementById('h_marks').value = h.totalMarks;
  document.getElementById('h_deadline').value = h.deadline;
  document.getElementById('h_status').value = h.status === 'late' ? 'pending' : h.status;
  uploadedFiles = [...h.files];
  renderHwFiles();
  openModal('hwModal');
}

function saveHw() {
  const title = document.getElementById('h_title').value.trim();
  const subjIdx = parseInt(document.getElementById('h_subject').value);
  if (!title) {
    showToast('error', 'Error', 'Please fill all required fields.');
    return;
  }
  const subj = SUBJECTS[subjIdx];
  const id = document.getElementById('hwIdField').value;
  if (id) {
    const h = hwData.find(x => x.id === id);
    if (h) {
      h.titleEn = title; h.titleAr = title;
      h.subjectIdx = subjIdx; h.subject = subj.en; h.subjectAr = subj.ar; h.subjectColor = subj.color;
      h.gradeIdx = parseInt(document.getElementById('h_grade').value);
      h.grade = GRADES[h.gradeIdx]; h.gradeAr = GRADES_AR[h.gradeIdx];
      h.class = document.getElementById('h_class').value;
      h.totalMarks = parseInt(document.getElementById('h_marks').value);
      h.deadline = document.getElementById('h_deadline').value;
      h.status = document.getElementById('h_status').value;
      h.files = [...uploadedFiles];
    }
    showToast('success', t('updated'), title + ' updated.');
  } else {
    const newId = 'HW-' + String(401 + hwData.length + Math.floor(Math.random() * 100));
    hwData.push({
      id: newId, titleEn: title, titleAr: title,
      subjectIdx: subjIdx, subject: subj.en, subjectAr: subj.ar, subjectColor: subj.color,
      gradeIdx: parseInt(document.getElementById('h_grade').value),
      grade: GRADES[parseInt(document.getElementById('h_grade').value)],
      gradeAr: GRADES_AR[parseInt(document.getElementById('h_grade').value)],
      class: document.getElementById('h_class').value,
      created: new Date().toISOString().slice(0, 10),
      deadline: document.getElementById('h_deadline').value,
      totalMarks: parseInt(document.getElementById('h_marks').value),
      status: document.getElementById('h_status').value,
      submissions: 0, pending: 0,
      files: [...uploadedFiles],
    });
    showToast('success', t('created'), title + ' created.');
  }
  closeModal('hwModal');
  updateStats();
  renderTable();
}

function deleteHw(id) {
  const h = hwData.find(x => x.id === id);
  if (!h) return;
  confirmDelete(`${t('confirm_delete')} <br><b>${STATE.lang === 'ar' ? h.titleAr : h.titleEn}</b>`, () => {
    hwData = hwData.filter(x => x.id !== id);
    showToast('success', t('deleted'), 'Homework deleted.');
    updateStats();
    renderTable();
  });
}

/* ----------  Review Submission  ---------- */
function openReview(id) {
  const h = hwData.find(x => x.id === id);
  if (!h) return;
  currentReviewHw = h;
  // Pick a sample student
  const student = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
  currentReviewStudent = student;
  const lang = STATE.lang;
  document.getElementById('reviewTitle').textContent = lang === 'ar' ? h.titleAr : h.titleEn;
  document.getElementById('reviewBody').innerHTML = `
    <div class="review-submission">
      <div class="review-student">
        <div class="avatar" style="background:${student.avatarColor}">${student.initials}</div>
        <div style="flex:1">
          <div class="user-name">${student.name}</div>
          <div class="user-meta">${student.id} · ${lang === 'ar' ? student.gradeAr : student.grade}</div>
        </div>
        ${statusBadge(h.status)}
      </div>
      <div class="profile-section-title" style="margin-bottom:8px"><i data-lucide="file-text" class="icon"></i>${t('student_answer')}</div>
      <div class="review-answer">
        ${STATE.lang === 'ar'
          ? 'هذه إجابة الطالب على الواجب المحدد. قام الطالب بحل جميع الأسئلة المطلوبة وقدم شرحاً وافياً للخطوات المتبعة في الوصول إلى الحل النهائي.'
          : 'This is the student\'s answer to the assigned homework. The student has solved all required questions and provided a comprehensive explanation of the steps taken to reach the final solution.'}
      </div>
      <div class="profile-section-title" style="margin-bottom:8px"><i data-lucide="paperclip" class="icon"></i>${t('attached_files')}</div>
      <div class="review-file">
        <i data-lucide="file-text" class="icon"></i>
        <div style="flex:1">
          <div style="font-weight:600;font-size:13px">${student.name.split(' ')[0]}_submission.pdf</div>
          <div class="user-meta">2.4 MB · ${fmtDate(h.deadline)}</div>
        </div>
        <button class="btn btn-secondary btn-sm"><i data-lucide="download" class="icon"></i></button>
      </div>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">${t('score')} <span class="req">*</span> <span class="text-2 text-xs">(/ ${h.totalMarks})</span></label>
        <input type="number" class="form-control" id="r_score" min="0" max="${h.totalMarks}" value="${Math.round(h.totalMarks * 0.8)}">
      </div>
      <div class="form-group">
        <label class="form-label">${t('status')}</label>
        <select class="form-control" id="r_status">
          <option value="graded" data-i18n="graded">Graded</option>
          <option value="under_review" data-i18n="under_review">Under Review</option>
        </select>
      </div>
      <div class="form-group" style="grid-column:span 2">
        <label class="form-label">${t('feedback')}</label>
        <textarea class="form-control" id="r_feedback" rows="4" placeholder="${STATE.lang === 'ar' ? 'اكتب ملاحظاتك للطالب هنا...' : 'Write your feedback to the student here...'}"></textarea>
      </div>
    </div>
  `;
  openModal('reviewModal');
  refreshIcons();
}

function saveReview() {
  if (!currentReviewHw) return;
  const score = parseInt(document.getElementById('r_score').value);
  const status = document.getElementById('r_status').value;
  currentReviewHw.status = status;
  showToast('success', t('graded'), `${currentReviewStudent.name} graded: ${score}/${currentReviewHw.totalMarks}`);
  closeModal('reviewModal');
  updateStats();
  renderTable();
  currentReviewHw = null;
  currentReviewStudent = null;
}
