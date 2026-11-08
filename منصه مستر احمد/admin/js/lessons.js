/* ==========================================================================
   LESSONS.JS — Page logic for lessons management
   ========================================================================== */

let lessonsData = JSON.parse(JSON.stringify(LESSONS));
let filters = { search: '', subject: '', grade: '', status: '' };
let sortBy = 'recent';
let viewMode = 'grid';
let currentPage = 1;
const PER_PAGE = 9;
let uploadedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => initLessonsPage(), 50);
});

document.addEventListener('langchange', () => {
  populateFilters();
  renderLessons();
});

function initLessonsPage() {
  populateFilters();
  renderLessons();
  updateStats();
  wireEvents();
  refreshIcons();
}

function populateFilters() {
  const lang = STATE.lang;
  const subjSel = document.getElementById('filterSubject');
  const lSubj = document.getElementById('l_subject');
  const gradeSel = document.getElementById('filterGrade');
  const lGrade = document.getElementById('l_grade');

  subjSel.innerHTML = `<option value="">${t('subject')}</option>` +
    SUBJECTS.map((s, i) => `<option value="${i}">${lang === 'ar' ? s.ar : s.en}</option>`).join('');
  lSubj.innerHTML = SUBJECTS.map((s, i) => `<option value="${i}">${lang === 'ar' ? s.ar : s.en}</option>`).join('');

  gradeSel.innerHTML = `<option value="">${t('grade')}</option>` +
    GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
  lGrade.innerHTML = GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
}

function updateStats() {
  document.getElementById('lstat-total').textContent = lessonsData.length;
  document.getElementById('lstat-published').textContent = lessonsData.filter(l => l.status === 'published').length;
  document.getElementById('lstat-draft').textContent = lessonsData.filter(l => l.status === 'draft').length;
  const totalViews = lessonsData.reduce((s, l) => s + l.views, 0);
  document.getElementById('lstat-views').textContent = totalViews > 1000 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews;
}

function getFiltered() {
  let list = lessonsData.filter(l => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = (l.titleEn + ' ' + l.titleAr + ' ' + l.subject + ' ' + l.subjectAr).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.subject !== '' && l.subjectIdx !== parseInt(filters.subject)) return false;
    if (filters.grade !== '' && l.gradeIdx !== parseInt(filters.grade)) return false;
    if (filters.status && l.status !== filters.status) return false;
    return true;
  });
  if (sortBy === 'recent') list.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  else if (sortBy === 'views') list.sort((a, b) => b.views - a.views);
  else if (sortBy === 'title') list.sort((a, b) => a.titleEn.localeCompare(b.titleEn));
  return list;
}

function renderLessons() {
  const container = document.getElementById('lessonsContainer');
  const lang = STATE.lang;
  const filtered = getFiltered();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PER_PAGE;
  const pageData = filtered.slice(start, start + PER_PAGE);

  if (pageData.length === 0) {
    container.innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="icon-wrap"><i data-lucide="book-x" class="icon"></i></div>
          <h3>${t('no_results')}</h3>
          <p>${t('no_results_desc')}</p>
        </div>
      </div>`;
    refreshIcons();
    return;
  }

  if (viewMode === 'grid') {
    container.innerHTML = `
      <div class="lessons-grid">
        ${pageData.map(l => lessonCardHTML(l)).join('')}
      </div>
      <div class="card" style="margin-top:20px"><div class="pagination" id="lessonsPagination"></div></div>
    `;
  } else {
    container.innerHTML = `
      <div class="card">
        <div class="table-wrap">
          <table class="table">
            <thead><tr>
              <th>${t('lesson_title')}</th>
              <th>${t('subject')}</th>
              <th>${t('grade')}</th>
              <th>${t('lesson_views')}</th>
              <th>${t('publication_date')}</th>
              <th>${t('status')}</th>
              <th>${t('actions')}</th>
            </tr></thead>
            <tbody>
              ${pageData.map(l => `
                <tr>
                  <td>
                    <div class="user-cell">
                      <div class="lesson-row-thumb" style="background:${l.subjectColor}"><i data-lucide="${l.subjectIcon}" class="icon"></i></div>
                      <div>
                        <div class="user-name">${lang === 'ar' ? l.titleAr : l.titleEn}</div>
                        <div class="user-meta">${l.files.length} files</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-neutral" style="background:${l.subjectColor}22;color:${l.subjectColor}">${lang === 'ar' ? l.subjectAr : l.subject}</span></td>
                  <td>${lang === 'ar' ? l.gradeAr : l.grade}</td>
                  <td><strong>${l.views}</strong></td>
                  <td>${fmtDate(l.pubDate)}</td>
                  <td>${statusBadge(l.status)}</td>
                  <td>
                    <div class="actions">
                      <button class="action-btn" onclick="viewLesson('${l.id}')" title="${t('view')}"><i data-lucide="eye" class="icon"></i></button>
                      <button class="action-btn" onclick="editLesson('${l.id}')" title="${t('edit')}"><i data-lucide="pencil" class="icon"></i></button>
                      <button class="action-btn" onclick="togglePublish('${l.id}')" title="${l.status === 'published' ? t('unpublish') : t('publish')}"><i data-lucide="${l.status === 'published' ? 'eye-off' : 'send'}" class="icon"></i></button>
                      <button class="action-btn danger" onclick="deleteLesson('${l.id}')" title="${t('delete')}"><i data-lucide="trash-2" class="icon"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination" id="lessonsPagination"></div>
      </div>
    `;
  }

  renderPagination(
    document.getElementById('lessonsPagination'),
    currentPage, totalPages, filtered.length, PER_PAGE,
    (p) => { currentPage = p; renderLessons(); }
  );
  refreshIcons();
}

function lessonCardHTML(l) {
  const lang = STATE.lang;
  return `
    <div class="lesson-card">
      <div class="lesson-thumb" style="background:linear-gradient(135deg, ${l.subjectColor}, ${l.subjectColor}cc)">
        <div class="lesson-thumb-badge">${statusBadge(l.status)}</div>
        <div class="lesson-thumb-icon"><i data-lucide="play" class="icon"></i></div>
        <div class="lesson-thumb-duration">${l.duration} min</div>
      </div>
      <div class="lesson-body">
        <span class="lesson-subject-tag" style="background:${l.subjectColor}22;color:${l.subjectColor}">
          <i data-lucide="${l.subjectIcon}" class="icon"></i>${lang === 'ar' ? l.subjectAr : l.subject}
        </span>
        <div class="lesson-title">${lang === 'ar' ? l.titleAr : l.titleEn}</div>
        <div class="lesson-desc">${lang === 'ar' ? l.descAr : l.descEn}</div>
        <div class="flex gap-2" style="flex-wrap:wrap">
          <span class="badge badge-neutral">${lang === 'ar' ? l.gradeAr : l.grade}</span>
          ${l.files.length ? `<span class="badge badge-info"><i data-lucide="paperclip" class="icon" style="width:11px;height:11px"></i>${l.files.length}</span>` : ''}
        </div>
        <div class="lesson-meta">
          <div class="flex gap-3">
            <span class="lesson-meta-item"><i data-lucide="eye" class="icon"></i>${l.views}</span>
            <span class="lesson-meta-item"><i data-lucide="calendar" class="icon"></i>${fmtDate(l.pubDate)}</span>
          </div>
          <div class="lesson-actions">
            <button class="action-btn" onclick="viewLesson('${l.id}')" title="${t('view')}"><i data-lucide="eye" class="icon"></i></button>
            <button class="action-btn" onclick="editLesson('${l.id}')" title="${t('edit')}"><i data-lucide="pencil" class="icon"></i></button>
            <button class="action-btn danger" onclick="deleteLesson('${l.id}')" title="${t('delete')}"><i data-lucide="trash-2" class="icon"></i></button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function wireEvents() {
  document.getElementById('filterSearch').addEventListener('input', e => { filters.search = e.target.value; currentPage = 1; renderLessons(); });
  document.getElementById('filterSubject').addEventListener('change', e => { filters.subject = e.target.value; currentPage = 1; renderLessons(); });
  document.getElementById('filterGrade').addEventListener('change', e => { filters.grade = e.target.value; currentPage = 1; renderLessons(); });
  document.getElementById('filterStatus').addEventListener('change', e => { filters.status = e.target.value; currentPage = 1; renderLessons(); });
  document.getElementById('sortBy').addEventListener('change', e => { sortBy = e.target.value; renderLessons(); });
  document.getElementById('viewGrid').addEventListener('click', () => { viewMode = 'grid'; document.getElementById('viewGrid').classList.add('active'); document.getElementById('viewTable').classList.remove('active'); renderLessons(); });
  document.getElementById('viewTable').addEventListener('click', () => { viewMode = 'table'; document.getElementById('viewTable').classList.add('active'); document.getElementById('viewGrid').classList.remove('active'); renderLessons(); });
  document.getElementById('addLessonBtn').addEventListener('click', openAddModal);
  document.getElementById('saveLessonBtn').addEventListener('click', saveLesson);

  // File drop handlers
  document.getElementById('thumbDrop').addEventListener('click', () => document.getElementById('thumbInput').click());
  document.getElementById('thumbInput').addEventListener('change', e => {
    if (e.target.files.length) {
      document.getElementById('thumbDrop').innerHTML = `<i data-lucide="image" class="icon" style="color:var(--success)"></i><div><strong>${e.target.files[0].name}</strong></div>`;
      refreshIcons();
    }
  });
  document.getElementById('filesDrop').addEventListener('click', () => document.getElementById('filesInput').click());
  document.getElementById('filesInput').addEventListener('change', e => {
    uploadedFiles = Array.from(e.target.files).map(f => f.name);
    renderFilesList();
  });
}

function renderFilesList() {
  const c = document.getElementById('filesList');
  if (!uploadedFiles.length) { c.innerHTML = ''; return; }
  c.innerHTML = uploadedFiles.map((f, i) => `
    <div class="flex items-center gap-2" style="padding:8px;background:var(--card-2);border-radius:var(--r-sm);margin-bottom:4px">
      <i data-lucide="file-text" class="icon" style="width:16px;height:16px;color:var(--secondary)"></i>
      <span style="flex:1;font-size:12.5px">${f}</span>
      <button class="action-btn danger" onclick="removeFile(${i})"><i data-lucide="x" class="icon"></i></button>
    </div>
  `).join('');
  refreshIcons();
}

function removeFile(i) {
  uploadedFiles.splice(i, 1);
  renderFilesList();
}

function openAddModal() {
  document.getElementById('lessonModalTitle').textContent = t('add_lesson');
  document.getElementById('lessonIdField').value = '';
  document.getElementById('l_title').value = '';
  document.getElementById('l_desc').value = '';
  document.getElementById('l_subject').value = '0';
  document.getElementById('l_grade').value = '0';
  document.getElementById('l_video').value = '';
  document.getElementById('l_status').value = 'draft';
  document.getElementById('thumbDrop').innerHTML = `<i data-lucide="image" class="icon"></i><div><strong>Click to upload</strong> or drag and drop</div><div class="text-xs text-3 mt-2">PNG, JPG up to 2MB</div>`;
  document.getElementById('filesDrop').innerHTML = `<i data-lucide="upload-cloud" class="icon"></i><div><strong>Upload PDF</strong> or educational materials</div><div class="text-xs text-3 mt-2">PDF, DOCX, PPTX up to 10MB</div>`;
  uploadedFiles = [];
  renderFilesList();
  openModal('lessonModal');
  refreshIcons();
}

function editLesson(id) {
  const l = lessonsData.find(x => x.id === id);
  if (!l) return;
  document.getElementById('lessonModalTitle').textContent = t('edit_lesson');
  document.getElementById('lessonIdField').value = l.id;
  document.getElementById('l_title').value = STATE.lang === 'ar' ? l.titleAr : l.titleEn;
  document.getElementById('l_desc').value = STATE.lang === 'ar' ? l.descAr : l.descEn;
  document.getElementById('l_subject').value = l.subjectIdx;
  document.getElementById('l_grade').value = l.gradeIdx;
  document.getElementById('l_video').value = l.video;
  document.getElementById('l_status').value = l.status;
  uploadedFiles = [...l.files];
  renderFilesList();
  openModal('lessonModal');
  refreshIcons();
}

function saveLesson() {
  const title = document.getElementById('l_title').value.trim();
  const subjIdx = parseInt(document.getElementById('l_subject').value);
  if (!title) {
    showToast('error', 'Error', 'Please fill all required fields.');
    return;
  }
  const subj = SUBJECTS[subjIdx];
  const id = document.getElementById('lessonIdField').value;
  if (id) {
    const l = lessonsData.find(x => x.id === id);
    if (l) {
      l.titleEn = title; l.titleAr = title;
      l.descEn = document.getElementById('l_desc').value || l.descEn;
      l.subjectIdx = subjIdx; l.subject = subj.en; l.subjectAr = subj.ar;
      l.subjectIcon = subj.icon; l.subjectColor = subj.color;
      l.gradeIdx = parseInt(document.getElementById('l_grade').value);
      l.grade = GRADES[l.gradeIdx]; l.gradeAr = GRADES_AR[l.gradeIdx];
      l.video = document.getElementById('l_video').value;
      l.status = document.getElementById('l_status').value;
      l.files = [...uploadedFiles];
    }
    showToast('success', t('updated'), title + ' updated.');
  } else {
    const newId = 'LES-' + String(201 + lessonsData.length + Math.floor(Math.random() * 100));
    lessonsData.push({
      id: newId, titleEn: title, titleAr: title,
      descEn: document.getElementById('l_desc').value || 'Lesson description',
      descAr: document.getElementById('l_desc').value || 'وصف الدرس',
      subjectIdx: subjIdx, subject: subj.en, subjectAr: subj.ar,
      subjectIcon: subj.icon, subjectColor: subj.color,
      gradeIdx: parseInt(document.getElementById('l_grade').value),
      grade: GRADES[parseInt(document.getElementById('l_grade').value)],
      gradeAr: GRADES_AR[parseInt(document.getElementById('l_grade').value)],
      status: document.getElementById('l_status').value,
      pubDate: new Date().toISOString().slice(0, 10),
      duration: 15 + Math.floor(Math.random() * 30),
      views: 0,
      files: [...uploadedFiles],
      video: document.getElementById('l_video').value,
    });
    showToast('success', t('created'), title + ' created.');
  }
  closeModal('lessonModal');
  updateStats();
  renderLessons();
}

function deleteLesson(id) {
  const l = lessonsData.find(x => x.id === id);
  if (!l) return;
  confirmDelete(`${t('confirm_delete')} <br><b>${STATE.lang === 'ar' ? l.titleAr : l.titleEn}</b>`, () => {
    lessonsData = lessonsData.filter(x => x.id !== id);
    showToast('success', t('deleted'), 'Lesson deleted.');
    updateStats();
    renderLessons();
  });
}

function togglePublish(id) {
  const l = lessonsData.find(x => x.id === id);
  if (!l) return;
  l.status = l.status === 'published' ? 'draft' : 'published';
  showToast('success', l.status === 'published' ? t('published') : t('draft'), (STATE.lang === 'ar' ? l.titleAr : l.titleEn) + ' is now ' + l.status);
  updateStats();
  renderLessons();
}

function viewLesson(id) {
  const l = lessonsData.find(x => x.id === id);
  if (!l) return;
  const lang = STATE.lang;
  document.getElementById('detailTitle').textContent = lang === 'ar' ? l.titleAr : l.titleEn;
  document.getElementById('detailSub').textContent = (lang === 'ar' ? l.subjectAr : l.subject) + ' · ' + (lang === 'ar' ? l.gradeAr : l.grade);
  document.getElementById('detailBody').innerHTML = `
    <div class="lesson-thumb" style="height:220px;background:linear-gradient(135deg, ${l.subjectColor}, ${l.subjectColor}cc);border-radius:var(--r-md);margin-bottom:16px">
      <div class="lesson-thumb-icon"><i data-lucide="play" class="icon"></i></div>
      <div class="lesson-thumb-duration">${l.duration} min</div>
    </div>
    <div class="flex gap-2 mb-3" style="flex-wrap:wrap">
      ${statusBadge(l.status)}
      <span class="badge badge-neutral">${lang === 'ar' ? l.gradeAr : l.grade}</span>
      <span class="badge badge-info"><i data-lucide="eye" class="icon" style="width:12px;height:12px"></i>${l.views} ${t('views')}</span>
    </div>
    <div style="font-size:14px;color:var(--text-2);line-height:1.6;margin-bottom:16px">${lang === 'ar' ? l.descAr : l.descEn}</div>
    <div class="profile-info-grid">
      <div class="profile-info-item"><div class="profile-info-label">${t('subject')}</div><div class="profile-info-value">${lang === 'ar' ? l.subjectAr : l.subject}</div></div>
      <div class="profile-info-item"><div class="profile-info-label">${t('duration')}</div><div class="profile-info-value">${l.duration} ${t('minutes')}</div></div>
      <div class="profile-info-item"><div class="profile-info-label">${t('publication_date')}</div><div class="profile-info-value">${fmtDate(l.pubDate)}</div></div>
      <div class="profile-info-item"><div class="profile-info-label">${t('video_url')}</div><div class="profile-info-value" style="font-size:11.5px;word-break:break-all">${l.video}</div></div>
    </div>
    ${l.files.length ? `
      <div class="profile-section-title" style="margin-top:16px"><i data-lucide="paperclip" class="icon"></i>${t('attached_files')}</div>
      <div>${l.files.map(f => `
        <div class="flex items-center gap-2" style="padding:10px;background:var(--card-2);border-radius:var(--r-sm);margin-bottom:6px">
          <i data-lucide="file-text" class="icon" style="width:18px;height:18px;color:var(--secondary)"></i>
          <span style="flex:1;font-size:13px">${f}</span>
          <button class="btn btn-secondary btn-sm"><i data-lucide="download" class="icon"></i></button>
        </div>
      `).join('')}</div>
    ` : ''}
  `;
  openModal('lessonDetailModal');
  refreshIcons();
}
