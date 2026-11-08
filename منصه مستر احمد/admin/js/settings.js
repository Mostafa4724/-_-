/* ==========================================================================
   SETTINGS.JS — Page logic for settings
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => initSettingsPage(), 50);
});

document.addEventListener('langchange', () => {
  renderAdminsTable();
  renderPermRows();
  syncLanguageRadio();
});

function initSettingsPage() {
  renderAdminsTable();
  renderPermRows();
  syncThemeRadio();
  syncLanguageRadio();
  syncSidebarToggle();
  wireEvents();
  refreshIcons();
}

/* ----------  Tab switching  ---------- */
function wireEvents() {
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.getAttribute('data-tab'))?.classList.add('active');
    });
  });

  // Theme radio
  document.querySelectorAll('input[name="theme"]').forEach(r => {
    r.addEventListener('change', () => {
      if (r.checked) {
        STATE.theme = r.value;
        localStorage.setItem('edu_theme', r.value);
        document.documentElement.setAttribute('data-theme', r.value);
        // Update topbar icon
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
          const icon = themeBtn.querySelector('[data-lucide], svg');
          if (icon) {
            const newIcon = document.createElement('i');
            newIcon.setAttribute('data-lucide', r.value === 'dark' ? 'sun' : 'moon');
            newIcon.className = 'icon';
            icon.replaceWith(newIcon);
            refreshIcons();
          }
        }
        document.dispatchEvent(new CustomEvent('themechange', { detail: r.value }));
        showToast('success', t('saved'), `Theme: ${r.value === 'dark' ? t('dark_mode') : t('light_mode')}`);
      }
    });
  });

  // Language radio
  document.querySelectorAll('input[name="lang"]').forEach(r => {
    r.addEventListener('change', () => {
      if (r.checked) {
        STATE.lang = r.value;
        localStorage.setItem('edu_lang', r.value);
        document.documentElement.setAttribute('data-lang', r.value);
        applyTranslations();
        renderTopbar();
        document.dispatchEvent(new CustomEvent('langchange', { detail: r.value }));
        showToast('success', t('saved'), `Language: ${r.value === 'ar' ? 'العربية' : 'English'}`);
      }
    });
  });

  // Sidebar collapse toggle
  const sCol = document.getElementById('s_sidebarCollapsed');
  if (sCol) {
    sCol.addEventListener('change', () => {
      STATE.sidebarCollapsed = sCol.checked;
      localStorage.setItem('edu_sidebar_collapsed', sCol.checked);
      const app = document.querySelector('.app');
      if (sCol.checked) app.classList.add('is-collapsed');
      else app.classList.remove('is-collapsed');
    });
  }

  // Save settings
  document.getElementById('saveSettingsBtn').addEventListener('click', () => {
    showToast('success', t('saved'), 'Settings saved successfully.');
  });
}

function syncThemeRadio() {
  const r = document.querySelector(`input[name="theme"][value="${STATE.theme}"]`);
  if (r) r.checked = true;
}

function syncLanguageRadio() {
  const r = document.querySelector(`input[name="lang"][value="${STATE.lang}"]`);
  if (r) r.checked = true;
}

function syncSidebarToggle() {
  const sCol = document.getElementById('s_sidebarCollapsed');
  if (sCol) sCol.checked = STATE.sidebarCollapsed;
}

/* ----------  Admin accounts table  ---------- */
function renderAdminsTable() {
  const tbody = document.getElementById('adminsTbody');
  if (!tbody) return;
  tbody.innerHTML = ADMIN_ACCOUNTS.map(a => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="avatar" style="background:${a.color}">${a.initials}</div>
          <div><div class="user-name">${a.name}</div><div class="user-meta">${a.role}</div></div>
        </div>
      </td>
      <td>${a.email}</td>
      <td><span class="badge badge-info">${a.role}</span></td>
      <td class="text-sm text-2">${a.lastLogin}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <div class="actions">
          <button class="action-btn" title="${t('edit')}"><i data-lucide="pencil" class="icon"></i></button>
          <button class="action-btn danger" title="${t('delete')}"><i data-lucide="trash-2" class="icon"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
  refreshIcons();
}

/* ----------  Permissions matrix  ---------- */
const PERMISSIONS = [
  { label_en: 'View Dashboard', label_ar: 'عرض لوحة التحكم', perms: [true, true, true, true] },
  { label_en: 'Manage Students', label_ar: 'إدارة الطلاب', perms: [true, true, true, false] },
  { label_en: 'Manage Lessons', label_ar: 'إدارة الدروس', perms: [true, true, true, false] },
  { label_en: 'Manage Exams', label_ar: 'إدارة الامتحانات', perms: [true, true, false, false] },
  { label_en: 'Grade Submissions', label_ar: 'تصحيح التسليمات', perms: [true, true, true, true] },
  { label_en: 'Manage Notifications', label_ar: 'إدارة الإشعارات', perms: [true, true, false, false] },
  { label_en: 'View Results', label_ar: 'عرض النتائج', perms: [true, true, true, true] },
  { label_en: 'Manage Admins', label_ar: 'إدارة المسؤولين', perms: [true, false, false, false] },
  { label_en: 'System Settings', label_ar: 'إعدادات النظام', perms: [true, false, false, false] },
];

function renderPermRows() {
  const c = document.getElementById('permRows');
  if (!c) return;
  const lang = STATE.lang;
  c.innerHTML = PERMISSIONS.map(p => `
    <div class="perm-row">
      <div class="perm-name">${lang === 'ar' ? p.label_ar : p.label_en}</div>
      ${p.perms.map(allowed => `<div class="perm-check"><input type="checkbox" ${allowed ? 'checked' : ''}></div>`).join('')}
    </div>
  `).join('');
}
