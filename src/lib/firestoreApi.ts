import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  buildStudentAliasEmail,
  createSecondaryAuthUser,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { ensureSeededStudentAliases } from './seedFirestore';
import {
  COURSE_DEFAULT_SUBJECTS,
  INITIAL_COURSES,
  INITIAL_SETTINGS,
  TEST_LEVELS,
  getStudentEnrolledSubjects,
} from '../data/seedCatalog';

const DEFAULT_COURSE_SUBJECTS = COURSE_DEFAULT_SUBJECTS as Record<string, string[]>;
const resolveEnrolledSubjects = getStudentEnrolledSubjects as (stu: any, dbLike?: any) => string[];

async function provisionStudentCredentials(
  studentDocId: string,
  studentCode: string,
  rawPassword: string,
  previousUid?: string
): Promise<{ uid: string; aliasEmail: string }> {
  const cleanCode = String(studentCode || '').trim().toUpperCase();
  const cleanPass = String(rawPassword || '').trim();
  if (cleanPass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const aliasEmail = buildStudentAliasEmail(cleanCode);
  let newUid = '';
  try {
    newUid = await createSecondaryAuthUser(aliasEmail, cleanPass);
  } catch (err: any) {
    if (err?.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Email/Password authentication is not enabled yet in Firebase Console (Authentication → Sign-in method → Email/Password).'
      );
    }
    if (err?.code === 'auth/weak-password') {
      throw new Error('Password must be at least 6 characters long.');
    }
    throw err;
  }

  await setDoc(doc(db, 'student_login_aliases', cleanCode), {
    id: cleanCode,
    student_doc_id: studentDocId,
    auth_alias_email: aliasEmail,
    auth_uid: newUid,
    updatedAt: serverTimestamp(),
  });

  // Migrate student_uid on existing attempts & answers (exam_violations is immutable by security rules)
  const attSnap = await getDocs(
    query(collection(db, 'exam_attempts'), where('student_id', '==', studentDocId))
  );
  for (const attDoc of attSnap.docs) {
    await updateDoc(doc(db, 'exam_attempts', attDoc.id), {
      student_uid: newUid,
      updatedAt: serverTimestamp(),
    });
  }
  if (previousUid && previousUid !== newUid) {
    const ansSnap = await getDocs(
      query(collection(db, 'exam_answers'), where('student_uid', '==', previousUid))
    );
    for (const ansDoc of ansSnap.docs) {
      await updateDoc(doc(db, 'exam_answers', ansDoc.id), {
        student_uid: newUid,
      });
    }
  }

  return { uid: newUid, aliasEmail };
}

const ADMIN_EMAILS = ['pathanarbaj03328@gmail.com', 'aptivoxeducation@gmail.com'];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${Date.now()}_${rand}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function resolveCurrentUserContext() {
  const fbUser = auth.currentUser;
  if (!fbUser) return null;

  const email = (fbUser.email || '').toLowerCase();
  if (isAdminEmail(email) && fbUser.emailVerified) {
    return {
      uid: fbUser.uid,
      id: fbUser.uid,
      email: fbUser.email,
      name: fbUser.displayName || 'Aptivox Director / Admin',
      role: 'ADMIN' as const,
    };
  }

  try {
    const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
    if (adminSnap.exists()) {
      const a = adminSnap.data();
      return {
        uid: fbUser.uid,
        id: fbUser.uid,
        email: fbUser.email,
        name: a.name || fbUser.displayName || 'Administrator',
        role: 'ADMIN' as const,
      };
    }
  } catch {
    // Non-admins cannot read arbitrary admins docs
  }

  // Find student profile by uid field (doc IDs are stu_1, stu_*, not auth uid)
  try {
    const byUid = await getDocs(query(collection(db, 'students'), where('uid', '==', fbUser.uid)));
    let stu: any = !byUid.empty ? byUid.docs[0].data() : null;

    if (!stu && fbUser.email && fbUser.emailVerified) {
      const byEmail = await getDocs(
        query(collection(db, 'students'), where('email', '==', fbUser.email.toLowerCase()))
      );
      if (!byEmail.empty) {
        stu = byEmail.docs[0].data();
      }
    }

    if (stu) {
      return {
        ...stu,
        uid: fbUser.uid,
        role: 'STUDENT' as const,
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'students');
  }

  return {
    uid: fbUser.uid,
    id: fbUser.uid,
    email: fbUser.email,
    name: fbUser.displayName || 'Student',
    role: 'UNREGISTERED' as const,
  };
}

async function getAllDocs(colName: string): Promise<any[]> {
  try {
    let targetQuery: any = collection(db, colName);
    switch (colName) {
      case 'courses':
        targetQuery = query(collection(db, 'courses'), where('status', 'in', ['ACTIVE', 'INACTIVE']));
        break;
      case 'subjects':
        targetQuery = query(collection(db, 'subjects'), where('status', 'in', ['ACTIVE', 'INACTIVE']));
        break;
      case 'topics':
        targetQuery = query(collection(db, 'topics'), where('status', 'in', ['ACTIVE', 'INACTIVE']));
        break;
      case 'test_levels':
        targetQuery = query(
          collection(db, 'test_levels'),
          where('name', 'in', ['Basic Test', 'Medium Test', 'Advanced Test'])
        );
        break;
      case 'exam_papers':
        targetQuery = query(
          collection(db, 'exam_papers'),
          where('status', 'in', ['PUBLISHED', 'DRAFT', 'ARCHIVED'])
        );
        break;
      case 'questions':
        targetQuery = query(
          collection(db, 'questions'),
          where('difficulty', 'in', ['EASY', 'MEDIUM', 'HARD'])
        );
        break;
      case 'notes':
        targetQuery = query(collection(db, 'notes'), where('status', 'in', ['ACTIVE', 'INACTIVE']));
        break;
      default:
        targetQuery = collection(db, colName);
    }
    const snap = await getDocs(targetQuery);
    return snap.docs.map((d: any) => ({ ...d.data(), id: d.id }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, colName);
  }
}

async function handleApiRequest(
  rawUrl: string,
  init: RequestInit = {}
): Promise<Response> {
  const urlObj = new URL(rawUrl, window.location.origin);
  const path = urlObj.pathname.replace(/^\/api/, '');
  const method = (init.method || 'GET').toUpperCase();
  let body: any = {};

  if (init.body && typeof init.body === 'string') {
    try {
      body = JSON.parse(init.body);
    } catch {
      body = {};
    }
  }

  const params = urlObj.searchParams;

  // ==========================================
  // SETTINGS
  // ==========================================
  if (path === '/settings' && method === 'GET') {
    try {
      const snap = await getDoc(doc(db, 'settings', 'institute'));
      if (snap.exists()) {
        return jsonResponse(snap.data());
      }
      return jsonResponse(INITIAL_SETTINGS);
    } catch {
      return jsonResponse(INITIAL_SETTINGS);
    }
  }

  if (path === '/settings' && method === 'PUT') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    try {
      const snap = await getDoc(doc(db, 'settings', 'institute'));
      const current = snap.exists() ? snap.data() : INITIAL_SETTINGS;
      const next = {
        institute_name: String(body.institute_name ?? current.institute_name ?? INITIAL_SETTINGS.institute_name).slice(0, 200),
        tagline: String(body.tagline ?? current.tagline ?? INITIAL_SETTINGS.tagline).slice(0, 200),
        address: String(body.address ?? current.address ?? '').slice(0, 300),
        contact: String(body.contact ?? current.contact ?? INITIAL_SETTINGS.contact).slice(0, 30),
        email: String(body.email ?? current.email ?? INITIAL_SETTINGS.email).slice(0, 150),
        passing_percentage: Number(body.passing_percentage ?? current.passing_percentage ?? 40),
        default_exam_duration: Number(body.default_exam_duration ?? current.default_exam_duration ?? 60),
        camera_required: Boolean(body.camera_required ?? current.camera_required ?? true),
        fullscreen_required: Boolean(body.fullscreen_required ?? current.fullscreen_required ?? true),
        re_exam_policy: String(body.re_exam_policy ?? current.re_exam_policy ?? 'STRICT_ADMIN_APPROVAL').slice(0, 80),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'settings', 'institute'), next);
      return jsonResponse({ message: 'Settings updated', settings: next });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/institute');
    }
  }

  // ==========================================
  // AUTH / PROFILE
  // ==========================================
  if (path === '/auth/me' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx) return jsonResponse({ error: 'Authentication required' }, 401);
    return jsonResponse(ctx);
  }

  // ==========================================
  // COURSES
  // ==========================================
  if (path === '/courses' && method === 'GET') {
    let courses: any[] = [];
    try {
      const snap = await getDocs(
        query(collection(db, 'courses'), where('status', 'in', ['ACTIVE', 'INACTIVE']))
      );
      courses = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
    } catch {
      courses = INITIAL_COURSES;
    }
    if (courses.length === 0) courses = INITIAL_COURSES;

    const ctx = await resolveCurrentUserContext();
    let students: any[] = [];
    let papers: any[] = [];
    if (ctx?.role === 'ADMIN') {
      [students, papers] = await Promise.all([getAllDocs('students'), getAllDocs('exam_papers')]);
    }

    const enriched = courses.map((c) => ({
      ...c,
      subjects: Array.isArray(c.subjects) ? c.subjects : DEFAULT_COURSE_SUBJECTS[String(c.id)] || [],
      subject_count: Array.isArray(c.subjects) ? c.subjects.length : (DEFAULT_COURSE_SUBJECTS[String(c.id)] || []).length,
      student_count: students.filter((s) => s.course_id === c.id).length,
      exam_count: papers.filter((p) => p.course_id === c.id).length,
    }));
    return jsonResponse(enriched);
  }

  if (path === '/courses' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const id = makeId('c');
    const payload = {
      id,
      name: String(body.name || '').trim(),
      duration: String(body.duration || '3 Months').trim(),
      status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      description: String(body.description || ''),
      course_image: body.course_image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
      subjects: Array.isArray(body.subjects) ? body.subjects.map(String) : [],
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'courses', id), payload);
      return jsonResponse(payload, 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `courses/${id}`);
    }
  }

  const courseMatch = path.match(/^\/courses\/([^/]+)$/);
  if (courseMatch) {
    const id = courseMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    if (method === 'PUT') {
      try {
        const snap = await getDoc(doc(db, 'courses', id));
        if (!snap.exists()) return jsonResponse({ error: 'Course not found' }, 404);
        const cur = snap.data();
        const updated = {
          id,
          name: String(body.name ?? cur.name),
          duration: String(body.duration ?? cur.duration),
          status: (body.status ?? cur.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
          description: String(body.description ?? cur.description ?? ''),
          course_image: body.course_image ?? cur.course_image ?? '',
          subjects: Array.isArray(body.subjects) ? body.subjects.map(String) : cur.subjects || [],
          ...(cur.createdAt ? { createdAt: cur.createdAt } : {}),
        };
        await setDoc(doc(db, 'courses', id), updated);
        return jsonResponse(updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `courses/${id}`);
      }
    }
    if (method === 'DELETE') {
      try {
        await deleteDoc(doc(db, 'courses', id));
        return jsonResponse({ message: 'Course deleted', id });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `courses/${id}`);
      }
    }
  }

  // ==========================================
  // SUBJECTS
  // ==========================================
  if (path === '/subjects' && method === 'GET') {
    const courseId = params.get('course_id');
    const [subjects, courses] = await Promise.all([getAllDocs('subjects'), getAllDocs('courses')]);
    let list = subjects;
    if (courseId) {
      const course = courses.find((c) => c.id === courseId);
      const allowed = course?.subjects || DEFAULT_COURSE_SUBJECTS[courseId] || [];
      list = subjects.filter((s) => s.course_id === courseId || allowed.includes(s.id));
    }
    return jsonResponse(list);
  }

  if (path === '/subjects' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const id = makeId('s');
    const payload: Record<string, any> = {
      id,
      name: String(body.name || '').trim(),
      description: String(body.description || ''),
      status: body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    };
    if (body.course_id) payload.course_id = String(body.course_id);
    if (body.category) payload.category = String(body.category);
    try {
      await setDoc(doc(db, 'subjects', id), payload);
      return jsonResponse(payload, 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `subjects/${id}`);
    }
  }

  const subjectMatch = path.match(/^\/subjects\/([^/]+)$/);
  if (subjectMatch) {
    const id = subjectMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    if (method === 'DELETE') {
      try {
        await deleteDoc(doc(db, 'subjects', id));
        return jsonResponse({ message: 'Subject deleted' });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `subjects/${id}`);
      }
    }
  }

  // ==========================================
  // TOPICS & TEST LEVELS
  // ==========================================
  if (path === '/topics' && method === 'GET') {
    const subjectId = params.get('subject_id');
    const topics = await getAllDocs('topics');
    return jsonResponse(subjectId ? topics.filter((t) => t.subject_id === subjectId) : topics);
  }

  if (path === '/topics' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const id = makeId('t');
    const payload = {
      id,
      subject_id: String(body.subject_id || ''),
      name: String(body.name || '').trim(),
      description: String(body.description || ''),
      status: 'ACTIVE',
    };
    try {
      await setDoc(doc(db, 'topics', id), payload);
      return jsonResponse(payload, 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `topics/${id}`);
    }
  }

  const topicMatch = path.match(/^\/topics\/([^/]+)$/);
  if (topicMatch && method === 'DELETE') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    try {
      await deleteDoc(doc(db, 'topics', topicMatch[1]));
      return jsonResponse({ message: 'Topic deleted' });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `topics/${topicMatch[1]}`);
    }
  }

  if (path === '/test-levels' && method === 'GET') {
    try {
      const levels = await getAllDocs('test_levels');
      return jsonResponse(levels.length > 0 ? levels : TEST_LEVELS);
    } catch {
      return jsonResponse(TEST_LEVELS);
    }
  }

  // ==========================================
  // STUDENTS (Admin Managed + PII Protected)
  // ==========================================
  if (path === '/students' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    let [students, courses, attempts] = await Promise.all([
      getAllDocs('students'),
      getAllDocs('courses'),
      getAllDocs('exam_attempts'),
    ]);

    if (students.some((s) => !s.uid)) {
      const syncRes = await ensureSeededStudentAliases();
      if (syncRes.provisioned > 0) {
        students = await getAllDocs('students');
      }
    }

    const list = students.map((s) => {
      const course = courses.find((c) => c.id === s.course_id);
      const stuAttempts = attempts.filter((a) => a.student_id === s.id || a.student_uid === s.uid);
      return {
        ...s,
        login_ready: Boolean(s.uid),
        course_name: course ? course.name : 'Unknown Course',
        enrolled_subjects: resolveEnrolledSubjects(s, { get: () => courses }),
        attempts_count: stuAttempts.length,
        password: '********',
      };
    });
    return jsonResponse(list);
  }

  if (path === '/students/activate-seeded' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const res = await ensureSeededStudentAliases();
    if (res.authDisabled) {
      return jsonResponse(
        {
          error:
            'Email/Password sign-in is disabled in Firebase Console (Authentication → Sign-in method → Email/Password). Please enable it first, then click Activate again.',
        },
        400
      );
    }
    if (res.errors.length > 0 && res.provisioned === 0) {
      return jsonResponse({ error: res.errors[0] }, 400);
    }
    return jsonResponse({
      ...res,
      message:
        res.provisioned > 0
          ? `${res.provisioned} student login account(s) activated with default password student123.`
          : 'All existing student login accounts are already active.',
    });
  }

  if (path === '/students' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const existingStudents = await getAllDocs('students');
    const courses = await getAllDocs('courses');
    const id = makeId('stu');
    const finalStudentId = String(
      body.student_id || `APTIVOX-2026-${String(existingStudents.length + 1).padStart(3, '0')}`
    )
      .trim()
      .toUpperCase();
    const rawPassword = String(body.password || 'student123').trim();
    if (rawPassword.length < 6) {
      return jsonResponse({ error: 'Student password must be at least 6 characters long.' }, 400);
    }

    const course = courses.find((c) => c.id === body.course_id);
    const enrolledSubjects =
      Array.isArray(body.enrolled_subjects) && body.enrolled_subjects.length > 0
        ? body.enrolled_subjects
        : course?.subjects || DEFAULT_COURSE_SUBJECTS[String(body.course_id || '')] || ['s1', 's2', 's3'];

    let provisionedUid = '';
    try {
      const creds = await provisionStudentCredentials(id, finalStudentId, rawPassword);
      provisionedUid = creds.uid;
    } catch (err: any) {
      return jsonResponse({ error: err?.message || 'Failed to provision student login credentials.' }, 400);
    }

    const newStu = {
      id,
      uid: provisionedUid,
      student_id: finalStudentId,
      name: String(body.name || '').trim(),
      father_name: String(body.father_name || ''),
      email: String(body.email || `${finalStudentId.toLowerCase()}@aptivox.edu`).trim().toLowerCase(),
      mobile: String(body.mobile || ''),
      dob: String(body.dob || '2004-01-01'),
      address: String(body.address || ''),
      course_id: String(body.course_id || 'c5'),
      enrolled_subjects: enrolledSubjects.map(String),
      batch: String(body.batch || 'Morning 9:00 AM - 11:00 AM'),
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      profile_image:
        body.profile_image ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      createdAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'students', id), newStu);
      return jsonResponse({ ...newStu, raw_password_given: rawPassword }, 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `students/${id}`);
    }
  }

  const stuResetMatch = path.match(/^\/students\/([^/]+)\/reset-password$/);
  if (stuResetMatch && method === 'POST') {
    const id = stuResetMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const snap = await getDoc(doc(db, 'students', id));
    if (!snap.exists()) return jsonResponse({ error: 'Student not found' }, 404);
    const stu = snap.data();
    const rawPassword = String(body.new_password || 'aptivox@123').trim();
    if (rawPassword.length < 6) {
      return jsonResponse({ error: 'New password must be at least 6 characters long.' }, 400);
    }
    try {
      const creds = await provisionStudentCredentials(id, stu.student_id, rawPassword, stu.uid);
      await updateDoc(doc(db, 'students', id), {
        uid: creds.uid,
        updatedAt: serverTimestamp(),
      });
      return jsonResponse({
        message: 'Student password updated successfully.',
        student_id: stu.student_id,
        new_password: rawPassword,
      });
    } catch (err: any) {
      return jsonResponse({ error: err?.message || 'Failed to reset student password.' }, 400);
    }
  }

  const stuMatch = path.match(/^\/students\/([^/]+)$/);
  if (stuMatch) {
    const id = stuMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);

    if (method === 'PUT') {
      try {
        const snap = await getDoc(doc(db, 'students', id));
        if (!snap.exists()) return jsonResponse({ error: 'Student not found' }, 404);
        const cur = snap.data();
        let nextUid = cur.uid || '';
        const nextStudentId = String(body.student_id ?? cur.student_id).trim().toUpperCase();

        if (body.password && String(body.password).trim() !== '') {
          const rawPass = String(body.password).trim();
          if (rawPass.length < 6) {
            return jsonResponse({ error: 'New password must be at least 6 characters long.' }, 400);
          }
          try {
            const creds = await provisionStudentCredentials(id, nextStudentId, rawPass, cur.uid);
            nextUid = creds.uid;
          } catch (err: any) {
            return jsonResponse({ error: err?.message || 'Failed to update student password.' }, 400);
          }
        }

        const updated = {
          id,
          uid: nextUid,
          student_id: nextStudentId,
          name: String(body.name ?? cur.name),
          father_name: String(body.father_name ?? cur.father_name ?? ''),
          email: String(body.email ?? cur.email).trim().toLowerCase(),
          mobile: String(body.mobile ?? cur.mobile ?? ''),
          dob: String(body.dob ?? cur.dob ?? ''),
          address: String(body.address ?? cur.address ?? ''),
          course_id: String(body.course_id ?? cur.course_id),
          enrolled_subjects: Array.isArray(body.enrolled_subjects)
            ? body.enrolled_subjects.map(String)
            : cur.enrolled_subjects || [],
          batch: String(body.batch ?? cur.batch ?? ''),
          enrollment_date: String(cur.enrollment_date || ''),
          status: (body.status ?? cur.status) === 'DEACTIVATED' ? 'DEACTIVATED' : 'ACTIVE',
          profile_image: body.profile_image ?? cur.profile_image ?? '',
          createdAt: cur.createdAt,
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'students', id), updated);
        return jsonResponse(updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${id}`);
      }
    }

    if (method === 'DELETE') {
      try {
        const snap = await getDoc(doc(db, 'students', id));
        const stuCode = snap.exists() ? String(snap.data().student_id || '').trim().toUpperCase() : '';
        await deleteDoc(doc(db, 'students', id));
        if (stuCode) {
          await deleteDoc(doc(db, 'student_login_aliases', stuCode)).catch(() => {});
        }
        return jsonResponse({ message: 'Student deleted successfully', id });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
      }
    }
  }

  // ==========================================
  // EXAMS & PAPERS
  // ==========================================
  if (path === '/exams' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx) return jsonResponse({ error: 'Authentication required' }, 401);

    const [papers, courses, subjects, topics, levels] = await Promise.all([
      getAllDocs('exam_papers'),
      getAllDocs('courses'),
      getAllDocs('subjects'),
      getAllDocs('topics'),
      getAllDocs('test_levels'),
    ]);

    if (ctx.role === 'ADMIN') {
      const enriched = papers.map((p) => ({
        ...p,
        course_name: courses.find((c) => c.id === p.course_id)?.name || 'All Courses',
        subject_name: subjects.find((s) => s.id === p.subject_id)?.name || '',
        topic_name: topics.find((t) => t.id === p.topic_id)?.name || '',
        level_name: levels.find((l) => l.id === p.level_id)?.name || '',
      }));
      return jsonResponse(enriched);
    }

    // Student view: filter by student_uid on attempts
    const attemptsSnap = await getDocs(
      query(collection(db, 'exam_attempts'), where('student_uid', '==', ctx.uid))
    );
    const stuAttempts = attemptsSnap.docs.map((d) => d.data());
    const enrolledSubjects = resolveEnrolledSubjects(ctx, { get: () => courses });

    const studentExams = papers
      .filter((p) => p.status === 'PUBLISHED')
      .map((p) => {
        const hasAccess = Boolean(
          (p.subject_id && enrolledSubjects.includes(p.subject_id)) ||
            (p.course_id && p.course_id === ctx.course_id) ||
            (Array.isArray(p.course_ids) && p.course_ids.includes(ctx.course_id))
        );
        const attempt = stuAttempts.find((a) => a.exam_id === p.id);
        let status = 'AVAILABLE';
        if (!hasAccess) {
          status = 'LOCKED';
        } else if (attempt) {
          if (attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED') {
            status = 'COMPLETED';
          } else if (attempt.status === 'RE_EXAM_REQUIRED' || attempt.status === 'VIOLATED') {
            status = 'RE_EXAM_REQUIRED';
          } else if (attempt.status === 'IN_PROGRESS') {
            status = 'IN_PROGRESS';
          }
        }
        return {
          ...p,
          subject_name: subjects.find((s) => s.id === p.subject_id)?.name || '',
          topic_name: topics.find((t) => t.id === p.topic_id)?.name || '',
          level_name: levels.find((l) => l.id === p.level_id)?.name || '',
          status,
          attempt_id: attempt?.id || null,
          score: attempt?.score ?? null,
          percentage: attempt?.percentage ?? null,
        };
      });

    return jsonResponse(studentExams);
  }

  if (path === '/exams' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const id = makeId('p');
    const payload = {
      id,
      course_id: String(body.course_id || 'c1'),
      subject_id: String(body.subject_id || ''),
      topic_id: String(body.topic_id || ''),
      level_id: String(body.level_id || 'l1'),
      paper_number: Number(body.paper_number || 1),
      title: String(body.title || '').trim(),
      duration_minutes: Number(body.duration_minutes || 60),
      total_questions: Number(body.total_questions || 50),
      total_marks: Number(body.total_marks || 100),
      passing_marks: Number(body.passing_marks || 40),
      negative_marking: Number(body.negative_marking ?? 0.5),
      randomize: body.randomize !== false,
      status: body.status || 'PUBLISHED',
    };
    try {
      await setDoc(doc(db, 'exam_papers', id), payload);
      return jsonResponse(payload, 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `exam_papers/${id}`);
    }
  }

  const examDeleteMatch = path.match(/^\/exams\/([^/]+)$/);
  if (examDeleteMatch && method === 'DELETE') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    try {
      await deleteDoc(doc(db, 'exam_papers', examDeleteMatch[1]));
      return jsonResponse({ message: 'Exam paper deleted' });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `exam_papers/${examDeleteMatch[1]}`);
    }
  }

  // ==========================================
  // QUESTIONS
  // ==========================================
  if (path === '/questions' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const paperId = params.get('paper_id');
    const questions = await getAllDocs('questions');
    return jsonResponse(paperId ? questions.filter((q) => q.paper_id === paperId) : questions);
  }

  if (path === '/questions' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const id = makeId('q');
    const payload = {
      id,
      paper_id: String(body.paper_id || 'p1'),
      course_id: String(body.course_id || ''),
      subject_id: String(body.subject_id || ''),
      topic_id: String(body.topic_id || ''),
      level_id: String(body.level_id || 'l1'),
      question_text: String(body.question_text || '').trim(),
      option_a: String(body.option_a || ''),
      option_b: String(body.option_b || ''),
      option_c: String(body.option_c || ''),
      option_d: String(body.option_d || ''),
      correct_answer: ['A', 'B', 'C', 'D'].includes(body.correct_answer) ? body.correct_answer : 'A',
      marks: Number(body.marks ?? 2),
      negative_marks: Number(body.negative_marks ?? 0.5),
      explanation: String(body.explanation || ''),
      difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(body.difficulty) ? body.difficulty : 'MEDIUM',
    };
    try {
      await setDoc(doc(db, 'questions', id), payload);
      return jsonResponse(payload, 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `questions/${id}`);
    }
  }

  if (path === '/questions/import' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const rows = Array.isArray(body.questions) ? body.questions : [];
    const batch = writeBatch(db);
    rows.forEach((row: any, idx: number) => {
      const id = makeId(`qi_${idx}`);
      batch.set(doc(db, 'questions', id), {
        id,
        paper_id: String(row.paper_id || body.paper_id || 'p1'),
        question_text: String(row.question_text || ''),
        option_a: String(row.option_a || ''),
        option_b: String(row.option_b || ''),
        option_c: String(row.option_c || ''),
        option_d: String(row.option_d || ''),
        correct_answer: ['A', 'B', 'C', 'D'].includes(row.correct_answer) ? row.correct_answer : 'A',
        marks: Number(row.marks ?? 2),
        negative_marks: Number(row.negative_marks ?? 0.5),
        explanation: String(row.explanation || ''),
        difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(row.difficulty) ? row.difficulty : 'MEDIUM',
      });
    });
    try {
      await batch.commit();
      return jsonResponse({ imported: rows.length, message: `${rows.length} questions imported` });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'questions');
    }
  }

  const questionMatch = path.match(/^\/questions\/([^/]+)$/);
  if (questionMatch) {
    const id = questionMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    if (method === 'PUT') {
      try {
        const snap = await getDoc(doc(db, 'questions', id));
        if (!snap.exists()) return jsonResponse({ error: 'Question not found' }, 404);
        const cur = snap.data();
        const updated = {
          ...cur,
          id,
          question_text: String(body.question_text ?? cur.question_text),
          option_a: String(body.option_a ?? cur.option_a),
          option_b: String(body.option_b ?? cur.option_b),
          option_c: String(body.option_c ?? cur.option_c),
          option_d: String(body.option_d ?? cur.option_d),
          correct_answer: body.correct_answer ?? cur.correct_answer,
          marks: Number(body.marks ?? cur.marks ?? 2),
          explanation: String(body.explanation ?? cur.explanation ?? ''),
          difficulty: body.difficulty ?? cur.difficulty ?? 'MEDIUM',
        };
        await setDoc(doc(db, 'questions', id), updated);
        return jsonResponse(updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `questions/${id}`);
      }
    }
    if (method === 'DELETE') {
      try {
        await deleteDoc(doc(db, 'questions', id));
        return jsonResponse({ message: 'Question deleted' });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `questions/${id}`);
      }
    }
  }

  // ==========================================
  // LIVE EXAM FLOW (Start, Save Answer, Violation, Submit)
  // ==========================================
  const examStartMatch = path.match(/^\/exams\/([^/]+)\/start$/);
  if (examStartMatch && method === 'POST') {
    const examId = examStartMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'STUDENT') return jsonResponse({ error: 'Student account required' }, 403);

    if (!body.camera_permission) {
      return jsonResponse({ error: 'Camera permission is required to start this examination.' }, 400);
    }

    const paperSnap = await getDoc(doc(db, 'exam_papers', examId));
    if (!paperSnap.exists()) return jsonResponse({ error: 'Exam paper not found' }, 404);
    const paper = paperSnap.data();

    const attemptsSnap = await getDocs(
      query(
        collection(db, 'exam_attempts'),
        where('student_uid', '==', ctx.uid),
        where('exam_id', '==', examId)
      )
    );
    const attempts = attemptsSnap.docs.map((d) => d.data());
    if (attempts.find((a) => a.status === 'COMPLETED' || a.status === 'SUBMITTED')) {
      return jsonResponse({ error: 'Exam Already Completed. Each test can be attempted only once.' }, 403);
    }
    if (attempts.find((a) => a.status === 'RE_EXAM_REQUIRED' || a.status === 'VIOLATED')) {
      return jsonResponse({ error: 'Exam Violated. Re-examination is pending Admin Approval.' }, 403);
    }

    let activeAttempt = attempts.find((a) => a.status === 'IN_PROGRESS');
    if (!activeAttempt) {
      const attId = makeId('att');
      const newAttempt = {
        id: attId,
        student_id: ctx.id,
        student_uid: ctx.uid,
        exam_id: examId,
        status: 'IN_PROGRESS',
        started_at: new Date().toISOString(),
        submitted_at: null,
        time_taken_seconds: 0,
        score: 0,
        total_marks: Number(paper.total_marks || 100),
        percentage: 0,
        passed: false,
        correct_count: 0,
        wrong_count: 0,
        unanswered_count: 0,
        violation_count: 0,
        camera_status: 'ACTIVE',
        re_exam_required: false,
        createdAt: serverTimestamp(),
      };
      try {
        await setDoc(doc(db, 'exam_attempts', attId), newAttempt);
        activeAttempt = newAttempt;
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `exam_attempts/${attId}`);
      }
    }

    const qSnap = await getDocs(query(collection(db, 'questions'), where('paper_id', '==', examId)));
    let rawQuestions = qSnap.docs.map((d) => d.data());
    if (paper.randomize) {
      rawQuestions = [...rawQuestions].sort(() => 0.5 - Math.random());
    }
    const sanitizedQuestions = rawQuestions.map((q, idx) => ({
      id: q.id,
      question_number: idx + 1,
      question_text: q.question_text,
      question_image: q.question_image || null,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      marks: q.marks,
      negative_marks: q.negative_marks ?? q.negative_marking ?? 0.5,
    }));

    const ansSnap = await getDocs(
      query(
        collection(db, 'exam_answers'),
        where('student_uid', '==', ctx.uid),
        where('attempt_id', '==', activeAttempt.id)
      )
    );
    const savedAnswers = ansSnap.docs.map((d) => d.data());

    return jsonResponse({
      attempt_id: activeAttempt.id,
      started_at: activeAttempt.started_at,
      duration_minutes: paper.duration_minutes,
      total_questions: sanitizedQuestions.length,
      paper: {
        id: paper.id,
        title: paper.title,
        total_marks: paper.total_marks,
        passing_marks: paper.passing_marks,
        negative_marking: paper.negative_marking,
      },
      questions: sanitizedQuestions,
      saved_answers: savedAnswers,
    });
  }

  const saveAnsMatch = path.match(/^\/exams\/([^/]+)\/save-answer$/);
  if (saveAnsMatch && method === 'POST') {
    const examId = saveAnsMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'STUDENT') return jsonResponse({ error: 'Student account required' }, 403);
    const { attempt_id, question_id, selected_option, is_marked_for_review } = body;
    if (!attempt_id || !question_id) {
      return jsonResponse({ error: 'Attempt ID and Question ID required' }, 400);
    }

    const ansId = `${attempt_id}_${question_id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const payload = {
      id: ansId,
      attempt_id: String(attempt_id),
      student_uid: ctx.uid,
      exam_id: examId,
      question_id: String(question_id),
      selected_option: ['A', 'B', 'C', 'D', ''].includes(selected_option) ? selected_option : '',
      is_marked_for_review: Boolean(is_marked_for_review),
      answered_at: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'exam_answers', ansId), payload);
      return jsonResponse({ success: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `exam_answers/${ansId}`);
    }
  }

  const violMatch = path.match(/^\/exams\/([^/]+)\/violation$/);
  if (violMatch && method === 'POST') {
    const examId = violMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'STUDENT') return jsonResponse({ error: 'Student account required' }, 403);
    const { attempt_id, violation_type, details } = body;

    const attRef = doc(db, 'exam_attempts', attempt_id);
    const attSnap = await getDoc(attRef);
    if (!attSnap.exists()) return jsonResponse({ error: 'Attempt not found' }, 404);
    const attempt = attSnap.data();

    const currentViolations = Number(attempt.violation_count || 0) + 1;
    const shouldInvalidate = currentViolations >= 3 || violation_type === 'BROWSER_BACK_LEAVE';
    const nextStatus = shouldInvalidate ? 'RE_EXAM_REQUIRED' : attempt.status;

    const violId = makeId('viol');
    const notifId = makeId('notif');
    try {
      await setDoc(doc(db, 'exam_violations', violId), {
        id: violId,
        attempt_id: String(attempt_id),
        student_id: ctx.id,
        student_uid: ctx.uid,
        exam_id: examId,
        violation_type: String(violation_type || 'EXIT_ATTEMPT_DETECTED'),
        details: String(details || 'Student attempted to leave examination window'),
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(attRef, {
        violation_count: currentViolations,
        status: nextStatus,
        re_exam_required: shouldInvalidate,
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'notifications', notifId), {
        id: notifId,
        recipient_type: 'ADMIN',
        student_id: ctx.id,
        student_uid: ctx.uid,
        title: 'Exam Violation Detected',
        message: `Student ${ctx.name} (${ctx.student_id}) triggered violation: ${violation_type}. Total: ${currentViolations}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      return jsonResponse({
        violation_count: currentViolations,
        status: nextStatus,
        re_exam_required: shouldInvalidate,
        warning: shouldInvalidate
          ? 'Exam locked due to integrity violation. Contact admin for re-exam.'
          : `Warning ${currentViolations}/3: Do not leave the exam window.`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `exam_attempts/${attempt_id}`);
    }
  }

  const submitMatch = path.match(/^\/exams\/([^/]+)\/submit$/);
  if (submitMatch && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'STUDENT') return jsonResponse({ error: 'Student account required' }, 403);
    const { attempt_id, time_taken_seconds } = body;

    const attRef = doc(db, 'exam_attempts', attempt_id);
    const attSnap = await getDoc(attRef);
    if (!attSnap.exists()) return jsonResponse({ error: 'Attempt not found' }, 404);
    const attempt = attSnap.data();

    const [paperSnap, qSnap, ansSnap] = await Promise.all([
      getDoc(doc(db, 'exam_papers', attempt.exam_id)),
      getDocs(query(collection(db, 'questions'), where('paper_id', '==', attempt.exam_id))),
      getDocs(
        query(
          collection(db, 'exam_answers'),
          where('student_uid', '==', ctx.uid),
          where('attempt_id', '==', attempt.id)
        )
      ),
    ]);

    const paper = paperSnap.exists() ? paperSnap.data() : { total_marks: 100, passing_marks: 40, negative_marking: 0.5 };
    const questions = qSnap.docs.map((d) => d.data());
    const answers = ansSnap.docs.map((d) => d.data());

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;

    for (const q of questions) {
      const ans = answers.find((a) => a.question_id === q.id);
      if (!ans || !ans.selected_option) {
        unansweredCount++;
      } else if (ans.selected_option === q.correct_answer) {
        correctCount++;
        totalScore += Number(q.marks || 2);
      } else {
        wrongCount++;
        const neg = Number(q.negative_marks ?? q.negative_marking ?? paper.negative_marking ?? 0.5);
        totalScore -= neg;
      }
    }

    const totalMarks = Number(paper.total_marks || questions.length * 2 || 100);
    const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const percentage = totalMarks > 0 ? Math.round((finalScore / totalMarks) * 100) : 0;
    const passed = percentage >= Number(paper.passing_marks || 40);

    const updates = {
      status: 'COMPLETED',
      submitted_at: new Date().toISOString(),
      time_taken_seconds: Number(time_taken_seconds || 0),
      score: finalScore,
      total_marks: totalMarks,
      percentage,
      passed,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unanswered_count: unansweredCount,
      updatedAt: serverTimestamp(),
    };

    try {
      await updateDoc(attRef, updates);
      return jsonResponse({
        message: 'Exam submitted successfully',
        attempt: { ...attempt, ...updates },
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `exam_attempts/${attempt.id}`);
    }
  }

  // ==========================================
  // STUDENT RESULTS & EXAM HISTORY
  // ==========================================
  if (path === '/student/results' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx) return jsonResponse({ error: 'Authentication required' }, 401);

    try {
      const attSnap = await getDocs(
        query(collection(db, 'exam_attempts'), where('student_uid', '==', ctx.uid))
      );
      const attempts = attSnap.docs
        .map((d) => ({ ...d.data(), id: d.id }))
        .filter((a: any) => a.status === 'COMPLETED' || a.status === 'SUBMITTED');

      const [papers, courses, subjects, topics, levels] = await Promise.all([
        getAllDocs('exam_papers'),
        getAllDocs('courses'),
        getAllDocs('subjects'),
        getAllDocs('topics'),
        getAllDocs('test_levels'),
      ]);

      const results = attempts.map((att: any) => {
        const paper = papers.find((p) => p.id === att.exam_id) || {};
        return {
          id: att.id,
          exam_id: att.exam_id,
          title: paper.title || 'Exam Paper',
          course_name: courses.find((c) => c.id === paper.course_id)?.name || '',
          subject_name: subjects.find((s) => s.id === paper.subject_id)?.name || '',
          topic_name: topics.find((t) => t.id === paper.topic_id)?.name || '',
          level_name: levels.find((l) => l.id === paper.level_id)?.name || '',
          paper_number: paper.paper_number || 1,
          started_at: att.started_at,
          submitted_at: att.submitted_at,
          time_taken_seconds: att.time_taken_seconds,
          score: att.score,
          total_marks: att.total_marks || paper.total_marks || 100,
          percentage: att.percentage,
          passed: att.percentage >= (paper.passing_marks || 40),
          correct_count: att.correct_count,
          wrong_count: att.wrong_count,
          unanswered_count: att.unanswered_count,
        };
      });

      return jsonResponse(results);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'exam_attempts');
    }
  }

  const resDetailMatch = path.match(/^\/student\/results\/([^/]+)$/);
  if (resDetailMatch && method === 'GET') {
    const attemptId = resDetailMatch[1];
    const ctx = await resolveCurrentUserContext();
    if (!ctx) return jsonResponse({ error: 'Authentication required' }, 401);

    try {
      const attSnap = await getDoc(doc(db, 'exam_attempts', attemptId));
      if (!attSnap.exists()) return jsonResponse({ error: 'Result record not found' }, 404);
      const attempt = attSnap.data();

      const [paperSnap, settingsSnap, courses, subjects, topics] = await Promise.all([
        getDoc(doc(db, 'exam_papers', attempt.exam_id)),
        getDoc(doc(db, 'settings', 'institute')),
        getAllDocs('courses'),
        getAllDocs('subjects'),
        getAllDocs('topics'),
      ]);

      let studentData: any = ctx;
      if (ctx.role === 'ADMIN') {
        const stuSnap = await getDoc(doc(db, 'students', attempt.student_id));
        if (stuSnap.exists()) studentData = stuSnap.data();
      }

      const paper = paperSnap.exists() ? paperSnap.data() : {};
      const course = courses.find((c) => c.id === studentData?.course_id);
      const subject = subjects.find((s) => s.id === paper?.subject_id);
      const topic = topics.find((t) => t.id === paper?.topic_id);
      const settings = settingsSnap.exists() ? settingsSnap.data() : INITIAL_SETTINGS;

      return jsonResponse({
        attempt,
        student: {
          name: studentData?.name,
          student_id: studentData?.student_id,
          father_name: studentData?.father_name,
          course_name: course?.name || studentData?.course_name,
          profile_image: studentData?.profile_image,
          batch: studentData?.batch,
        },
        paper: {
          title: paper?.title,
          paper_number: paper?.paper_number,
          subject_name: subject?.name,
          topic_name: topic?.name,
          total_marks: paper?.total_marks,
          passing_marks: paper?.passing_marks,
        },
        institute: settings,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `exam_attempts/${attemptId}`);
    }
  }

  // ==========================================
  // ADMIN ANALYTICS, RESULTS, MONITOR, RE-EXAMS
  // ==========================================
  if (path === '/admin/dashboard-stats' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);

    const [students, courses, papers, questions, attempts, notes] = await Promise.all([
      getAllDocs('students'),
      getAllDocs('courses'),
      getAllDocs('exam_papers'),
      getAllDocs('questions'),
      getAllDocs('exam_attempts'),
      getAllDocs('notes'),
    ]);

    if (students.some((s) => !s.uid)) {
      await ensureSeededStudentAliases().catch(() => {});
    }

    const completed = attempts.filter((a) => a.status === 'COMPLETED' || a.status === 'SUBMITTED');
    const reExams = attempts.filter((a) => a.status === 'RE_EXAM_REQUIRED' || a.re_exam_required);
    const liveActive = attempts.filter((a) => a.status === 'IN_PROGRESS');
    const avgScore =
      completed.length > 0
        ? Math.round(completed.reduce((sum, a) => sum + (a.percentage || 0), 0) / completed.length)
        : 0;

    return jsonResponse({
      total_students: students.length,
      active_students: students.filter((s) => s.status === 'ACTIVE').length,
      total_courses: courses.length,
      total_exams: papers.length,
      total_questions: questions.length,
      completed_exams: completed.length,
      re_exam_count: reExams.length,
      live_active_count: liveActive.length,
      average_score: avgScore,
      total_notes: notes.length,
      course_stats: courses.map((c) => ({
        name: c.name,
        students: students.filter((s) => s.course_id === c.id).length,
        exams: papers.filter((p) => p.course_id === c.id).length,
      })),
    });
  }

  if (path === '/admin/results' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const [attempts, students, papers, courses] = await Promise.all([
      getAllDocs('exam_attempts'),
      getAllDocs('students'),
      getAllDocs('exam_papers'),
      getAllDocs('courses'),
    ]);

    return jsonResponse(
      attempts.map((att) => {
        const student = students.find((s) => s.id === att.student_id || s.uid === att.student_uid) || {};
        const paper = papers.find((p) => p.id === att.exam_id) || {};
        const course = courses.find((c) => c.id === student.course_id) || {};
        return {
          ...att,
          student_name: student.name || 'Unknown',
          student_reg_id: student.student_id || 'Unknown',
          course_name: course.name || 'Unknown',
          exam_title: paper.title || 'Unknown',
        };
      })
    );
  }

  if (path === '/admin/live-monitor' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const [attempts, students, papers, courses] = await Promise.all([
      getAllDocs('exam_attempts'),
      getAllDocs('students'),
      getAllDocs('exam_papers'),
      getAllDocs('courses'),
    ]);

    return jsonResponse(
      attempts
        .filter((a) => a.status === 'IN_PROGRESS')
        .map((att) => {
          const student = students.find((s) => s.id === att.student_id || s.uid === att.student_uid) || {};
          const paper = papers.find((p) => p.id === att.exam_id) || {};
          const course = courses.find((c) => c.id === student.course_id) || {};
          return {
            ...att,
            student_name: student.name || 'Unknown',
            student_reg_id: student.student_id || '',
            course_name: course.name || '',
            exam_title: paper.title || '',
          };
        })
    );
  }

  if (path === '/admin/re-exams' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const [attempts, students, papers, violations] = await Promise.all([
      getAllDocs('exam_attempts'),
      getAllDocs('students'),
      getAllDocs('exam_papers'),
      getAllDocs('exam_violations'),
    ]);
    return jsonResponse(
      attempts
        .filter((a) => a.status === 'RE_EXAM_REQUIRED' || a.re_exam_required)
        .map((att) => {
          const student = students.find((s) => s.id === att.student_id || s.uid === att.student_uid) || {};
          const paper = papers.find((p) => p.id === att.exam_id) || {};
          return {
            ...att,
            student_name: student.name || 'Unknown',
            student_reg_id: student.student_id || '',
            exam_title: paper.title || '',
            violations: violations.filter((v) => v.attempt_id === att.id),
          };
        })
    );
  }

  const reExamApproveMatch = path.match(/^\/admin\/re-exams\/([^/]+)\/approve$/);
  if (reExamApproveMatch && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const attId = reExamApproveMatch[1];
    try {
      await deleteDoc(doc(db, 'exam_attempts', attId));
      return jsonResponse({ message: 'Re-exam approved. Student may attempt again.' });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `exam_attempts/${attId}`);
    }
  }

  const reExamRejectMatch = path.match(/^\/admin\/re-exams\/([^/]+)\/reject$/);
  if (reExamRejectMatch && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const attId = reExamRejectMatch[1];
    try {
      await updateDoc(doc(db, 'exam_attempts', attId), {
        status: 'VIOLATED',
        re_exam_required: false,
        updatedAt: serverTimestamp(),
      });
      return jsonResponse({ message: 'Re-exam request rejected.' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `exam_attempts/${attId}`);
    }
  }

  // ==========================================
  // NOTES
  // ==========================================
  if (path === '/notes' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx) return jsonResponse({ error: 'Authentication required' }, 401);
    const [notes, courses, subjects, topics] = await Promise.all([
      getAllDocs('notes'),
      getAllDocs('courses'),
      getAllDocs('subjects'),
      getAllDocs('topics'),
    ]);
    let list = notes;
    if (ctx.role === 'STUDENT') {
      const enrolledSubjects = resolveEnrolledSubjects(ctx, { get: () => courses });
      list = notes.filter(
        (n) =>
          n.status === 'ACTIVE' &&
          ((n.subject_id && enrolledSubjects.includes(n.subject_id)) ||
            (n.course_id && n.course_id === ctx.course_id))
      );
    }
    return jsonResponse(
      list.map((n) => ({
        ...n,
        course_name: courses.find((c) => c.id === n.course_id)?.name || '',
        subject_name: subjects.find((s) => s.id === n.subject_id)?.name || '',
        topic_name: topics.find((t) => t.id === n.topic_id)?.name || '',
      }))
    );
  }

  if (path === '/notes' && method === 'POST') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    const id = makeId('n');
    const payload = {
      id,
      course_id: String(body.course_id || ''),
      subject_id: String(body.subject_id || ''),
      topic_id: String(body.topic_id || ''),
      title: String(body.title || '').trim(),
      description: String(body.description || ''),
      pdf_url: String(body.pdf_url || '#'),
      cover_image: body.cover_image || null,
      status: 'ACTIVE',
      download_count: 0,
      uploaded_at: new Date().toISOString().split('T')[0],
    };
    try {
      await setDoc(doc(db, 'notes', id), payload);
      return jsonResponse(payload, 201);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notes/${id}`);
    }
  }

  const noteDownloadMatch = path.match(/^\/notes\/([^/]+)\/download$/);
  if (noteDownloadMatch && method === 'POST') {
    const id = noteDownloadMatch[1];
    try {
      const ref = doc(db, 'notes', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { download_count: Number(snap.data().download_count || 0) + 1 });
      }
      return jsonResponse({ success: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notes/${id}`);
    }
  }

  const noteDeleteMatch = path.match(/^\/notes\/([^/]+)$/);
  if (noteDeleteMatch && method === 'DELETE') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx || ctx.role !== 'ADMIN') return jsonResponse({ error: 'Admin privileges required' }, 403);
    try {
      await deleteDoc(doc(db, 'notes', noteDeleteMatch[1]));
      return jsonResponse({ message: 'Note deleted' });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notes/${noteDeleteMatch[1]}`);
    }
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  if (path === '/notifications' && method === 'GET') {
    const ctx = await resolveCurrentUserContext();
    if (!ctx) return jsonResponse({ error: 'Authentication required' }, 401);
    if (ctx.role === 'ADMIN') {
      const notifs = await getAllDocs('notifications');
      return jsonResponse(notifs.filter((n) => n.recipient_type === 'ADMIN'));
    }
    const snap = await getDocs(
      query(collection(db, 'notifications'), where('student_uid', '==', ctx.uid))
    );
    return jsonResponse(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
  }

  return jsonResponse({ error: `Unknown API route: ${method} /api${path}` }, 404);
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlStr =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.pathname + input.search
        : input.url;

  if (urlStr.startsWith('/api/')) {
    return handleApiRequest(urlStr, init);
  }
  return window.fetch(input, init);
}

let installed = false;
export function installFirestoreFetchInterceptor() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (desc && !desc.configurable && !desc.writable) {
      return;
    }
    const originalFetch = window.fetch.bind(window);
    const wrappedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.pathname + input.search
            : input.url;
      if (urlStr.startsWith('/api/')) {
        return handleApiRequest(urlStr, init);
      }
      return originalFetch(input, init);
    };
    Object.defineProperty(window, 'fetch', {
      value: wrappedFetch,
      configurable: true,
      writable: true,
    });
  } catch {
    // Native fetch is locked by sandbox/proxy; app uses apiFetch directly.
  }
}
