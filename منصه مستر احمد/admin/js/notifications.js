/* ==========================================================================
   NOTIFICATIONS.JS — Page logic for notifications management
   ========================================================================== */

let notifData = JSON.parse(JSON.stringify(NOTIFICATIONS));
let filterType = '';

const NOTIF_TYPES = {
  general: { icon: 'megaphone', color: '#64748B', tint: 'rgba(100,116,139,0.14)' },
  new_lesson: { icon: 'book-open', color: '#7C3AED', tint: 'rgba(124,58,237,0.12)' },
  upcoming_exam: { icon: 'file-text', color: '#2563EB', tint: 'rgba(37,99,235,0.12)' },
  homework_deadline: { icon: 'clipboard-list', color: '#F59E0B', tint: 'rgba(245,158,11,0.14)' },
  results_published: { icon: 'award', color: '#10B981', tint: 'rgba(16,185,129,0.12)' },
  platform_update: { icon: 'sparkles', color: '#0EA5E9', tint: 'rgba(14,165,233,0.12)' },
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => initNotifPage(), 50);
});

document.addEventListener('langchange', () => {
  populateFormSelects();
  renderList();
  renderTypeBreakdown();
});

function initNotifPage() {
  populateFormSelects();
  renderList();
  renderTypeBreakdown();
  wireEvents();
  refreshIcons();
}

function populateFormSelects() {
  const lang = STATE.lang;
  document.getElementById('n_grade').innerHTML = GRADES.map((g, i) => `<option value="${i}">${lang === 'ar' ? GRADES_AR[i] : g}</option>`).join('');
  document.getElementById('n_class').innerHTML = CLASSES.map(c => `<option value="${c}">${t('class')} ${c}</option>`).join('');
}

function renderList() {
  const list = document.getElementById('notifList');
  const lang = STATE.lang;
  const filtered = filterType ? notifData.filter(n => n.type === filterType) : notifData;

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="icon-wrap"><i data-lucide="bell-off" class="icon"></i></div>
      <h3>${t('no_results')}</h3><p>${t('no_results_desc')}</p>
    </div>`;
    refreshIcons();
    return;
  }

  list.innerHTML = filtered.map(n => {
    const m = NOTIF_TYPES[n.type];
    return `
      <div class="notif-list-item ${n.unread ? 'unread' : ''}">
        <div class="notif-list-icon" style="background:${m.tint};color:${m.color}">
          <i data-lucide="${m.icon}" class="icon"></i>
        </div>
        <div class="notif-list-content">
          <div class="notif-list-title">${lang === 'ar' ? n.titleAr : n.titleEn}</div>
          <div class="notif-list-text">${lang === 'ar' ? n.textAr : n.textEn}</div>
          <div class="notif-list-meta">
            <span class="badge badge-neutral" style="font-size:10.5px">${t(n.target)}</span>
            <div class="notif-list-actions">
              <button class="action-btn" onclick="markRead(${n.id})" title="${t('mark_read')}"><i data-lucide="check" class="icon"></i></button>
              <button class="action-btn danger" onclick="deleteNotif(${n.id})" title="${t('delete')}"><i data-lucide="trash-2" class="icon"></i></button>
            </div>
          </div>
          <div class="notif-list-time" style="margin-top:6px">${n.time}</div>
        </div>
      </div>
    `;
  }).join('');
  refreshIcons();
}

function renderTypeBreakdown() {
  const c = document.getElementById('typeBreakdown');
  const types = Object.keys(NOTIF_TYPES);
  c.innerHTML = types.map(type => {
    const m = NOTIF_TYPES[type];
    const count = notifData.filter(n => n.type === type).length;
    return `
      <div class="type-row">
        <div class="type-row-icon" style="background:${m.tint};color:${m.color}"><i data-lucide="${m.icon}" class="icon"></i></div>
        <div class="type-row-label">${t(type)}</div>
        <div class="type-row-count">${count}</div>
      </div>
    `;
  }).join('');
  refreshIcons();
}

function wireEvents() {
  document.getElementById('filterType').addEventListener('change', e => { filterType = e.target.value; renderList(); });
  document.getElementById('createNotifBtn').addEventListener('click', openCreateModal);
  document.getElementById('sendNotifBtn').addEventListener('click', sendNotif);
  document.getElementById('n_target').addEventListener('change', e => {
    const v = e.target.value;
    document.getElementById('targetGradeGroup').style.display = v === 'specific_grade' ? '' : 'none';
    document.getElementById('targetClassGroup').style.display = v === 'specific_class' ? '' : 'none';
  });
}

function openCreateModal() {
  document.getElementById('n_title').value = '';
  document.getElementById('n_message').value = '';
  document.getElementById('n_target').value = 'all_students';
  document.querySelector('input[name="n_type"][value="general"]').checked = true;
  document.getElementById('targetGradeGroup').style.display = 'none';
  document.getElementById('targetClassGroup').style.display = 'none';
  openModal('notifModal');
}

function sendNotif() {
  const title = document.getElementById('n_title').value.trim();
  const message = document.getElementById('n_message').value.trim();
  const type = document.querySelector('input[name="n_type"]:checked')?.value || 'general';
  const target = document.getElementById('n_target').value;
  if (!title) {
    showToast('error', 'Error', 'Please enter a title.');
    return;
  }
  const newNotif = {
    id: Date.now(),
    type,
    titleEn: title,
    titleAr: title,
    textEn: message || 'No message',
    textAr: message || 'لا توجد رسالة',
    time: 'now',
    unread: false,
    target,
  };
  notifData.unshift(newNotif);
  showToast('success', t('send') || 'Sent', 'Notification sent to ' + t(target));
  closeModal('notifModal');
  renderList();
  renderTypeBreakdown();
}

function markRead(id) {
  const n = notifData.find(x => x.id === id);
  if (n) {
    n.unread = false;
    showToast('success', t('mark_read'), n.titleEn + ' marked as read.');
    renderList();
  }
}

function deleteNotif(id) {
  const n = notifData.find(x => x.id === id);
  if (!n) return;
  confirmDelete(`${t('confirm_delete')} <br><b>${n.titleEn}</b>`, () => {
    notifData = notifData.filter(x => x.id !== id);
    showToast('success', t('deleted'), 'Notification deleted.');
    renderList();
    renderTypeBreakdown();
  });
}
