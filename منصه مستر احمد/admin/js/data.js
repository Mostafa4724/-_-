/* ==========================================================================
   SAMPLE DATA — Educational Platform
   Realistic data for students, lessons, exams, homework, notifications
   ========================================================================== */

const GRADES = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
const GRADES_AR = ['الصف السابع', 'الصف الثامن', 'الصف التاسع', 'الصف العاشر', 'الحادي عشر', 'الثاني عشر'];
const CLASSES = ['A', 'B', 'C', 'D'];
const SUBJECTS = [
  { en: 'Mathematics', ar: 'الرياضيات', icon: 'calculator', color: '#2563EB' },
  { en: 'Science', ar: 'العلوم', icon: 'flask-conical', color: '#10B981' },
  { en: 'Arabic Language', ar: 'اللغة العربية', icon: 'book-open', color: '#7C3AED' },
  { en: 'English Language', ar: 'اللغة الإنجليزية', icon: 'languages', color: '#F59E0B' },
  { en: 'Social Studies', ar: 'الدراسات الاجتماعية', icon: 'globe', color: '#0EA5E9' },
  { en: 'Islamic Studies', ar: 'الدراسات الإسلامية', icon: 'moon', color: '#172554' },
  { en: 'Computer Science', ar: 'علوم الحاسب', icon: 'laptop', color: '#EF4444' },
];

/* Generate avatar initials */
function initials(name) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

/* Avatar color from name */
function avatarColor(seed) {
  const colors = ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#172554'];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

/* Students — 36 realistic records */
const STUDENT_NAMES = [
  'Ahmed Hassan', 'Sara Mohamed', 'Omar Khalid', 'Fatima Ali', 'Yusuf Ibrahim',
  'Maryam Abdullah', 'Ali Nasser', 'Hala Saleh', 'Khalid Rahman', 'Nour Adel',
  'Salma Tarek', 'Hamza Faisal', 'Aisha Mahmoud', 'Bilal Yassin', 'Layla Kamal',
  'Mostafa Said', 'Rana Hossam', 'Tariq Anwar', 'Dina Mansour', 'Karim Walid',
  'Mona Sameh', 'Hossam Adel', 'Reem Fathi', 'Amr Galal', 'Heba Nabil',
  'Sami Tariq', 'Walaa Hassan', 'Adel Mansour', 'Yasmin Khaled', 'Ramy Said',
  'Farida Omar', 'Tarek Lutfi', 'Sherine Ayman', 'Bassam Nabil', 'Menna Allah', 'Ziad Fawzi'
];

const STUDENTS = STUDENT_NAMES.map((name, i) => {
  const gradeIdx = i % GRADES.length;
  const cls = CLASSES[i % CLASSES.length];
  const statuses = ['active', 'active', 'active', 'active', 'inactive'];
  const status = statuses[i % statuses.length];
  const enrollDate = new Date(2023, (i * 2) % 12, ((i * 7) % 27) + 1);
  const avgScore = 60 + ((i * 13) % 38);
  return {
    id: 'STU-' + String(1001 + i),
    name,
    email: name.toLowerCase().replace(/\s+/g, '.') + '@edu.ma',
    phone: '+212 6' + String(10000000 + i * 137453).slice(0, 8),
    gradeIdx,
    grade: GRADES[gradeIdx],
    gradeAr: GRADES_AR[gradeIdx],
    class: cls,
    enrolled: enrollDate.toISOString().slice(0, 10),
    status,
    avgScore,
    avatarColor: avatarColor(name),
    initials: initials(name),
    completedLessons: 20 + ((i * 7) % 60),
    submittedHomework: 10 + ((i * 5) % 30),
    attendance: 75 + ((i * 11) % 25),
    parentName: 'Parent of ' + name.split(' ')[0],
    parentPhone: '+212 6' + String(20000000 + i * 137453).slice(0, 8),
    address: 'Rabat, Morocco',
  };
});

/* Lessons */
const LESSON_TITLES = [
  { en: 'Introduction to Algebra', ar: 'مقدمة في الجبر', sub: 'algebra' },
  { en: 'Cell Biology Fundamentals', ar: 'أساسيات بيولوجيا الخلية', sub: 'science' },
  { en: 'Arabic Poetry Analysis', ar: 'تحليل الشعر العربي', sub: 'arabic' },
  { en: 'English Grammar Tenses', ar: 'قواعد الأزمنة في الإنجليزية', sub: 'english' },
  { en: 'World Geography Basics', ar: 'أساسيات جغرافيا العالم', sub: 'social' },
  { en: 'Quranic Sciences', ar: 'العلوم القرآنية', sub: 'islamic' },
  { en: 'Programming with Python', ar: 'البرمجة بلغة بايثون', sub: 'computer' },
  { en: 'Linear Equations', ar: 'المعادلات الخطية', sub: 'algebra' },
  { en: 'Chemical Reactions', ar: 'التفاعلات الكيميائية', sub: 'science' },
  { en: 'Classical Arabic Literature', ar: 'الأدب العربي الكلاسيكي', sub: 'arabic' },
  { en: 'Essay Writing Skills', ar: 'مهارات كتابة المقال', sub: 'english' },
  { en: 'Ancient Civilizations', ar: 'الحضارات القديمة', sub: 'social' },
  { en: 'Prophetic Biography', ar: 'السيرة النبوية', sub: 'islamic' },
  { en: 'Data Structures Basics', ar: 'أساسيات هياكل البيانات', sub: 'computer' },
  { en: 'Geometry and Trigonometry', ar: 'الهندسة وعلم المثلثات', sub: 'algebra' },
  { en: 'Human Anatomy', ar: 'تشريح جسم الإنسان', sub: 'science' },
  { en: 'Modern Arabic Poetry', ar: 'الشعر العربي الحديث', sub: 'arabic' },
  { en: 'Reading Comprehension', ar: 'الفهم القرائي', sub: 'english' },
];

const SUBJ_MAP = { algebra: 0, science: 1, arabic: 2, english: 3, social: 4, islamic: 5, computer: 6 };

const LESSONS = LESSON_TITLES.map((lt, i) => {
  const subIdx = SUBJ_MAP[lt.sub];
  const subj = SUBJECTS[subIdx];
  const gradeIdx = i % GRADES.length;
  const statuses = ['published', 'published', 'published', 'draft', 'published'];
  const status = statuses[i % statuses.length];
  const pubDate = new Date(2024, (i + 5) % 12, ((i * 9) % 27) + 1);
  return {
    id: 'LES-' + String(201 + i),
    titleEn: lt.en,
    titleAr: lt.ar,
    descEn: 'Comprehensive lesson covering core concepts with practical examples and exercises for student mastery.',
    descAr: 'درس شامل يغطي المفاهيم الأساسية مع أمثلة عملية وتمارين لإتقان الطلاب.',
    subjectIdx: subIdx,
    subject: subj.en,
    subjectAr: subj.ar,
    subjectIcon: subj.icon,
    subjectColor: subj.color,
    gradeIdx,
    grade: GRADES[gradeIdx],
    gradeAr: GRADES_AR[gradeIdx],
    status,
    pubDate: pubDate.toISOString().slice(0, 10),
    duration: 12 + ((i * 7) % 40),
    views: 120 + ((i * 137) % 1200),
    files: i % 3 === 0 ? ['lesson-notes.pdf', 'worksheet.pdf'] : (i % 3 === 1 ? ['slides.pdf'] : []),
    video: 'https://example.com/video/' + (201 + i),
  };
});

/* Exams */
const EXAM_TITLES = [
  { en: 'Midterm Mathematics Exam', ar: 'امتحان منتصف الفصل في الرياضيات', sub: 0 },
  { en: 'Science Quiz — Chapter 3', ar: 'اختبار العلوم — الفصل الثالث', sub: 1 },
  { en: 'Arabic Language Final', ar: 'امتحان اللغة العربية النهائي', sub: 2 },
  { en: 'English Reading Test', ar: 'اختبار القراءة بالإنجليزية', sub: 3 },
  { en: 'Geography Midterm', ar: 'امتحان منتصف الفصل في الجغرافيا', sub: 4 },
  { en: 'Islamic Studies Quiz', ar: 'اختبار الدراسات الإسلامية', sub: 5 },
  { en: 'Python Basics Exam', ar: 'امتحان أساسيات بايثون', sub: 6 },
  { en: 'Algebra Final Exam', ar: 'الامتحان النهائي في الجبر', sub: 0 },
  { en: 'Biology End-of-Term', ar: 'امتحان نهاية الفصل في الأحياء', sub: 1 },
  { en: 'Arabic Literature Test', ar: 'اختبار الأدب العربي', sub: 2 },
];

const EXAM_STATUSES = ['draft', 'published', 'scheduled', 'active', 'completed'];

const EXAMS = EXAM_TITLES.map((et, i) => {
  const subj = SUBJECTS[et.sub];
  const gradeIdx = i % GRADES.length;
  const status = EXAM_STATUSES[i % EXAM_STATUSES.length];
  const numQ = 10 + ((i * 3) % 25);
  const totalMarks = numQ * 4;
  const startDate = new Date(2025, (i + 1) % 12, ((i * 11) % 27) + 1);
  const endDate = new Date(2025, (i + 1) % 12, ((i * 11) % 27) + 1, 2);
  return {
    id: 'EXA-' + String(301 + i),
    titleEn: et.en,
    titleAr: et.ar,
    subjectIdx: et.sub,
    subject: subj.en,
    subjectAr: subj.ar,
    subjectColor: subj.color,
    gradeIdx,
    grade: GRADES[gradeIdx],
    gradeAr: GRADES_AR[gradeIdx],
    numQuestions: numQ,
    totalMarks,
    passingScore: Math.round(totalMarks * 0.5),
    duration: 30 + ((i * 13) % 60),
    startDate: startDate.toISOString().slice(0, 16),
    endDate: endDate.toISOString().slice(0, 16),
    status,
    // analytics for completed/active
    studentsTaken: status === 'completed' ? 80 + ((i * 7) % 40) : (status === 'active' ? 35 + ((i * 5) % 30) : 0),
    avgScore: 60 + ((i * 7) % 28),
    highestScore: 90 + ((i * 3) % 10),
    lowestScore: 35 + ((i * 5) % 25),
    passRate: 65 + ((i * 4) % 30),
  };
});

/* Homework */
const HOMEWORK_TITLES = [
  { en: 'Algebra Practice Exercises', ar: 'تمارين تطبيقية في الجبر', sub: 0 },
  { en: 'Lab Report — Photosynthesis', ar: 'تقرير المختبر — البناء الضوئي', sub: 1 },
  { en: 'Poem Memorization', ar: 'حفظ قصيدة', sub: 2 },
  { en: 'Vocabulary Worksheet', ar: 'ورقة عمل المفردات', sub: 3 },
  { en: 'Map Reading Assignment', ar: 'واجب قراءة الخرائط', sub: 4 },
  { en: 'Hadith Explanation', ar: 'شرح حديث', sub: 5 },
  { en: 'Simple Python Program', ar: 'برنامج بايثون بسيط', sub: 6 },
  { en: 'Quadratic Equations HW', ar: 'واجب المعادلات التربيعية', sub: 0 },
  { en: 'Periodic Table Study', ar: 'دراسة الجدول الدوري', sub: 1 },
  { en: 'Essay — Modern Arabic', ar: 'مقال — الأدب العربي الحديث', sub: 2 },
  { en: 'Short Story Writing', ar: 'كتابة قصة قصيرة', sub: 3 },
  { en: 'Historical Timeline', ar: 'الجدول الزمني التاريخي', sub: 4 },
];

const HW_STATUSES = ['pending', 'submitted', 'under_review', 'graded', 'late'];

const HOMEWORK = HOMEWORK_TITLES.map((ht, i) => {
  const subj = SUBJECTS[ht.sub];
  const gradeIdx = i % GRADES.length;
  const status = HW_STATUSES[i % HW_STATUSES.length];
  const created = new Date(2025, (i + 2) % 12, ((i * 5) % 27) + 1);
  const deadline = new Date(2025, (i + 3) % 12, ((i * 9) % 27) + 1);
  return {
    id: 'HW-' + String(401 + i),
    titleEn: ht.en,
    titleAr: ht.ar,
    subjectIdx: ht.sub,
    subject: subj.en,
    subjectAr: subj.ar,
    subjectColor: subj.color,
    gradeIdx,
    grade: GRADES[gradeIdx],
    gradeAr: GRADES_AR[gradeIdx],
    class: CLASSES[i % CLASSES.length],
    created: created.toISOString().slice(0, 10),
    deadline: deadline.toISOString().slice(0, 10),
    totalMarks: 20 + ((i * 5) % 30),
    status,
    submissions: 12 + ((i * 7) % 30),
    pending: status === 'pending' ? 8 + ((i * 3) % 15) : 0,
    files: i % 2 === 0 ? ['instructions.pdf'] : ['instructions.pdf', 'template.docx'],
  };
});

/* Notifications */
const NOTIFICATIONS = [
  { id: 1, type: 'new_lesson', titleEn: 'New Lesson Published', titleAr: 'درس جديد منشور', textEn: 'Algebra Lesson 5 is now available for Grade 9', textAr: 'درس الجبر الخامس متاح الآن للصف التاسع', time: '5m', unread: true, target: 'all_students' },
  { id: 2, type: 'upcoming_exam', titleEn: 'Upcoming Exam Reminder', titleAr: 'تذكير بالامتحان القادم', textEn: 'Math midterm exam starts in 3 days', textAr: 'امتحان الرياضيات لمنتصف الفصل يبدأ خلال 3 أيام', time: '1h', unread: true, target: 'specific_grade' },
  { id: 3, type: 'homework_deadline', titleEn: 'Homework Deadline', titleAr: 'موعد تسليم الواجب', textEn: 'Science lab report due tomorrow at 11:59 PM', textAr: 'تقرير مختبر العلوم مستحب غداً الساعة 11:59 مساءً', time: '3h', unread: true, target: 'specific_class' },
  { id: 4, type: 'results_published', titleEn: 'Results Published', titleAr: 'نتائج منشورة', textEn: 'Arabic Language final exam results are now available', textAr: 'نتائج امتحان اللغة العربية النهائي متاحة الآن', time: '1d', unread: false, target: 'all_students' },
  { id: 5, type: 'platform_update', titleEn: 'Platform Update', titleAr: 'تحديث المنصة', textEn: 'New video player with speed controls has been released', textAr: 'تم إصدار مشغل فيديو جديد مع تحكم في السرعة', time: '2d', unread: false, target: 'all_students' },
  { id: 6, type: 'general', titleEn: 'Welcome to New Semester', titleAr: 'ترحيب بالفصل الدراسي الجديد', textEn: 'Welcome back! We wish you a successful semester ahead', textAr: 'مرحباً بعودتكم! نتمنى لكم فصلاً دراسياً ناجحاً', time: '5d', unread: false, target: 'all_students' },
  { id: 7, type: 'new_lesson', titleEn: 'New Science Lesson', titleAr: 'درس علوم جديد', textEn: 'Lesson on chemical reactions is now published', textAr: 'درس التفاعلات الكيميائية منشور الآن', time: '1w', unread: false, target: 'all_students' },
];

/* Recent activity feed */
const ACTIVITY = [
  { type: 'student', icon: 'user-plus', color: '#10B981', textEn: 'New student <b>Salma Tarek</b> registered in Grade 10', textAr: 'طالبة جديدة <b>سلمى طارق</b> سجلت في الصف العاشر', time: '5 minutes ago', timeAr: 'منذ 5 دقائق' },
  { type: 'exam', icon: 'file-text', color: '#2563EB', textEn: 'Exam <b>Mathematics Midterm</b> was published', textAr: 'تم نشر امتحان <b>منتصف الفصل في الرياضيات</b>', time: '1 hour ago', timeAr: 'منذ ساعة' },
  { type: 'lesson', icon: 'book-open', color: '#7C3AED', textEn: 'Lesson <b>Algebra Fundamentals</b> received 45 new views', textAr: 'درس <b>أساسيات الجبر</b> حصل على 45 مشاهدة جديدة', time: '2 hours ago', timeAr: 'منذ ساعتين' },
  { type: 'homework', icon: 'clipboard-check', color: '#F59E0B', textEn: '<b>12 students</b> submitted the Photosynthesis lab report', textAr: '<b>12 طالباً</b> سلّموا تقرير البناء الضوئي', time: '3 hours ago', timeAr: 'منذ 3 ساعات' },
  { type: 'result', icon: 'award', color: '#10B981', textEn: 'Results for <b>English Reading Test</b> were published', textAr: 'تم نشر نتائج <b>اختبار القراءة بالإنجليزية</b>', time: '5 hours ago', timeAr: 'منذ 5 ساعات' },
  { type: 'student', icon: 'user-check', color: '#2563EB', textEn: '<b>Omar Khalid</b> completed 5 new lessons', textAr: '<b>عمر خالد</b> أكمل 5 دروس جديدة', time: '6 hours ago', timeAr: 'منذ 6 ساعات' },
];

/* Upcoming exams (next 7 days) */
const UPCOMING_EXAMS = EXAMS.filter(e => e.status === 'scheduled' || e.status === 'active').slice(0, 4);

/* Pending homework reviews */
const PENDING_REVIEWS = HOMEWORK.filter(h => h.status === 'under_review' || h.status === 'submitted').slice(0, 5);

/* Results — build per-student results */
const RESULTS = STUDENTS.map((s, i) => {
  const examScore = 50 + ((i * 17) % 50);
  const hwScore = 55 + ((i * 13) % 45);
  const attendance = 70 + ((i * 11) % 30);
  const overall = Math.round((examScore * 0.5) + (hwScore * 0.3) + (attendance * 0.2));
  const status = overall >= 50 ? 'pass' : 'fail';
  return {
    studentId: s.id,
    name: s.name,
    initials: s.initials,
    avatarColor: s.avatarColor,
    grade: s.grade,
    gradeAr: s.gradeAr,
    examScore,
    hwScore,
    attendance,
    overall,
    status,
    rank: 0,
  };
}).sort((a, b) => b.overall - a.overall).map((r, i) => ({ ...r, rank: i + 1 }));

/* Settings — admin accounts */
const ADMIN_ACCOUNTS = [
  { id: 1, name: 'Dr. Admin', email: 'admin@edu.ma', role: 'Super Admin', status: 'active', lastLogin: '2025-11-08 09:14', initials: 'AD', color: '#172554' },
  { id: 2, name: 'Sara Editor', email: 'sara@edu.ma', role: 'Content Editor', status: 'active', lastLogin: '2025-11-07 16:42', initials: 'SE', color: '#2563EB' },
  { id: 3, name: 'Omar Reviewer', email: 'omar@edu.ma', role: 'Reviewer', status: 'inactive', lastLogin: '2025-10-30 11:20', initials: 'OR', color: '#7C3AED' },
  { id: 4, name: 'Layla Manager', email: 'layla@edu.ma', role: 'Manager', status: 'active', lastLogin: '2025-11-08 08:05', initials: 'LM', color: '#10B981' },
];

/* Helper: subject label by language */
function subjLabel(s, lang) { return lang === 'ar' ? s.subjectAr : s.subjectEn || s.subject; }

/* Helper: localized name helper for entities */
function localized(entity, fieldEn, fieldAr) {
  const lang = document.documentElement.getAttribute('data-lang') || 'en';
  return lang === 'ar' ? entity[fieldAr] : entity[fieldEn];
}

/* Format date based on language */
function fmtDate(dateStr, lang) {
  const d = new Date(dateStr);
  if (lang === 'ar') {
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* Grade label by language */
function gradeLabel(g, lang) { return lang === 'ar' ? g.gradeAr : g.grade; }
function gradeStr(g, lang) {
  return lang === 'ar' ? GRADES_AR[GRADES.indexOf(g)] : g;
}
