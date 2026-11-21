// APTIVOX EDUCATION & TECHNOLOGY - Comprehensive Course Curriculum & Exam System
// Real mapping for all courses & subjects as specified by institute administration

export const COURSE_DEFAULT_SUBJECTS = {
  c1: ['s1', 's2', 's3'], // Web Designer: HTML, CSS, JavaScript
  c2: ['s1', 's2', 's3', 's6', 's_django', 's_mysql'], // Web Development: HTML, CSS, JS (advance), Python, Django, MySQL
  c3: ['s6', 's_django'], // Python: Python, Django
  c4: ['s1', 's2', 's3', 's6', 's_django', 's_mysql'], // Full Stack Developer: HTML, CSS, JS, Python, Django, MySQL
  c5: ['s1', 's2', 's3', 's4', 's5', 's_mongo', 's_mysql', 's_api'], // MERN Stack: HTML, CSS, JS, React, Node/Express, Mongo, MySQL, API
  c6: ['s_word', 's_ppt', 's_excel', 's_adv_excel', 's_tally'], // CAP: MS Word, PowerPoint, Excel, Advance Excel, Tally/GST
  c7: ['s_word', 's_ppt', 's_excel', 's_paint', 's8'], // RS-CIT: MS Word, PowerPoint, Excel, MS Paint, Basic Knowledge Computer
  c8: ['s_photoshop', 's_canva', 's_coreldraw', 's_video_edit'], // Graphic Designer: Photoshop, Canva, CorelDraw, Video Editing
  c9: ['s1', 's_seo'], // Digital Marketing: HTML (DM part), SEO
  c10: ['s_video_edit', 's_premiere', 's_after_effects'], // Video Editing: Video Editing, Premiere Pro, After Effects
  c11: ['s_excel', 's_adv_excel'], // Excel: Excel, Advance Excel
  c12: ['s_tally'] // Tally IT: Tally / GST
};

export const ALL_SUBJECTS = [
  // Web & Full Stack & MERN Subjects
  { id: 's1', name: 'HTML', category: 'Web Development', description: 'Semantic HTML5, forms, inputs, elements & accessibility.', status: 'ACTIVE' },
  { id: 's2', name: 'CSS', category: 'Web Development', description: 'CSS3 styling, Flexbox, CSS Grid, animations and responsive design.', status: 'ACTIVE' },
  { id: 's3', name: 'JavaScript', category: 'Web Development', description: 'Modern ES6+, DOM manipulation, functions, async/await and events.', status: 'ACTIVE' },
  { id: 's4', name: 'React.js', category: 'Frontend Development', description: 'Components, hooks, state, router, and performance optimization.', status: 'ACTIVE' },
  { id: 's5', name: 'Node.js & Express.js', category: 'Backend Development', description: 'Backend servers, REST architecture, middleware & routing.', status: 'ACTIVE' },
  { id: 's_mongo', name: 'MongoDB', category: 'Database', description: 'NoSQL collections, document CRUD, aggregation & Mongoose ODM.', status: 'ACTIVE' },
  { id: 's_mysql', name: 'MySQL', category: 'Database', description: 'Relational database design, SQL queries, joins & indexing.', status: 'ACTIVE' },
  { id: 's_api', name: 'API Integration', category: 'Backend Development', description: 'REST APIs, Postman, endpoints, Axios and JWT token handling.', status: 'ACTIVE' },
  { id: 's6', name: 'Python', category: 'Programming', description: 'Core Python syntax, loops, data structures, and OOPs concepts.', status: 'ACTIVE' },
  { id: 's_django', name: 'Django', category: 'Backend Development', description: 'Python Django MVT architecture, models, views & template engine.', status: 'ACTIVE' },

  // Office, Accounting & RS-CIT Subjects
  { id: 's_word', name: 'MS Word', category: 'Office Tools', description: 'Document drafting, tables, formatting, page layout & Mail Merge.', status: 'ACTIVE' },
  { id: 's_ppt', name: 'PowerPoint', category: 'Office Tools', description: 'Slide design, smart art, animation effects & presentations.', status: 'ACTIVE' },
  { id: 's_excel', name: 'Excel', category: 'Office Tools', description: 'Spreadsheets, formulas, calculations, sorting & charts.', status: 'ACTIVE' },
  { id: 's_adv_excel', name: 'Advance Excel', category: 'Data Analysis', description: 'VLOOKUP, XLOOKUP, Pivot Tables, Macros & business dashboards.', status: 'ACTIVE' },
  { id: 's_tally', name: 'Tally / GST', category: 'Accounting', description: 'Tally Prime, accounting vouchers, GST invoicing, balance sheets.', status: 'ACTIVE' },
  { id: 's_paint', name: 'MS Paint', category: 'Basic Computing', description: 'Drawing canvas, color palettes, shapes, resizing and image cropping.', status: 'ACTIVE' },
  { id: 's8', name: 'Basic Knowledge of Computer', category: 'Basic Computing', description: 'Computer hardware, CPU, RAM, Windows OS, internet & cyber safety.', status: 'ACTIVE' },

  // Digital Marketing Subjects
  { id: 's_seo', name: 'SEO & Digital Marketing', category: 'Marketing', description: 'Search engine optimization, Google Ads, Meta Ads & analytics.', status: 'ACTIVE' },

  // Graphic Design & Video Editing Subjects
  { id: 's_photoshop', name: 'Photoshop', category: 'Design', description: 'Photo editing, layers, masking, retouching and banners.', status: 'ACTIVE' },
  { id: 's_canva', name: 'Canva', category: 'Design', description: 'Social media creatives, posters, thumbnails and branding.', status: 'ACTIVE' },
  { id: 's_coreldraw', name: 'CorelDraw', category: 'Design', description: 'Vector graphics, flex design, logo creation and printing layouts.', status: 'ACTIVE' },
  { id: 's_video_edit', name: 'Video Editing', category: 'Media', description: 'Video cutting, transitions, background music, captions and reels.', status: 'ACTIVE' },
  { id: 's_premiere', name: 'Adobe Premiere Pro', category: 'Media', description: 'Timeline editing, multi-cam, color correction & 4K exporting.', status: 'ACTIVE' },
  { id: 's_after_effects', name: 'After Effects', category: 'Media', description: 'Motion graphics, visual effects, keyframe animation & titles.', status: 'ACTIVE' }
];

export const ALL_TOPICS = [
  // HTML Topics
  { id: 't1', subject_id: 's1', name: 'HTML Basics & Semantic Tags', description: 'Tags, attributes, headings, paragraphs, lists and doctype.' },
  { id: 't2', subject_id: 's1', name: 'HTML Forms & Media Elements', description: 'Form validation, inputs, audio, video and iframes.' },
  // CSS Topics
  { id: 't3', subject_id: 's2', name: 'CSS Selectors & Box Model', description: 'Padding, margin, borders, display and positioning.' },
  { id: 't4', subject_id: 's2', name: 'Flexbox, Grid & Responsive Design', description: 'Layout rules, media queries and mobile responsive design.' },
  // JS Topics
  { id: 't5', subject_id: 's3', name: 'JS Functions, ES6+ & Scope', description: 'Arrow functions, closures, promises and async/await.' },
  { id: 't6', subject_id: 's3', name: 'DOM Manipulation & Events', description: 'Event listeners, querySelector, event bubbling and delegation.' },
  // React Topics
  { id: 't10', subject_id: 's4', name: 'React Components & Hooks', description: 'useState, useEffect, custom hooks and JSX syntax.' },
  // Node / Express Topics
  { id: 't12', subject_id: 's5', name: 'Express Server & REST APIs', description: 'Middleware, routing, request/response and controllers.' },
  // MongoDB Topics
  { id: 't14', subject_id: 's_mongo', name: 'MongoDB Collections & Mongoose', description: 'BSON documents, schema validation and CRUD queries.' },
  // MySQL Topics
  { id: 't16', subject_id: 's_mysql', name: 'SQL Queries, Joins & Tables', description: 'SELECT, INSERT, UPDATE, INNER JOIN and Primary Keys.' },
  // API Integration Topics
  { id: 't18', subject_id: 's_api', name: 'REST Endpoints & Authentication', description: 'HTTP verbs, Postman, headers, JWT tokens and Axios.' },
  // Python Topics
  { id: 't7', subject_id: 's6', name: 'Python Syntax & Data Structures', description: 'Lists, tuples, dictionaries, loops and functions.' },
  // Django Topics
  { id: 't21', subject_id: 's_django', name: 'Django MVT Architecture & ORM', description: 'Models, views, URL routing and SQLite/PostgreSQL ORM.' },
  // MS Word Topics
  { id: 't23', subject_id: 's_word', name: 'Word Formatting & Mail Merge', description: 'Text formatting, tables, headers/footers and mail merge.' },
  // PowerPoint Topics
  { id: 't25', subject_id: 's_ppt', name: 'Slide Creation & Transitions', description: 'Slide layouts, design templates, animations and slide show.' },
  // Excel Topics
  { id: 't9', subject_id: 's_excel', name: 'Excel Basics & Common Formulas', description: 'SUM, AVERAGE, IF, COUNTIF, sorting and charts.' },
  // Advance Excel Topics
  { id: 't28', subject_id: 's_adv_excel', name: 'VLOOKUP, XLOOKUP & Pivot Tables', description: 'Lookup formulas, pivot tables, data slicing and dashboards.' },
  // Tally Topics
  { id: 't30', subject_id: 's_tally', name: 'Tally Prime Vouchers & GST Returns', description: 'Payment, receipt, sales vouchers, CGST, SGST & balance sheet.' },
  // MS Paint Topics
  { id: 't32', subject_id: 's_paint', name: 'Paint Drawing & Canvas Tools', description: 'Brush tools, shapes, color picker, crop and resize.' },
  // Basic Computer Topics
  { id: 't8', subject_id: 's8', name: 'Computer Hardware, OS & Cyber Safety', description: 'CPU, RAM, storage, Windows shortcuts and online safety.' },
  // SEO Topics
  { id: 't34', subject_id: 's_seo', name: 'SEO Fundamentals & Google Ranking', description: 'Keywords, on-page optimization, backlinks and analytics.' },
  // Photoshop Topics
  { id: 't36', subject_id: 's_photoshop', name: 'Photoshop Layers, Masking & Retouching', description: 'Selection tools, layer styles, clone stamp and color balance.' },
  // Canva Topics
  { id: 't38', subject_id: 's_canva', name: 'Canva Social Media Creatives', description: 'Template customization, typography, brand assets and reels design.' },
  // CorelDraw Topics
  { id: 't39', subject_id: 's_coreldraw', name: 'CorelDraw Vector Graphics & Flex Design', description: 'Pen tool, bezier curves, logo tracing and flex printing.' },
  // Video Editing Topics
  { id: 't40', subject_id: 's_video_edit', name: 'Video Trimming, B-Roll & Audio Sync', description: 'Rough cut, transitions, audio levelling and pacing.' },
  // Premiere Pro Topics
  { id: 't41', subject_id: 's_premiere', name: 'Premiere Pro Timeline & Color Grading', description: 'Sequence settings, Lumetri Color, keyframing and export.' },
  // After Effects Topics
  { id: 't42', subject_id: 's_after_effects', name: 'After Effects Keyframing & Motion Graphics', description: 'Kinetic typography, shape animations and lower thirds.' }
];

// Helper to determine if an exam paper is accessible for a student
export function canStudentTakeExam(student, paper, subjects = ALL_SUBJECTS) {
  if (!student || !paper) return false;
  const enrolledSubjectIds = getStudentEnrolledSubjects(student);

  // 1. Direct match on enrolled subjects
  if (paper.subject_id && enrolledSubjectIds.includes(paper.subject_id)) {
    return true;
  }

  // 2. Direct course match
  if (paper.course_id === student.course_id) {
    return true;
  }

  // 3. Multi-course array match
  if (Array.isArray(paper.course_ids) && paper.course_ids.includes(student.course_id)) {
    return true;
  }

  return false;
}

// Helper to determine if study notes are accessible for a student
export function canStudentAccessNote(student, note, subjects = ALL_SUBJECTS) {
  if (!student || !note) return false;
  const enrolledSubjectIds = getStudentEnrolledSubjects(student);

  if (note.subject_id && enrolledSubjectIds.includes(note.subject_id)) {
    return true;
  }

  if (note.course_id === student.course_id) {
    return true;
  }

  if (Array.isArray(note.course_ids) && note.course_ids.includes(student.course_id)) {
    return true;
  }

  return false;
}

// Helper to get effective enrolled subjects array for a student
export function getStudentEnrolledSubjects(student, db = null) {
  if (Array.isArray(student?.enrolled_subjects) && student.enrolled_subjects.length > 0) {
    return student.enrolled_subjects;
  }
  if (db && student?.course_id) {
    try {
      const course = db.findById ? db.findById('courses', student.course_id) : null;
      if (course && Array.isArray(course.subjects) && course.subjects.length > 0) {
        return course.subjects;
      }
    } catch {
      // fallback
    }
  }
  return COURSE_DEFAULT_SUBJECTS[student?.course_id] || ['s1', 's2', 's3'];
}

export const ALL_PAPERS = [
  // HTML Papers
  {
    id: 'p1',
    subject_id: 's1',
    topic_id: 't1',
    level_id: 'l1',
    paper_number: 1,
    title: 'HTML Basics - Paper 1 (Foundations & Elements)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  {
    id: 'p2',
    subject_id: 's1',
    topic_id: 't1',
    level_id: 'l1',
    paper_number: 2,
    title: 'HTML Basics - Paper 2 (Semantic Tags & Structure)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // CSS Paper
  {
    id: 'p3',
    subject_id: 's2',
    topic_id: 't3',
    level_id: 'l2',
    paper_number: 1,
    title: 'CSS Styling - Paper 1 (Box Model & Selectors)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // JavaScript Paper
  {
    id: 'p4',
    subject_id: 's3',
    topic_id: 't5',
    level_id: 'l3',
    paper_number: 1,
    title: 'JavaScript Master - Paper 1 (ES6, Scope & Closures)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // React.js Paper
  {
    id: 'p_react',
    subject_id: 's4',
    topic_id: 't10',
    level_id: 'l2',
    paper_number: 1,
    title: 'React.js Foundations - Paper 1 (Hooks, Components & State)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Node.js & Express Paper
  {
    id: 'p_node',
    subject_id: 's5',
    topic_id: 't12',
    level_id: 'l2',
    paper_number: 1,
    title: 'Node.js & Express - Paper 1 (REST APIs & Middleware)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // MongoDB Paper
  {
    id: 'p_mongo',
    subject_id: 's_mongo',
    topic_id: 't14',
    level_id: 'l2',
    paper_number: 1,
    title: 'MongoDB Database - Paper 1 (Collections, BSON & Queries)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // MySQL Paper
  {
    id: 'p_mysql',
    subject_id: 's_mysql',
    topic_id: 't16',
    level_id: 'l2',
    paper_number: 1,
    title: 'MySQL Relational Database - Paper 1 (SQL Queries & Joins)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // API Integration Paper
  {
    id: 'p_api',
    subject_id: 's_api',
    topic_id: 't18',
    level_id: 'l2',
    paper_number: 1,
    title: 'API Integration - Paper 1 (REST Endpoints & JWT Auth)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Python Paper
  {
    id: 'p5',
    subject_id: 's6',
    topic_id: 't7',
    level_id: 'l1',
    paper_number: 1,
    title: 'Python Core - Paper 1 (Variables & Control Flow)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Django Paper
  {
    id: 'p_django',
    subject_id: 's_django',
    topic_id: 't21',
    level_id: 'l2',
    paper_number: 1,
    title: 'Django Web Framework - Paper 1 (MVT, Models & Routing)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // MS Word Paper
  {
    id: 'p_word',
    subject_id: 's_word',
    topic_id: 't23',
    level_id: 'l1',
    paper_number: 1,
    title: 'MS Word Specialist - Paper 1 (Formatting & Mail Merge)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // PowerPoint Paper
  {
    id: 'p_ppt',
    subject_id: 's_ppt',
    topic_id: 't25',
    level_id: 'l1',
    paper_number: 1,
    title: 'PowerPoint Pro - Paper 1 (Slide Design & Presentations)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Excel Paper
  {
    id: 'p7',
    subject_id: 's_excel',
    topic_id: 't9',
    level_id: 'l2',
    paper_number: 1,
    title: 'Excel Expert - Paper 1 (Formulas, Calculations & Charts)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Advance Excel Paper
  {
    id: 'p_adv_excel',
    subject_id: 's_adv_excel',
    topic_id: 't28',
    level_id: 'l3',
    paper_number: 1,
    title: 'Advance Excel - Paper 1 (VLOOKUP, XLOOKUP & Pivot Tables)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Tally & GST Paper
  {
    id: 'p_tally',
    subject_id: 's_tally',
    topic_id: 't30',
    level_id: 'l2',
    paper_number: 1,
    title: 'Tally Prime & GST - Paper 1 (Vouchers & Invoicing)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // MS Paint Paper
  {
    id: 'p_paint',
    subject_id: 's_paint',
    topic_id: 't32',
    level_id: 'l1',
    paper_number: 1,
    title: 'MS Paint Specialist - Paper 1 (Drawing & Image Tools)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.0,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Basic Computer / RS-CIT Paper
  {
    id: 'p6',
    subject_id: 's8',
    topic_id: 't8',
    level_id: 'l1',
    paper_number: 1,
    title: 'RS-CIT Computer Knowledge - Paper 1 (Hardware & Windows OS)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.0,
    randomize: true,
    status: 'PUBLISHED'
  },
  // SEO Paper
  {
    id: 'p_seo',
    subject_id: 's_seo',
    topic_id: 't34',
    level_id: 'l2',
    paper_number: 1,
    title: 'Digital Marketing - Paper 1 (SEO, Keywords & Ranking)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Photoshop Paper
  {
    id: 'p_photoshop',
    subject_id: 's_photoshop',
    topic_id: 't36',
    level_id: 'l2',
    paper_number: 1,
    title: 'Adobe Photoshop - Paper 1 (Layers, Tools & Retouching)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Canva Paper
  {
    id: 'p_canva',
    subject_id: 's_canva',
    topic_id: 't38',
    level_id: 'l1',
    paper_number: 1,
    title: 'Canva Design - Paper 1 (Social Media Posters & Creatives)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // CorelDraw Paper
  {
    id: 'p_coreldraw',
    subject_id: 's_coreldraw',
    topic_id: 't39',
    level_id: 'l2',
    paper_number: 1,
    title: 'CorelDraw Master - Paper 1 (Vector Shapes & Flex Design)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Video Editing Paper
  {
    id: 'p_video',
    subject_id: 's_video_edit',
    topic_id: 't40',
    level_id: 'l2',
    paper_number: 1,
    title: 'Video Editing Pro - Paper 1 (Trimming, B-Roll & Transitions)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // Premiere Pro Paper
  {
    id: 'p_premiere',
    subject_id: 's_premiere',
    topic_id: 't41',
    level_id: 'l3',
    paper_number: 1,
    title: 'Premiere Pro - Paper 1 (Timeline Sequences & Color Grading)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  },
  // After Effects Paper
  {
    id: 'p_after_effects',
    subject_id: 's_after_effects',
    topic_id: 't42',
    level_id: 'l3',
    paper_number: 1,
    title: 'After Effects - Paper 1 (Motion Graphics & Keyframing)',
    duration_minutes: 60,
    total_questions: 50,
    total_marks: 100,
    passing_marks: 40,
    negative_marking: 0.5,
    randomize: true,
    status: 'PUBLISHED'
  }
];

export const ALL_NOTES = [
  {
    id: 'n1',
    subject_id: 's1',
    topic_id: 't1',
    title: 'HTML5 Complete Handwritten Master Notes',
    description: 'Comprehensive guide to HTML5 semantic tags, DOM structure, inputs, audio/video elements and SEO optimization.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 142,
    uploaded_at: '2026-02-05'
  },
  {
    id: 'n2',
    subject_id: 's2',
    topic_id: 't3',
    title: 'CSS3 Flexbox & Grid Practical Cheat Sheet',
    description: 'Visual reference guide with diagrams for CSS Grid, Flex container properties, alignment tricks and media queries.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 98,
    uploaded_at: '2026-02-12'
  },
  {
    id: 'n3',
    subject_id: 's3',
    topic_id: 't5',
    title: 'JavaScript ES6+ Functions, Promises & Async/Await',
    description: 'Deep dive into closures, higher-order functions, event loops, call/apply/bind, fetch API and error handling.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 215,
    uploaded_at: '2026-02-18'
  },
  {
    id: 'n_react',
    subject_id: 's4',
    topic_id: 't10',
    title: 'React.js Modern Hooks & Architecture Guide',
    description: 'Complete notes on JSX, custom hooks, context API, Redux toolkit and performance optimization in React.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 165,
    uploaded_at: '2026-02-20'
  },
  {
    id: 'n_node',
    subject_id: 's5',
    topic_id: 't12',
    title: 'Node.js, Express & REST API Architecture Handbook',
    description: 'Server creation, middleware pipelines, error handlers, MVC patterns and production deployment secrets.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 140,
    uploaded_at: '2026-02-21'
  },
  {
    id: 'n_python',
    subject_id: 's6',
    topic_id: 't7',
    title: 'Python Core & Data Structures Quick Reference',
    description: 'Variables, data types, list comprehensions, slicing, loops, generators and top 50 technical interview questions.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 180,
    uploaded_at: '2026-02-22'
  },
  {
    id: 'n_word',
    subject_id: 's_word',
    topic_id: 't23',
    title: 'MS Word Office Mastery & Mail Merge Handbook',
    description: 'Professional document preparation, official letters, formatting tables, headers/footers and mail merge.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 210,
    uploaded_at: '2026-02-24'
  },
  {
    id: 'n_excel',
    subject_id: 's_adv_excel',
    topic_id: 't28',
    title: 'Advance Excel Formulas & Business Dashboards Guide',
    description: 'Master VLOOKUP, XLOOKUP, INDEX MATCH, Pivot Tables, Conditional Formatting and interactive dashboards.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 320,
    uploaded_at: '2026-02-25'
  },
  {
    id: 'n_tally',
    subject_id: 's_tally',
    topic_id: 't30',
    title: 'Tally Prime with GST Practical Accounting Handbook',
    description: 'Step-by-step voucher entries, GST billing, inventory management, balance sheets and audit guidelines.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 275,
    uploaded_at: '2026-02-26'
  },
  {
    id: 'n_rscit',
    subject_id: 's8',
    topic_id: 't8',
    title: 'RS-CIT Computer Gyan & Government Services Handbook',
    description: 'Complete guide for VMOU Kota RS-CIT examination: Windows OS, Cyber safety, DigiLocker, Jan Aadhaar & SSO ID.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 310,
    uploaded_at: '2026-02-27'
  },
  {
    id: 'n_photoshop',
    subject_id: 's_photoshop',
    topic_id: 't36',
    title: 'Adobe Photoshop Graphic Design & Retouching Notes',
    description: 'Tools guide, layers, masking, blending modes, color correction, social media poster design and exporting.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 195,
    uploaded_at: '2026-02-28'
  },
  {
    id: 'n_premiere',
    subject_id: 's_premiere',
    topic_id: 't41',
    title: 'Video Editing & Premiere Pro Production Playbook',
    description: 'Rough cut, speed ramping, audio sync, sound design, Lumetri color grading and vertical reels export.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 155,
    uploaded_at: '2026-03-01'
  },
  {
    id: 'n_seo',
    subject_id: 's_seo',
    topic_id: 't34',
    title: 'Digital Marketing & SEO Mastery Cheat Sheet',
    description: 'Keyword research, meta tags, Google Search Console, Google Ads campaign setup and social media strategy.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 185,
    uploaded_at: '2026-03-02'
  },
  {
    id: 'n_django',
    subject_id: 's_django',
    topic_id: 't21',
    title: 'Python Django Full Framework & MVT Architecture Guide',
    description: 'Django models, views, URL patterns, template tags, forms, admin panel customization and SQLite/Postgres ORM.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 145,
    uploaded_at: '2026-03-03'
  },
  {
    id: 'n_mysql',
    subject_id: 's_mysql',
    topic_id: 't16',
    title: 'MySQL Relational Database & Complex SQL Queries Playbook',
    description: 'Relational schema design, Primary/Foreign keys, INNER/LEFT joins, GROUP BY aggregations and indexing techniques.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 178,
    uploaded_at: '2026-03-04'
  },
  {
    id: 'n_mongo',
    subject_id: 's_mongo',
    topic_id: 't14',
    title: 'MongoDB NoSQL & Mongoose ODM Practical Handbook',
    description: 'BSON documents, schema validation, CRUD operations, pipeline aggregations and database indexing for high performance.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 160,
    uploaded_at: '2026-03-05'
  },
  {
    id: 'n_api',
    subject_id: 's_api',
    topic_id: 't18',
    title: 'REST API Integration, Postman & JWT Authentication Guide',
    description: 'HTTP methods, status codes, query & route parameters, Axios client setup, token headers and CORS handling.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 190,
    uploaded_at: '2026-03-06'
  },
  {
    id: 'n_ppt',
    subject_id: 's_ppt',
    topic_id: 't25',
    title: 'PowerPoint Slide Designing & Dynamic Presentations Guide',
    description: 'Slide layouts, SmartArt graphics, custom animation timings, slide master templates and kiosk presentations.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 170,
    uploaded_at: '2026-03-07'
  },
  {
    id: 'n_excel_basic',
    subject_id: 's_excel',
    topic_id: 't9',
    title: 'Microsoft Excel Fundamentals, Formulas & Calculation Guide',
    description: 'Basic arithmetic formulas, SUM, AVERAGE, IF statements, cell referencing ($A$1) and graphical charts.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 240,
    uploaded_at: '2026-03-08'
  },
  {
    id: 'n_paint',
    subject_id: 's_paint',
    topic_id: 't32',
    title: 'MS Paint Digital Art & Image Cropping Basics Handbook',
    description: 'Canvas manipulation, free-form selection, resizing pixels, color picking and preparing images for online government forms.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 130,
    uploaded_at: '2026-03-09'
  },
  {
    id: 'n_canva',
    subject_id: 's_canva',
    topic_id: 't38',
    title: 'Canva Social Media Design & Brand Kit Blueprint',
    description: 'Creating viral Instagram posts, YouTube thumbnails, typography pairs, transparent PNG logos and export presets.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 220,
    uploaded_at: '2026-03-10'
  },
  {
    id: 'n_coreldraw',
    subject_id: 's_coreldraw',
    topic_id: 't39',
    title: 'CorelDraw Vector Tracing & Flex Banner Printing Notes',
    description: 'Pen tool curves, shaping tools, CMYK color profiles, flex board measurements and wedding card drafting.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 185,
    uploaded_at: '2026-03-11'
  },
  {
    id: 'n_video_edit',
    subject_id: 's_video_edit',
    topic_id: 't40',
    title: 'Video Editing Storytelling, Cuts & Sound Design Playbook',
    description: 'The grammar of film cuts, J-cuts, L-cuts, Foley sound effects, background music ducking and pacing secrets.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 165,
    uploaded_at: '2026-03-12'
  },
  {
    id: 'n_after_effects',
    subject_id: 's_after_effects',
    topic_id: 't42',
    title: 'Adobe After Effects Motion Graphics & VFX Reference Guide',
    description: 'Keyframe easing, graph editor, kinetic typography, track mattes, green screen chroma key and render queue settings.',
    pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    cover_image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60',
    status: 'ACTIVE',
    download_count: 140,
    uploaded_at: '2026-03-13'
  }
];

