import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { COURSE_DEFAULT_SUBJECTS, ALL_SUBJECTS, getStudentEnrolledSubjects } from './curriculum.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aptivox_super_secure_jwt_secret_2026';

// Middleware for Token Verification
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

export const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Access denied. Student privileges required.' });
  }
  next();
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Admin Login: POST /api/auth/admin/login
router.post('/auth/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const admins = db.get('admins');
  const admin = admins.find((a) => a.email.toLowerCase() === email.toLowerCase());

  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: 'ADMIN', name: admin.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Admin login successful',
    token,
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'ADMIN'
    }
  });
});

// Student Login: POST /api/auth/student/login
router.post('/auth/student/login', (req, res) => {
  const { student_id, password } = req.body;
  if (!student_id || !password) {
    return res.status(400).json({ error: 'Student ID and password are required' });
  }

  const students = db.get('students');
  const student = students.find(
    (s) => s.student_id.trim().toUpperCase() === student_id.trim().toUpperCase()
  );

  if (!student) {
    return res.status(401).json({ error: 'Student ID not found. Please contact Aptivox Admin.' });
  }

  if (student.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Student account is deactivated. Contact Admin.' });
  }

  if (!bcrypt.compareSync(password, student.password)) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  const course = db.findById('courses', student.course_id);

  const token = jwt.sign(
    { id: student.id, student_id: student.student_id, course_id: student.course_id, role: 'STUDENT', name: student.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Student login successful',
    token,
    user: {
      id: student.id,
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      course_id: student.course_id,
      course_name: course ? course.name : 'Unknown Course',
      enrolled_subjects: getStudentEnrolledSubjects(student, db),
      batch: student.batch,
      profile_image: student.profile_image,
      role: 'STUDENT'
    }
  });
});

// Get Current User Profile: GET /api/auth/me
router.get('/auth/me', authenticate, (req, res) => {
  if (req.user.role === 'ADMIN') {
    const admin = db.findById('admins', req.user.id);
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    return res.json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: 'ADMIN'
    });
  } else {
    const student = db.findById('students', req.user.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const course = db.findById('courses', student.course_id);
    const enrolledSubs = getStudentEnrolledSubjects(student, db);
    const subjects = db.get('subjects');
    const enrichedSubjectDetails = enrolledSubs.map((sid) => {
      const found = subjects.find((s) => s.id === sid);
      return found ? { id: found.id, name: found.name, category: found.category } : { id: sid, name: sid };
    });

    return res.json({
      ...student,
      course_name: course ? course.name : 'Unknown Course',
      enrolled_subjects: enrolledSubs,
      enrolled_subject_details: enrichedSubjectDetails,
      role: 'STUDENT'
    });
  }
});

// ==========================================
// SETTINGS & INSTITUTE INFO
// ==========================================
router.get('/settings', (req, res) => {
  const settings = db.get('settings');
  res.json(settings);
});

router.put('/settings', authenticate, requireAdmin, (req, res) => {
  const current = db.get('settings');
  const updated = { ...current, ...req.body };
  db.data.settings = updated;
  db.save();
  res.json({ message: 'Settings updated successfully', settings: updated });
});

// ==========================================
// COURSE MANAGEMENT
// ==========================================
router.get('/courses', (req, res) => {
  const courses = db.get('courses');
  const students = db.get('students');

  const withStats = courses.map((c) => {
    const courseSubjects = Array.isArray(c.subjects) && c.subjects.length > 0
      ? c.subjects
      : (COURSE_DEFAULT_SUBJECTS[c.id] || []);
    return {
      ...c,
      subjects: courseSubjects,
      subject_count: courseSubjects.length,
      student_count: students.filter((st) => st.course_id === c.id).length
    };
  });

  res.json(withStats);
});

router.post('/courses', authenticate, requireAdmin, (req, res) => {
  const { name, duration, description, course_image, status, subjects } = req.body;
  if (!name) return res.status(400).json({ error: 'Course name is required' });

  const newCourse = db.insert('courses', {
    name,
    duration: duration || '3 Months',
    description: description || '',
    course_image: course_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
    status: status || 'ACTIVE',
    subjects: Array.isArray(subjects) ? subjects : []
  });

  res.status(201).json(newCourse);
});

router.put('/courses/:id', authenticate, requireAdmin, (req, res) => {
  const updates = { ...req.body };
  if (updates.subjects && !Array.isArray(updates.subjects)) {
    delete updates.subjects;
  }
  const updated = db.update('courses', req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Course not found' });
  res.json(updated);
});

router.delete('/courses/:id', authenticate, requireAdmin, (req, res) => {
  const success = db.delete('courses', req.params.id);
  if (!success) return res.status(404).json({ error: 'Course not found' });
  res.json({ message: 'Course removed successfully' });
});

// ==========================================
// SUBJECTS & TOPICS
// ==========================================
router.get('/subjects', (req, res) => {
  const { course_id } = req.query;
  let subjects = db.get('subjects');
  if (course_id) {
    subjects = subjects.filter((s) => s.course_id === course_id);
  }
  const courses = db.get('courses');
  const enriched = subjects.map((s) => ({
    ...s,
    course_name: courses.find((c) => c.id === s.course_id)?.name || ''
  }));
  res.json(enriched);
});

router.post('/subjects', authenticate, requireAdmin, (req, res) => {
  const { course_id, name, description, status } = req.body;
  if (!course_id || !name) return res.status(400).json({ error: 'Course ID and subject name are required' });
  const newSub = db.insert('subjects', { course_id, name, description: description || '', status: status || 'ACTIVE' });
  res.status(201).json(newSub);
});

router.put('/subjects/:id', authenticate, requireAdmin, (req, res) => {
  const updated = db.update('subjects', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Subject not found' });
  res.json(updated);
});

router.delete('/subjects/:id', authenticate, requireAdmin, (req, res) => {
  const success = db.delete('subjects', req.params.id);
  if (!success) return res.status(404).json({ error: 'Subject not found' });
  res.json({ message: 'Subject removed' });
});

router.get('/topics', (req, res) => {
  const { subject_id } = req.query;
  let topics = db.get('topics');
  if (subject_id) {
    topics = topics.filter((t) => t.subject_id === subject_id);
  }
  const subjects = db.get('subjects');
  const enriched = topics.map((t) => ({
    ...t,
    subject_name: subjects.find((s) => s.id === t.subject_id)?.name || ''
  }));
  res.json(enriched);
});

router.post('/topics', authenticate, requireAdmin, (req, res) => {
  const { subject_id, name, description } = req.body;
  if (!subject_id || !name) return res.status(400).json({ error: 'Subject and topic name required' });
  const newTopic = db.insert('topics', { subject_id, name, description: description || '', status: 'ACTIVE' });
  res.status(201).json(newTopic);
});

router.put('/topics/:id', authenticate, requireAdmin, (req, res) => {
  const updated = db.update('topics', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Topic not found' });
  res.json(updated);
});

router.delete('/topics/:id', authenticate, requireAdmin, (req, res) => {
  const success = db.delete('topics', req.params.id);
  if (!success) return res.status(404).json({ error: 'Topic not found' });
  res.json({ message: 'Topic removed' });
});

router.get('/test-levels', (req, res) => {
  res.json(db.get('test_levels'));
});

// ==========================================
// STUDENT MANAGEMENT (Admin Only)
// ==========================================
router.get('/students', authenticate, requireAdmin, (req, res) => {
  const students = db.get('students');
  const courses = db.get('courses');
  const attempts = db.get('exam_attempts');

  const list = students.map((stu) => {
    const course = courses.find((c) => c.id === stu.course_id);
    const stuAttempts = attempts.filter((a) => a.student_id === stu.id);
    const completed = stuAttempts.filter((a) => a.status === 'COMPLETED').length;
    const avgScore = completed > 0
      ? Math.round(stuAttempts.filter((a) => a.status === 'COMPLETED').reduce((acc, a) => acc + (a.percentage || 0), 0) / completed)
      : 0;

    const enrolledSubs = getStudentEnrolledSubjects(stu, db);

    return {
      ...stu,
      password: '[PROTECTED]',
      course_name: course ? course.name : 'Unknown Course',
      enrolled_subjects: enrolledSubs,
      total_exams: stuAttempts.length,
      completed_exams: completed,
      avg_score: avgScore
    };
  });

  res.json(list);
});

router.post('/students', authenticate, requireAdmin, (req, res) => {
  const {
    name, father_name, email, mobile, dob, address,
    course_id, batch, password, profile_image, student_id,
    enrolled_subjects, subjects
  } = req.body;

  if (!name || !course_id) {
    return res.status(400).json({ error: 'Student Name and Course are required' });
  }

  // Generate unique Student ID if not provided
  const count = db.get('students').length + 1;
  const finalId = student_id || `APTIVOX-2026-${String(count).padStart(3, '0')}`;

  const rawPassword = password || 'aptivox@123';
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  const course = db.findById('courses', course_id);
  const defaultSubs = (course && Array.isArray(course.subjects) && course.subjects.length > 0)
    ? course.subjects
    : (COURSE_DEFAULT_SUBJECTS[course_id] || ['s1', 's2', 's3']);

  const finalEnrolledSubjects = (Array.isArray(enrolled_subjects) && enrolled_subjects.length > 0)
    ? enrolled_subjects
    : ((Array.isArray(subjects) && subjects.length > 0) ? subjects : defaultSubs);

  const newStudent = db.insert('students', {
    student_id: finalId,
    name,
    father_name: father_name || '',
    email: email || `${finalId.toLowerCase()}@aptivox.edu`,
    mobile: mobile || '',
    dob: dob || '2004-01-01',
    address: address || '',
    course_id,
    enrolled_subjects: finalEnrolledSubjects,
    batch: batch || 'Morning 9:00 AM - 11:00 AM',
    enrollment_date: new Date().toISOString().split('T')[0],
    password: hashedPassword,
    status: 'ACTIVE',
    profile_image: profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  });

  res.status(201).json({
    ...newStudent,
    password: '[PROTECTED]',
    raw_password_given: rawPassword
  });
});

router.get('/students/:id', authenticate, requireAdmin, (req, res) => {
  const student = db.findById('students', req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const course = db.findById('courses', student.course_id);
  const attempts = db.get('exam_attempts').filter((a) => a.student_id === student.id);
  const papers = db.get('exam_papers');

  const attemptsEnriched = attempts.map((att) => {
    const paper = papers.find((p) => p.id === att.exam_id);
    return {
      ...att,
      paper_title: paper ? paper.title : 'Examination Paper'
    };
  });

  res.json({
    ...student,
    password: '[PROTECTED]',
    course_name: course ? course.name : '',
    enrolled_subjects: getStudentEnrolledSubjects(student, db),
    attempts: attemptsEnriched
  });
});

router.put('/students/:id', authenticate, requireAdmin, (req, res) => {
  const updates = { ...req.body };
  if (updates.password && typeof updates.password === 'string' && updates.password.trim() !== '') {
    updates.password = bcrypt.hashSync(updates.password, 10);
  } else {
    delete updates.password;
  }
  if (updates.enrolled_subjects && !Array.isArray(updates.enrolled_subjects)) {
    delete updates.enrolled_subjects;
  }
  const updated = db.update('students', req.params.id, updates);
  if (!updated) return res.status(404).json({ error: 'Student not found' });
  res.json({ ...updated, password: '[PROTECTED]' });
});

router.delete('/students/:id', authenticate, requireAdmin, (req, res) => {
  const targetId = req.params.id;
  const list = db.get('students');
  const student = list.find((s) => s.id === targetId || s.student_id === targetId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Delete student record
  const success = db.delete('students', student.id);
  if (!success) return res.status(500).json({ error: 'Failed to delete student from database' });

  // Optionally clean up attempts
  try {
    const attempts = db.get('exam_attempts');
    const remainingAttempts = attempts.filter((a) => a.student_id !== student.id && a.student_id !== student.student_id);
    db.data.exam_attempts = remainingAttempts;
    db.save();
  } catch (cleanErr) {
    console.error('Error cleaning student attempts:', cleanErr);
  }

  res.json({ message: `Student "${student.name}" deleted successfully`, id: student.id });
});

router.post('/students/:id/reset-password', authenticate, requireAdmin, (req, res) => {
  const targetId = req.params.id;
  const list = db.get('students');
  const student = list.find((s) => s.id === targetId || s.student_id === targetId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const { new_password } = req.body;
  const passwordToSet = (new_password && typeof new_password === 'string' && new_password.trim() !== '')
    ? new_password.trim()
    : 'aptivox@123';
  const hashedPassword = bcrypt.hashSync(passwordToSet, 10);

  const updated = db.update('students', student.id, { password: hashedPassword });
  if (!updated) return res.status(500).json({ error: 'Failed to update student password' });

  res.json({
    message: `Password reset successfully for ${student.name}`,
    student_id: student.student_id,
    new_password: passwordToSet
  });
});

// ==========================================
// EXAM PAPERS & EXAM ACCESS
// ==========================================

// List exams. If called by student, enforce course-level access and calculate lock states!
router.get('/exams', authenticate, (req, res) => {
  const allPapers = db.get('exam_papers');
  const courses = db.get('courses');
  const subjects = db.get('subjects');
  const topics = db.get('topics');
  const levels = db.get('test_levels');
  const questions = db.get('questions');

  if (req.user.role === 'ADMIN') {
    const list = allPapers.map((p) => {
      const qCount = questions.filter((q) => q.paper_id === p.id).length;
      return {
        ...p,
        course_name: courses.find((c) => c.id === p.course_id)?.name || '',
        subject_name: subjects.find((s) => s.id === p.subject_id)?.name || '',
        topic_name: topics.find((t) => t.id === p.topic_id)?.name || '',
        level_name: levels.find((l) => l.id === p.level_id)?.name || '',
        actual_questions_count: qCount
      };
    });
    return res.json(list);
  }

  // Student specific exam view:
  const student = db.findById('students', req.user.id);
  if (!student) return res.status(404).json({ error: 'Student record not found' });

  const studentAttempts = db.get('exam_attempts').filter((a) => a.student_id === student.id);
  const studentSubjects = getStudentEnrolledSubjects(student, db);

  // Return all exams with locked status based on student's enrolled subjects & course
  const exams = allPapers.map((p) => {
    const belongsToCourse = Boolean(
      (p.subject_id && studentSubjects.includes(p.subject_id)) ||
      (p.course_id && p.course_id === student.course_id) ||
      (Array.isArray(p.course_ids) && p.course_ids.includes(student.course_id))
    );
    const attempt = studentAttempts.find((a) => a.exam_id === p.id);

    let status = 'AVAILABLE';
    let locked_reason = null;

    if (!belongsToCourse) {
      status = 'LOCKED';
      locked_reason = 'This test is not part of your enrolled course subjects.';
    } else if (attempt) {
      if (attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED') {
        status = 'COMPLETED';
      } else if (attempt.status === 'RE_EXAM_REQUIRED' || attempt.status === 'VIOLATED') {
        status = 'RE_EXAM_REQUIRED';
        locked_reason = 'Exam violated. Re-examination pending admin approval.';
      } else if (attempt.status === 'IN_PROGRESS') {
        status = 'IN_PROGRESS';
      }
    }

    const qCount = questions.filter((q) => q.paper_id === p.id).length;

    return {
      id: p.id,
      title: p.title,
      paper_number: p.paper_number,
      course_id: p.course_id,
      course_name: courses.find((c) => c.id === p.course_id)?.name || '',
      subject_id: p.subject_id,
      subject_name: subjects.find((s) => s.id === p.subject_id)?.name || '',
      topic_id: p.topic_id,
      topic_name: topics.find((t) => t.id === p.topic_id)?.name || '',
      level_id: p.level_id,
      level_name: levels.find((l) => l.id === p.level_id)?.name || '',
      duration_minutes: p.duration_minutes,
      total_questions: p.total_questions || qCount,
      total_marks: p.total_marks,
      passing_marks: p.passing_marks,
      negative_marking: p.negative_marking,
      status, // AVAILABLE, LOCKED, COMPLETED, RE_EXAM_REQUIRED, IN_PROGRESS
      locked_reason,
      attempt_id: attempt ? attempt.id : null,
      score: attempt ? attempt.score : null,
      percentage: attempt ? attempt.percentage : null
    };
  });

  return res.json(exams);
});

router.post('/exams', authenticate, requireAdmin, (req, res) => {
  const {
    course_id, subject_id, topic_id, level_id,
    paper_number, title, duration_minutes, total_questions,
    total_marks, passing_marks, negative_marking, randomize, status
  } = req.body;

  if (!course_id || !title) {
    return res.status(400).json({ error: 'Course and Exam Title are required' });
  }

  const newPaper = db.insert('exam_papers', {
    course_id,
    subject_id: subject_id || '',
    topic_id: topic_id || '',
    level_id: level_id || 'l1',
    paper_number: Number(paper_number) || 1,
    title,
    duration_minutes: Number(duration_minutes) || 60,
    total_questions: Number(total_questions) || 50,
    total_marks: Number(total_marks) || 100,
    passing_marks: Number(passing_marks) || 40,
    negative_marking: Number(negative_marking) || 0.5,
    randomize: randomize !== false,
    status: status || 'PUBLISHED'
  });

  res.status(201).json(newPaper);
});

router.put('/exams/:id', authenticate, requireAdmin, (req, res) => {
  const updated = db.update('exam_papers', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Exam paper not found' });
  res.json(updated);
});

router.delete('/exams/:id', authenticate, requireAdmin, (req, res) => {
  const success = db.delete('exam_papers', req.params.id);
  if (!success) return res.status(404).json({ error: 'Exam paper not found' });
  res.json({ message: 'Exam paper deleted' });
});

// ==========================================
// QUESTION BANK (Admin & Bulk Import)
// ==========================================
router.get('/questions', authenticate, requireAdmin, (req, res) => {
  const { paper_id, subject_id, topic_id } = req.query;
  let questions = db.get('questions');

  if (paper_id) questions = questions.filter((q) => q.paper_id === paper_id);
  if (subject_id) questions = questions.filter((q) => q.subject_id === subject_id);
  if (topic_id) questions = questions.filter((q) => q.topic_id === topic_id);

  res.json(questions);
});

router.post('/questions', authenticate, requireAdmin, (req, res) => {
  const {
    paper_id, course_id, subject_id, topic_id, level_id,
    question_text, option_a, option_b, option_c, option_d,
    correct_answer, marks, negative_marks, explanation, difficulty
  } = req.body;

  if (!paper_id || !question_text || !option_a || !correct_answer) {
    return res.status(400).json({ error: 'Question text, option A and correct answer are required' });
  }

  const newQ = db.insert('questions', {
    paper_id,
    course_id: course_id || '',
    subject_id: subject_id || '',
    topic_id: topic_id || '',
    level_id: level_id || 'l1',
    question_text,
    option_a,
    option_b: option_b || '',
    option_c: option_c || '',
    option_d: option_d || '',
    correct_answer: correct_answer.toUpperCase(),
    marks: Number(marks) || 2,
    negative_marks: Number(negative_marks) || 0.5,
    explanation: explanation || '',
    difficulty: difficulty || 'MEDIUM'
  });

  res.status(201).json(newQ);
});

router.put('/questions/:id', authenticate, requireAdmin, (req, res) => {
  const updated = db.update('questions', req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Question not found' });
  res.json(updated);
});

router.delete('/questions/:id', authenticate, requireAdmin, (req, res) => {
  const success = db.delete('questions', req.params.id);
  if (!success) return res.status(404).json({ error: 'Question not found' });
  res.json({ message: 'Question removed' });
});

// Bulk Import Questions from CSV/JSON
router.post('/questions/import', authenticate, requireAdmin, (req, res) => {
  const { paper_id, questions } = req.body;
  if (!paper_id || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Paper ID and array of questions required' });
  }

  const paper = db.findById('exam_papers', paper_id);
  if (!paper) return res.status(404).json({ error: 'Exam paper not found' });

  const imported = [];
  for (const item of questions) {
    if (!item.question_text || !item.correct_answer) continue;

    const record = db.insert('questions', {
      paper_id,
      course_id: paper.course_id,
      subject_id: paper.subject_id,
      topic_id: paper.topic_id,
      level_id: paper.level_id,
      question_text: item.question_text,
      option_a: item.option_a || 'Option A',
      option_b: item.option_b || 'Option B',
      option_c: item.option_c || 'Option C',
      option_d: item.option_d || 'Option D',
      correct_answer: String(item.correct_answer).trim().toUpperCase(),
      marks: Number(item.marks) || 2,
      negative_marks: Number(item.negative_marks) || 0.5,
      explanation: item.explanation || '',
      difficulty: item.difficulty || 'MEDIUM'
    });
    imported.push(record);
  }

  res.json({ message: `Successfully imported ${imported.length} questions`, count: imported.length });
});

// ==========================================
// EXAM ATTEMPT ENGINE (One-Time, Security, Timer, Camera)
// ==========================================

// Start Exam Attempt: POST /api/exams/:id/start
router.post('/exams/:id/start', authenticate, requireStudent, (req, res) => {
  const examId = req.params.id;
  const studentId = req.user.id;
  const { camera_permission } = req.body;

  const paper = db.findById('exam_papers', examId);
  if (!paper) return res.status(404).json({ error: 'Exam paper not found' });

  const student = db.findById('students', studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Enforce Course / Subject Access Restriction
  const studentSubjects = getStudentEnrolledSubjects(student, db);
  const hasAccess = Boolean(
    (paper.subject_id && studentSubjects.includes(paper.subject_id)) ||
    (paper.course_id && paper.course_id === student.course_id) ||
    (Array.isArray(paper.course_ids) && paper.course_ids.includes(student.course_id))
  );

  if (!hasAccess) {
    return res.status(403).json({ error: 'This test is not available for your enrolled course curriculum.' });
  }

  // Camera check
  if (!camera_permission) {
    return res.status(400).json({ error: 'Camera permission is required to start this examination.' });
  }

  // Check existing attempts for this student & paper
  const attempts = db.get('exam_attempts').filter(
    (a) => a.student_id === studentId && a.exam_id === examId
  );

  const completed = attempts.find((a) => a.status === 'COMPLETED' || a.status === 'SUBMITTED');
  if (completed) {
    return res.status(403).json({ error: 'Exam Already Completed. Each test can be attempted only once.' });
  }

  const violated = attempts.find((a) => a.status === 'RE_EXAM_REQUIRED' || a.status === 'VIOLATED');
  if (violated) {
    return res.status(403).json({ error: 'Exam Violated. Re-examination is pending Admin Approval.' });
  }

  // Check if there is an in-progress attempt
  let activeAttempt = attempts.find((a) => a.status === 'IN_PROGRESS');

  if (!activeAttempt) {
    activeAttempt = db.insert('exam_attempts', {
      student_id: studentId,
      exam_id: examId,
      status: 'IN_PROGRESS',
      started_at: new Date().toISOString(),
      submitted_at: null,
      time_taken_seconds: 0,
      score: 0,
      percentage: 0,
      correct_count: 0,
      wrong_count: 0,
      unanswered_count: 0,
      violation_count: 0,
      camera_status: 'ACTIVE',
      re_exam_required: false,
      ip_address: req.ip || '127.0.0.1'
    });
  }

  // Fetch Questions for this paper WITHOUT correct answers or explanations! (Security Rule #39)
  let rawQuestions = db.get('questions').filter((q) => q.paper_id === examId);

  // If paper specifies random order
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
    negative_marks: q.negative_marking
  }));

  // Fetch any previously saved answers for this attempt (if resume)
  const savedAnswers = db.get('exam_answers').filter((a) => a.attempt_id === activeAttempt.id);

  res.json({
    attempt_id: activeAttempt.id,
    started_at: activeAttempt.started_at,
    duration_minutes: paper.duration_minutes,
    total_questions: sanitizedQuestions.length,
    paper: {
      id: paper.id,
      title: paper.title,
      total_marks: paper.total_marks,
      passing_marks: paper.passing_marks,
      negative_marking: paper.negative_marking
    },
    questions: sanitizedQuestions,
    saved_answers: savedAnswers
  });
});

// Save Answer in Real Time: POST /api/exams/:id/save-answer
router.post('/exams/:id/save-answer', authenticate, requireStudent, (req, res) => {
  const { attempt_id, question_id, selected_option, is_marked_for_review } = req.body;
  if (!attempt_id || !question_id) {
    return res.status(400).json({ error: 'Attempt ID and Question ID required' });
  }

  const attempt = db.findById('exam_attempts', attempt_id);
  if (!attempt || attempt.student_id !== req.user.id || attempt.status !== 'IN_PROGRESS') {
    return res.status(403).json({ error: 'Invalid or closed exam attempt' });
  }

  // Check if answer already exists
  const allAnswers = db.get('exam_answers');
  const existing = allAnswers.find((a) => a.attempt_id === attempt_id && a.question_id === question_id);

  if (existing) {
    db.update('exam_answers', existing.id, {
      selected_option,
      is_marked_for_review: Boolean(is_marked_for_review),
      answered_at: new Date().toISOString()
    });
  } else {
    db.insert('exam_answers', {
      attempt_id,
      question_id,
      selected_option,
      is_marked_for_review: Boolean(is_marked_for_review),
      answered_at: new Date().toISOString()
    });
  }

  res.json({ success: true });
});

// Record Exam Violation: POST /api/exams/:id/violation
router.post('/exams/:id/violation', authenticate, requireStudent, (req, res) => {
  const { attempt_id, violation_type, details } = req.body;
  const attempt = db.findById('exam_attempts', attempt_id);

  if (!attempt || attempt.student_id !== req.user.id) {
    return res.status(404).json({ error: 'Attempt not found' });
  }

  const currentViolations = (attempt.violation_count || 0) + 1;

  db.insert('exam_violations', {
    attempt_id,
    student_id: req.user.id,
    exam_id: req.params.id,
    violation_type: violation_type || 'EXIT_ATTEMPT_DETECTED',
    details: details || 'Student attempted to leave examination window',
    timestamp: new Date().toISOString()
  });

  const shouldInvalidate = currentViolations >= 3 || violation_type === 'BROWSER_BACK_LEAVE';

  db.update('exam_attempts', attempt.id, {
    violation_count: currentViolations,
    status: shouldInvalidate ? 'RE_EXAM_REQUIRED' : attempt.status,
    re_exam_required: shouldInvalidate
  });

  // Admin Notification
  db.insert('notifications', {
    recipient_type: 'ADMIN',
    title: 'Exam Violation Detected',
    message: `Student ${req.user.name} (${req.user.student_id}) triggered violation: ${violation_type}. Total: ${currentViolations}`,
    read: false
  });

  res.json({
    violation_count: currentViolations,
    status: shouldInvalidate ? 'RE_EXAM_REQUIRED' : attempt.status,
    re_exam_required: shouldInvalidate,
    warning: shouldInvalidate ? 'Exam locked due to integrity violation. Contact admin for re-exam.' : `Warning ${currentViolations}/3: Do not leave the exam window.`
  });
});

// Submit Exam: POST /api/exams/:id/submit
router.post('/exams/:id/submit', authenticate, requireStudent, (req, res) => {
  const { attempt_id, time_taken_seconds } = req.body;
  const attempt = db.findById('exam_attempts', attempt_id);

  if (!attempt || attempt.student_id !== req.user.id) {
    return res.status(404).json({ error: 'Attempt not found' });
  }

  if (attempt.status === 'COMPLETED' || attempt.status === 'SUBMITTED') {
    return res.status(400).json({ error: 'This exam has already been submitted.' });
  }

  const paper = db.findById('exam_papers', attempt.exam_id);
  const questions = db.get('questions').filter((q) => q.paper_id === paper.id);
  const answers = db.get('exam_answers').filter((a) => a.attempt_id === attempt.id);

  // Server-Side Score Calculation
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let totalScore = 0;

  for (const q of questions) {
    const studentAns = answers.find((a) => a.question_id === q.id);
    if (!studentAns || !studentAns.selected_option) {
      unansweredCount++;
    } else if (studentAns.selected_option.toUpperCase() === q.correct_answer.toUpperCase()) {
      correctCount++;
      totalScore += (q.marks || 2);
    } else {
      wrongCount++;
      totalScore -= (q.negative_marks || paper.negative_marking || 0);
    }
  }

  totalScore = Math.max(0, Math.round(totalScore * 10) / 10);
  const maxPossibleMarks = questions.reduce((acc, q) => acc + (q.marks || 2), 0) || 100;
  const percentage = Math.round((totalScore / maxPossibleMarks) * 100);
  const passed = percentage >= (paper.passing_marks || 40);

  const updatedAttempt = db.update('exam_attempts', attempt.id, {
    status: 'COMPLETED',
    submitted_at: new Date().toISOString(),
    time_taken_seconds: time_taken_seconds || 3600,
    score: totalScore,
    total_marks: maxPossibleMarks,
    percentage,
    passed,
    correct_count: correctCount,
    wrong_count: wrongCount,
    unanswered_count: unansweredCount
  });

  // Admin Notification
  db.insert('notifications', {
    recipient_type: 'ADMIN',
    title: 'Exam Submitted',
    message: `${req.user.name} submitted ${paper.title} - Score: ${totalScore}/${maxPossibleMarks} (${percentage}%) - ${passed ? 'PASSED' : 'FAILED'}`,
    read: false
  });

  res.json({
    message: 'Examination submitted successfully!',
    attempt: updatedAttempt,
    result: {
      exam_title: paper.title,
      score: totalScore,
      max_marks: maxPossibleMarks,
      percentage,
      passed,
      correct: correctCount,
      wrong: wrongCount,
      unanswered: unansweredCount
    }
  });
});

// ==========================================
// RESULTS & ATTEMPTS
// ==========================================

// Student Results: GET /api/student/results
router.get('/student/results', authenticate, requireStudent, (req, res) => {
  const attempts = db.get('exam_attempts').filter(
    (a) => a.student_id === req.user.id && (a.status === 'COMPLETED' || a.status === 'SUBMITTED')
  );
  const papers = db.get('exam_papers');
  const courses = db.get('courses');
  const subjects = db.get('subjects');
  const topics = db.get('topics');
  const levels = db.get('test_levels');

  const results = attempts.map((att) => {
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
      unanswered_count: att.unanswered_count
    };
  });

  res.json(results);
});

// Detailed Single Result Card / Certificate: GET /api/student/results/:attemptId
router.get('/student/results/:attemptId', authenticate, (req, res) => {
  const attempt = db.findById('exam_attempts', req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'Result record not found' });

  // Student can only see their own result unless admin
  if (req.user.role === 'STUDENT' && attempt.student_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const student = db.findById('students', attempt.student_id);
  const paper = db.findById('exam_papers', attempt.exam_id);
  const course = db.findById('courses', student?.course_id);
  const subject = db.findById('subjects', paper?.subject_id);
  const topic = db.findById('topics', paper?.topic_id);
  const settings = db.get('settings');

  res.json({
    attempt,
    student: {
      name: student?.name,
      student_id: student?.student_id,
      father_name: student?.father_name,
      course_name: course?.name,
      profile_image: student?.profile_image,
      batch: student?.batch
    },
    paper: {
      title: paper?.title,
      paper_number: paper?.paper_number,
      subject_name: subject?.name,
      topic_name: topic?.name,
      total_marks: paper?.total_marks,
      passing_marks: paper?.passing_marks
    },
    institute: settings
  });
});

// Admin Results View: GET /api/admin/results
router.get('/admin/results', authenticate, requireAdmin, (req, res) => {
  const attempts = db.get('exam_attempts');
  const students = db.get('students');
  const papers = db.get('exam_papers');
  const courses = db.get('courses');

  const list = attempts.map((att) => {
    const student = students.find((s) => s.id === att.student_id) || {};
    const paper = papers.find((p) => p.id === att.exam_id) || {};
    const course = courses.find((c) => c.id === student.course_id) || {};

    return {
      id: att.id,
      student_id: student.student_id || 'N/A',
      student_name: student.name || 'Unknown',
      course_name: course.name || 'N/A',
      paper_title: paper.title || 'Exam',
      score: att.score,
      total_marks: att.total_marks || 100,
      percentage: att.percentage,
      status: att.status,
      violation_count: att.violation_count || 0,
      camera_status: att.camera_status || 'N/A',
      submitted_at: att.submitted_at || att.started_at
    };
  });

  res.json(list);
});

// Admin Live Exam Monitor: GET /api/admin/live-monitor
router.get('/admin/live-monitor', authenticate, requireAdmin, (req, res) => {
  const activeAttempts = db.get('exam_attempts').filter((a) => a.status === 'IN_PROGRESS');
  const students = db.get('students');
  const papers = db.get('exam_papers');
  const courses = db.get('courses');

  const live = activeAttempts.map((att) => {
    const student = students.find((s) => s.id === att.student_id);
    const paper = papers.find((p) => p.id === att.exam_id);
    const course = courses.find((c) => c.id === student?.course_id);

    return {
      attempt_id: att.id,
      student_id: student?.student_id,
      student_name: student?.name,
      course_name: course?.name,
      paper_title: paper?.title,
      started_at: att.started_at,
      camera_status: att.camera_status,
      violation_count: att.violation_count || 0,
      ip_address: att.ip_address
    };
  });

  res.json(live);
});

// ==========================================
// RE-EXAM SYSTEM
// ==========================================
router.get('/admin/re-exams', authenticate, requireAdmin, (req, res) => {
  const attempts = db.get('exam_attempts').filter(
    (a) => a.status === 'RE_EXAM_REQUIRED' || a.status === 'VIOLATED'
  );
  const students = db.get('students');
  const papers = db.get('exam_papers');
  const courses = db.get('courses');
  const violations = db.get('exam_violations');

  const list = attempts.map((att) => {
    const student = students.find((s) => s.id === att.student_id) || {};
    const paper = papers.find((p) => p.id === att.exam_id) || {};
    const course = courses.find((c) => c.id === student.course_id) || {};
    const stuViolations = violations.filter((v) => v.attempt_id === att.id);

    return {
      attempt_id: att.id,
      student_id: student.student_id,
      student_name: student.name,
      course_name: course.name,
      paper_title: paper.title,
      violation_count: att.violation_count || 1,
      last_violation: stuViolations[stuViolations.length - 1]?.details || 'Exited examination window unexpectedly',
      status: att.status,
      timestamp: att.started_at
    };
  });

  res.json(list);
});

router.post('/admin/re-exams/:attemptId/approve', authenticate, requireAdmin, (req, res) => {
  const attempt = db.findById('exam_attempts', req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  // Delete previous attempt or reset so student can re-attempt cleanly
  db.delete('exam_attempts', attempt.id);

  // Notify student
  db.insert('notifications', {
    recipient_type: 'STUDENT',
    student_id: attempt.student_id,
    title: 'Re-Exam Approved',
    message: 'Admin has approved your re-examination request. You can now start your exam afresh.',
    read: false
  });

  res.json({ message: 'Re-exam approved. Student can now re-attempt the exam.' });
});

router.post('/admin/re-exams/:attemptId/reject', authenticate, requireAdmin, (req, res) => {
  const attempt = db.findById('exam_attempts', req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

  db.update('exam_attempts', attempt.id, { status: 'VIOLATED' });
  res.json({ message: 'Re-exam request rejected.' });
});

// ==========================================
// STUDY NOTES MANAGEMENT
// ==========================================
router.get('/notes', authenticate, (req, res) => {
  const allNotes = db.get('notes');
  const courses = db.get('courses');
  const subjects = db.get('subjects');
  const topics = db.get('topics');

  if (req.user.role === 'ADMIN') {
    const list = allNotes.map((n) => ({
      ...n,
      course_name: courses.find((c) => c.id === n.course_id)?.name || '',
      subject_name: subjects.find((s) => s.id === n.subject_id)?.name || '',
      topic_name: topics.find((t) => t.id === n.topic_id)?.name || ''
    }));
    return res.json(list);
  }

  // Student only sees notes for their enrolled course & subjects!
  const student = db.findById('students', req.user.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const studentSubjects = getStudentEnrolledSubjects(student, db);

  const studentNotes = allNotes
    .filter((n) => {
      if (n.status !== 'ACTIVE') return false;
      if (n.subject_id && studentSubjects.includes(n.subject_id)) return true;
      if (n.course_id && n.course_id === student.course_id) return true;
      if (Array.isArray(n.course_ids) && n.course_ids.includes(student.course_id)) return true;
      return false;
    })
    .map((n) => ({
      ...n,
      course_name: courses.find((c) => c.id === n.course_id)?.name || '',
      subject_name: subjects.find((s) => s.id === n.subject_id)?.name || '',
      topic_name: topics.find((t) => t.id === n.topic_id)?.name || ''
    }));

  res.json(studentNotes);
});

router.post('/notes', authenticate, requireAdmin, (req, res) => {
  const { title, course_id, subject_id, topic_id, description, pdf_url, cover_image } = req.body;
  if (!title || !course_id) {
    return res.status(400).json({ error: 'Title and Course are required' });
  }

  const newNote = db.insert('notes', {
    title,
    course_id,
    subject_id: subject_id || '',
    topic_id: topic_id || '',
    description: description || '',
    pdf_url: pdf_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: cover_image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 0,
    uploaded_at: new Date().toISOString().split('T')[0]
  });

  res.status(201).json(newNote);
});

router.delete('/notes/:id', authenticate, requireAdmin, (req, res) => {
  const success = db.delete('notes', req.params.id);
  if (!success) return res.status(404).json({ error: 'Note not found' });
  res.json({ message: 'Note deleted' });
});

router.post('/notes/:id/download', authenticate, (req, res) => {
  const note = db.findById('notes', req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  db.update('notes', note.id, { download_count: (note.download_count || 0) + 1 });
  res.json({ url: note.pdf_url, download_count: (note.download_count || 0) + 1 });
});

// ==========================================
// ADMIN DASHBOARD & ANALYTICS
// ==========================================
router.get('/admin/dashboard-stats', authenticate, requireAdmin, (req, res) => {
  const students = db.get('students');
  const courses = db.get('courses');
  const exams = db.get('exam_papers');
  const attempts = db.get('exam_attempts');
  const questions = db.get('questions');
  const notes = db.get('notes');

  const completed = attempts.filter((a) => a.status === 'COMPLETED');
  const reExams = attempts.filter((a) => a.status === 'RE_EXAM_REQUIRED' || a.status === 'VIOLATED');
  const liveActive = attempts.filter((a) => a.status === 'IN_PROGRESS');

  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((acc, a) => acc + (a.percentage || 0), 0) / completed.length)
    : 0;

  // Course distribution
  const courseStats = courses.map((c) => ({
    name: c.name,
    students: students.filter((s) => s.course_id === c.id).length,
    exams: exams.filter((e) => e.course_id === c.id).length
  }));

  res.json({
    total_students: students.length,
    active_students: students.filter((s) => s.status === 'ACTIVE').length,
    total_courses: courses.length,
    total_exams: exams.length,
    total_questions: questions.length,
    completed_exams: completed.length,
    re_exam_count: reExams.length,
    live_active_count: liveActive.length,
    average_score: avgScore,
    total_notes: notes.length,
    course_stats: courseStats
  });
});

// Notifications
router.get('/notifications', authenticate, (req, res) => {
  const notifs = db.get('notifications');
  if (req.user.role === 'ADMIN') {
    return res.json(notifs.filter((n) => n.recipient_type === 'ADMIN'));
  } else {
    return res.json(notifs.filter((n) => n.recipient_type === 'STUDENT' && n.student_id === req.user.id));
  }
});

export default router;
