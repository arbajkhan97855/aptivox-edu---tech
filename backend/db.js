import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import {
  COURSE_DEFAULT_SUBJECTS,
  ALL_SUBJECTS,
  ALL_TOPICS,
  ALL_PAPERS,
  ALL_NOTES,
  getStudentEnrolledSubjects
} from './curriculum.js';

export { COURSE_DEFAULT_SUBJECTS, ALL_SUBJECTS, ALL_TOPICS, ALL_PAPERS, ALL_NOTES, getStudentEnrolledSubjects };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '..', 'data', 'aptivox_db.json');

// Default initial state
const getInitialState = () => {
  const adminHashedPassword = bcrypt.hashSync('aptivox123', 10);
  const studentHashedPassword = bcrypt.hashSync('student123', 10);

  const courses = [
    { id: 'c1', name: 'Web Designer', duration: '3 Months', status: 'ACTIVE', description: 'Master UI design, HTML5, CSS3, Flexbox, Grid, Responsive Design & Bootstrap.', course_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c1 },
    { id: 'c2', name: 'Web Development', duration: '6 Months', status: 'ACTIVE', description: 'Full frontend & backend web development with JavaScript, PHP, MySQL and APIs.', course_image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c2 },
    { id: 'c3', name: 'Python', duration: '3 Months', status: 'ACTIVE', description: 'Core Python, OOPs, Data Analysis, Pandas, NumPy and Flask backend web frameworks.', course_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c3 },
    { id: 'c4', name: 'Full Stack Developer', duration: '8 Months', status: 'ACTIVE', description: 'Comprehensive Full Stack program covering Frontend, Backend, Databases, CI/CD and Cloud.', course_image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c4 },
    { id: 'c5', name: 'MERN Stack Developer', duration: '6 Months', status: 'ACTIVE', description: 'Industrial MERN Stack: MongoDB, Express.js, React.js, Node.js, Next.js & REST APIs.', course_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c5 },
    { id: 'c6', name: 'CAP', duration: '3 Months', status: 'ACTIVE', description: 'Certificate in Advanced Programming - C, C++, Data Structures and Algorithm building.', course_image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c6 },
    { id: 'c7', name: 'RS-CIT', duration: '3 Months', status: 'ACTIVE', description: 'Rajasthan State Certificate Course in Information Technology, MS Office, Internet, Govt Portals.', course_image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c7 },
    { id: 'c8', name: 'Graphic Designer', duration: '4 Months', status: 'ACTIVE', description: 'Adobe Photoshop, Illustrator, CorelDraw, InDesign, Branding and Digital Advertising.', course_image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c8 },
    { id: 'c9', name: 'Digital Marketing', duration: '4 Months', status: 'ACTIVE', description: 'SEO, SEM, Social Media Marketing, Meta Ads, Google Ads, Analytics & Content Strategy.', course_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c9 },
    { id: 'c10', name: 'Video Editing', duration: '3 Months', status: 'ACTIVE', description: 'Adobe Premiere Pro, After Effects, Sound Design, Color Grading, Reels & YouTube Editing.', course_image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c10 },
    { id: 'c11', name: 'Excel', duration: '2 Months', status: 'ACTIVE', description: 'Advanced Excel, VLOOKUP, XLOOKUP, Pivot Tables, Dashboards, Macros and Power Query.', course_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c11 },
    { id: 'c12', name: 'Tally IT', duration: '3 Months', status: 'ACTIVE', description: 'Tally Prime with GST, Inventory, Payroll, Balance Sheet, Auditing & Accounting Standards.', course_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60', subjects: COURSE_DEFAULT_SUBJECTS.c12 }
  ];

  const subjects = [...ALL_SUBJECTS];
  const topics = [...ALL_TOPICS];

  const test_levels = [
    { id: 'l1', name: 'Basic Test' },
    { id: 'l2', name: 'Medium Test' },
    { id: 'l3', name: 'Advanced Test' }
  ];

  const exam_papers = [...ALL_PAPERS];

  // Helper generator to create 50 high-quality questions for paper p1
  const generateQuestionsForPaper1 = () => {
    const qList = [];
    const questionsData = [
      { q: 'What does HTML stand for?', a: 'Hyper Text Markup Language', b: 'High Text Modern Language', c: 'Hyper Transfer Markup Level', d: 'Home Tool Markup Language', ans: 'A', exp: 'HTML stands for HyperText Markup Language, the standard markup language for documents designed to be displayed in a web browser.' },
      { q: 'Who is the inventor of the World Wide Web and HTML?', a: 'Bill Gates', b: 'Tim Berners-Lee', c: 'Brendan Eich', d: 'James Gosling', ans: 'B', exp: 'Sir Tim Berners-Lee invented HTML and the World Wide Web in 1989-1990.' },
      { q: 'Which HTML element is used to define the title of a document?', a: '<meta>', b: '<head>', c: '<title>', d: '<header>', ans: 'C', exp: 'The <title> tag defines the title of the document shown in the browser toolbar or tab.' },
      { q: 'Which is the largest heading tag in HTML?', a: '<h6>', b: '<head>', c: '<heading>', d: '<h1>', ans: 'D', exp: '<h1> defines the most important and largest default heading in standard HTML.' },
      { q: 'What is the correct HTML element for inserting a line break?', a: '<lb>', b: '<break>', c: '<br>', d: '<newline>', ans: 'C', exp: '<br> produces a line break in text (carriage-return).' },
      { q: 'What is the correct HTML for creating a hyperlink?', a: '<a href="https://aptivox.in">Aptivox</a>', b: '<a name="https://aptivox.in">Aptivox</a>', c: '<link url="https://aptivox.in">Aptivox</link>', d: '<a>https://aptivox.in</a>', ans: 'A', exp: 'The <a> tag with href attribute is used for hyperlinks.' },
      { q: 'Which character is used to indicate an end tag in HTML?', a: '*', b: '<', c: '^', d: '/', ans: 'D', exp: 'A forward slash (/) is used before the tag name in closing tags, e.g., </p>.' },
      { q: 'How can you open a link in a new tab/browser window?', a: '<a href="url" target="_blank">', b: '<a href="url" new>', c: '<a href="url" target="new">', d: '<a href="url" window="_new">', ans: 'A', exp: 'target="_blank" tells the browser to open the linked document in a new window or tab.' },
      { q: 'Which element is used to specify a footer for a document or section?', a: '<bottom>', b: '<footer>', c: '<section-footer>', d: '<foot>', ans: 'B', exp: 'The <footer> tag defines a footer for a document or section.' },
      { q: 'What is the correct HTML for adding a background color?', a: '<body bg="yellow">', b: '<body style="background-color:yellow;">', c: '<background>yellow</background>', d: '<body color="yellow">', ans: 'B', exp: 'Modern HTML uses CSS style="background-color: yellow;" or external stylesheets.' },
      { q: 'Which HTML attribute specifies an alternate text for an image, if the image cannot be displayed?', a: 'title', b: 'src', c: 'alt', d: 'longdesc', ans: 'C', exp: 'The alt attribute provides alternative text for accessibility and screen readers.' },
      { q: 'Which HTML element is used to display a scalar measurement within a range?', a: '<range>', b: '<meter>', c: '<gauge>', d: '<measure>', ans: 'B', exp: 'The <meter> element represents a scalar value within a known range or fractional value.' },
      { q: 'What is the correct HTML for making a checkbox input?', a: '<input type="check">', b: '<checkbox>', c: '<input type="checkbox">', d: '<check>', ans: 'C', exp: '<input type="checkbox"> defines a checkbox control.' },
      { q: 'What is the correct HTML for making a text input area with multiple lines?', a: '<input type="textbox">', b: '<textarea>', c: '<input type="text" multiline="true">', d: '<text-multiline>', ans: 'B', exp: 'The <textarea> tag defines a multi-line text input control.' },
      { q: 'Which HTML doctype declaration is correct for HTML5?', a: '<!DOCTYPE html>', b: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 5.0//EN">', c: '<!DOCTYPE HTML5>', d: '<!DOCTYPE html-5>', ans: 'A', exp: '<!DOCTYPE html> is the concise, case-insensitive HTML5 doctype.' },
      { q: 'Which HTML element is used to specify navigation links?', a: '<navigation>', b: '<nav>', c: '<navigate>', d: '<links>', ans: 'B', exp: 'The <nav> element defines a set of navigation links.' },
      { q: 'Which HTML tag is used for ordered (numbered) lists?', a: '<ul>', b: '<dl>', c: '<ol>', d: '<list>', ans: 'C', exp: '<ol> defines an ordered list, where items are marked with numbers by default.' },
      { q: 'Which HTML element represents emphasized text that carries semantic importance?', a: '<i>', b: '<bold>', c: '<em>', d: '<italic>', ans: 'C', exp: '<em> signifies stress emphasis on its contents, typically rendered in italics.' },
      { q: 'Which input type defines a slider control in HTML5?', a: '<input type="slider">', b: '<input type="range">', c: '<input type="controls">', d: '<input type="bar">', ans: 'B', exp: 'The <input type="range"> defines a slider control.' },
      { q: 'What is the purpose of the <meta charset="UTF-8"> tag?', a: 'Defines CSS version', b: 'Specifies character encoding for the HTML document', c: 'Defines screen resolution', d: 'Specifies JavaScript engine', ans: 'B', exp: 'UTF-8 covers almost all characters and symbols in the world, preventing encoding issues.' },
      { q: 'Which HTML5 element is used for drawing graphics on the fly via JavaScript?', a: '<svg>', b: '<canvas>', c: '<draw>', d: '<graphic>', ans: 'B', exp: 'The <canvas> element is used to draw graphics via scripting (usually JavaScript).' },
      { q: 'Which HTML tag is used to embed audio files natively in HTML5?', a: '<sound>', b: '<audio>', c: '<mp3>', d: '<music>', ans: 'B', exp: 'The <audio> element is used to embed sound content in documents.' },
      { q: 'Which attribute in <video> allows automatic playback when loaded?', a: 'autoplay', b: 'play', c: 'auto', d: 'start="now"', ans: 'A', exp: 'autoplay causes video to begin playing automatically as soon as it can.' },
      { q: 'What is the purpose of semantic HTML elements?', a: 'They make the file smaller', b: 'They clearly describe their meaning to both the browser and developer', c: 'They are required for PHP', d: 'They disable CSS styles', ans: 'B', exp: 'Semantic tags like <header>, <article>, and <footer> give clear meaning to structure.' },
      { q: 'Which HTML element represents independent, self-contained content such as a blog post or news story?', a: '<section>', b: '<aside>', c: '<article>', d: '<div>', ans: 'C', exp: 'The <article> tag specifies independent, self-contained content.' },
      { q: 'Which tag defines content aside from the content it is placed in (like a sidebar)?', a: '<sidebar>', b: '<aside>', c: '<subcontent>', d: '<margin>', ans: 'B', exp: '<aside> defines content tangentially related to the content around it.' },
      { q: 'Which HTML attribute specifies that an input field must be filled out before submitting?', a: 'validate', b: 'required', c: 'necessary', d: 'mandatory', ans: 'B', exp: 'The required attribute specifies that an input field must not be empty.' },
      { q: 'Which element is used to group related elements in a form with a visible border?', a: '<group>', b: '<fieldset>', c: '<block>', d: '<form-group>', ans: 'B', exp: 'The <fieldset> tag is used to group related elements in a form.' },
      { q: 'What is the caption element used specifically inside <fieldset>?', a: '<label>', b: '<legend>', c: '<caption>', d: '<title>', ans: 'B', exp: '<legend> defines a caption for the <fieldset> element.' },
      { q: 'What is the default method for an HTML form when not specified?', a: 'POST', b: 'GET', c: 'PUT', d: 'FETCH', ans: 'B', exp: 'The default HTTP method for form submission is GET.' },
      { q: 'Which attribute specifies where to send the form-data when a form is submitted?', a: 'target', b: 'action', c: 'method', d: 'route', ans: 'B', exp: 'The action attribute defines where form data is sent on submit.' },
      { q: 'Which HTML tag is used to define table rows?', a: '<td>', b: '<th>', c: '<tr>', d: '<table-row>', ans: 'C', exp: '<tr> defines a row of cells in a table.' },
      { q: 'Which HTML tag defines a table header cell?', a: '<td>', b: '<th>', c: '<head>', d: '<cell-head>', ans: 'B', exp: '<th> defines a header cell in an HTML table, rendered bold and centered by default.' },
      { q: 'How do you create an HTML comment?', a: '// This is a comment', b: '/* This is a comment */', c: '<!-- This is a comment -->', d: '# This is a comment', ans: 'C', exp: '<!-- comment text --> is the comment syntax in HTML.' },
      { q: 'Which HTML attribute provides a tooltip when hovering over an element?', a: 'alt', b: 'tooltip', c: 'title', d: 'hover', ans: 'C', exp: 'The title attribute provides extra advisory information displayed as a tooltip.' },
      { q: 'Which HTML element is used to highlight or mark text with a yellow background by default?', a: '<highlight>', b: '<mark>', c: '<yellow>', d: '<em>', ans: 'B', exp: 'The <mark> element represents text that is marked or highlighted for reference.' },
      { q: 'What is the correct tag for superscript text in HTML (e.g., x²)?', a: '<super>', b: '<sup>', c: '<sub>', d: '<up>', ans: 'B', exp: '<sup> defines superscript text, raised above the baseline.' },
      { q: 'What is the correct tag for subscript text in HTML (e.g., H₂O)?', a: '<subscript>', b: '<down>', c: '<sub>', d: '<sup>', ans: 'C', exp: '<sub> defines subscript text, lowered below the baseline.' },
      { q: 'Which tag defines preformatted text where whitespace and line breaks are preserved?', a: '<code>', b: '<pre>', c: '<format>', d: '<samp>', ans: 'B', exp: 'The <pre> element represents preformatted text displayed in a monospace font.' },
      { q: 'Which HTML element is used to embed an external webpage or document?', a: '<embed-page>', b: '<iframe>', c: '<web-view>', d: '<frame>', ans: 'B', exp: 'An <iframe> is used to display a web page within a web page.' },
      { q: 'Which HTML attribute specifies that an audio or video file should start over again every time it finishes?', a: 'repeat', b: 'loop', c: 'replay', d: 'infinite', ans: 'B', exp: 'The loop attribute specifies that the audio/video will start over again automatically.' },
      { q: 'What is the purpose of the <noscript> tag in HTML?', a: 'Disables JavaScript on page', b: 'Displays alternate content if JavaScript is disabled in the browser', c: 'Blocks harmful viruses', d: 'Logs script errors', ans: 'B', exp: '<noscript> provides fallback content when JavaScript is disabled or unsupported.' },
      { q: 'Which tag defines a drop-down list in an HTML form?', a: '<dropdown>', b: '<list>', c: '<select>', d: '<input type="dropdown">', ans: 'C', exp: '<select> is used to create a drop-down list of <option> elements.' },
      { q: 'Which element defines an option in a drop-down list?', a: '<item>', b: '<option>', c: '<list-item>', d: '<choice>', ans: 'B', exp: '<option> tags go inside <select> to define the selectable items.' },
      { q: 'Which HTML tag is used for keyboard input display in documentation?', a: '<key>', b: '<kbd>', c: '<button>', d: '<input>', ans: 'B', exp: '<kbd> represents user input from a keyboard, voice input, or another text device.' },
      { q: 'Which HTML5 element represents a disclosure widget from which the user can obtain additional information?', a: '<details>', b: '<summary>', c: '<accordion>', d: '<popup>', ans: 'A', exp: '<details> specifies additional details that the user can open and close on demand.' },
      { q: 'Which tag is used as a summary/heading for a <details> element?', a: '<heading>', b: '<title>', c: '<summary>', d: '<caption>', ans: 'C', exp: '<summary> defines a visible heading for the <details> disclosure element.' },
      { q: 'Which input type is specifically optimized for entering telephone numbers on mobile keyboards?', a: '<input type="number">', b: '<input type="tel">', c: '<input type="phone">', d: '<input type="digits">', ans: 'B', exp: '<input type="tel"> brings up telephone numeric keypads on mobile browsers.' },
      { q: 'What is the default display value of a <div> element in CSS?', a: 'inline', b: 'inline-block', c: 'block', d: 'flex', ans: 'C', exp: '<div> is a block-level container element by default in standard browser stylesheets.' },
      { q: 'What is the default display value of a <span> element in CSS?', a: 'block', b: 'inline', c: 'none', d: 'table', ans: 'B', exp: '<span> is an inline container element used for styling snippets of text.' }
    ];

    questionsData.forEach((item, idx) => {
      qList.push({
        id: `q_p1_${idx + 1}`,
        paper_id: 'p1',
        course_id: 'c5',
        subject_id: 's1',
        topic_id: 't1',
        level_id: 'l1',
        question_text: item.q,
        option_a: item.a,
        option_b: item.b,
        option_c: item.c,
        option_d: item.d,
        correct_answer: item.ans,
        marks: 2,
        negative_marks: 0.5,
        explanation: item.exp,
        difficulty: idx < 15 ? 'EASY' : idx < 35 ? 'MEDIUM' : 'HARD'
      });
    });

    return qList;
  };

  // Helper generator to create 50 questions for Paper 2 (HTML Semantic Structure)
  const generateQuestionsForPaper2 = () => {
    const qList = [];
    for (let i = 1; i <= 50; i++) {
      qList.push({
        id: `q_p2_${i}`,
        paper_id: 'p2',
        course_id: 'c5',
        subject_id: 's1',
        topic_id: 't1',
        level_id: 'l1',
        question_text: `HTML Structure Exam Question #${i}: Which statement about semantic tags, accessibility and valid DOM tree construction in HTML5 is correct?`,
        option_a: `Standard semantic tags like <main>, <header> and <section> increase SEO ranking and accessibility score.`,
        option_b: `Using <div> tags for all elements is faster and more compliant with WCAG 2.1 guidelines.`,
        option_c: `HTML5 requires closing tags for <img> and <br> with XML-style slashes.`,
        option_d: `All heading tags <h1> through <h6> must be nested inside an <aside> block.`,
        correct_answer: 'A',
        marks: 2,
        negative_marks: 0.5,
        explanation: `Semantic tags provide meaning to web pages rather than just presentation, making it easier for screen readers and search engines to interpret content correctly.`,
        difficulty: i % 3 === 0 ? 'HARD' : i % 2 === 0 ? 'MEDIUM' : 'EASY'
      });
    }
    return qList;
  };

  // Helper generator for CSS Paper 3
  const generateQuestionsForPaper3 = () => {
    const qList = [];
    const cssQs = [
      { q: 'What does CSS stand for?', a: 'Cascading Style Sheets', b: 'Computer Style Syntax', c: 'Creative Sheet System', d: 'Colorful Style Sheets', ans: 'A' },
      { q: 'Which CSS property is used to change text color?', a: 'text-color', b: 'color', c: 'font-color', d: 'text-style', ans: 'B' },
      { q: 'Which property is used to change font family?', a: 'font-family', b: 'font-style', c: 'typeface', d: 'text-font', ans: 'A' },
      { q: 'How do you center an element horizontally using margin?', a: 'margin: 0 center;', b: 'margin: 0 auto;', c: 'margin: auto 0;', d: 'margin: center;', ans: 'B' },
      { q: 'Which CSS box model component is between padding and margin?', a: 'Content', b: 'Border', c: 'Outline', d: 'Gap', ans: 'B' }
    ];
    for (let i = 1; i <= 50; i++) {
      const base = cssQs[(i - 1) % cssQs.length];
      qList.push({
        id: `q_p3_${i}`,
        paper_id: 'p3',
        course_id: 'c5',
        subject_id: 's2',
        topic_id: 't3',
        level_id: 'l2',
        question_text: i <= 5 ? base.q : `CSS Question ${i}: What is the role of CSS property and selector hierarchy rule #${i}?`,
        option_a: i <= 5 ? base.a : `Applies cascading styles with high specificity and clean inheritance.`,
        option_b: i <= 5 ? base.b : `Disables rendering in WebKit and Blink browser engines.`,
        option_c: i <= 5 ? base.c : `Forces synchronous repaint on every DOM mutation.`,
        option_d: i <= 5 ? base.d : `Overwrites all browser default user-agent properties completely.`,
        correct_answer: i <= 5 ? base.ans : 'A',
        marks: 2,
        negative_marks: 0.5,
        explanation: 'Cascading Style Sheets control visual layout, box model properties and typography.',
        difficulty: 'MEDIUM'
      });
    }
    return qList;
  };

  // Helper generator for JS Paper 4
  const generateQuestionsForPaper4 = () => {
    const qList = [];
    for (let i = 1; i <= 50; i++) {
      qList.push({
        id: `q_p4_${i}`,
        paper_id: 'p4',
        course_id: 'c5',
        subject_id: 's3',
        topic_id: 't5',
        level_id: 'l3',
        question_text: `JavaScript Advanced Question ${i}: How does the JavaScript engine handle execution context, closures and event loop queues?`,
        option_a: `Call stack executes synchronous code, while microtasks (Promises) run before macrotasks (setTimeout).`,
        option_b: `JavaScript creates a new thread for every function call in modern V8.`,
        option_c: `Closures immediately release outer variables to garbage collector on return.`,
        option_d: `All variables declared with 'const' are deeply immutable and cannot mutate properties.`,
        correct_answer: 'A',
        marks: 2,
        negative_marks: 0.5,
        explanation: `In the JS event loop, the microtask queue has higher priority than macrotask queue.`,
        difficulty: 'HARD'
      });
    }
    return qList;
  };

  // Python questions for paper p5
  const generateQuestionsForPaper5 = () => {
    const qList = [];
    for (let i = 1; i <= 50; i++) {
      qList.push({
        id: `q_p5_${i}`,
        paper_id: 'p5',
        course_id: 'c3',
        subject_id: 's6',
        topic_id: 't7',
        level_id: 'l1',
        question_text: `Python Core Question ${i}: What is the output or mechanism of Python data structures and indentation syntax?`,
        option_a: `Python uses indentation to define code blocks instead of curly braces.`,
        option_b: `Lists in Python are immutable while Tuples are mutable.`,
        option_c: `The 'def' keyword is used to declare global constants.`,
        option_d: `Python code must be compiled into machine binaries before execution.`,
        correct_answer: 'A',
        marks: 2,
        negative_marks: 0.5,
        explanation: `Python uses whitespace indentation to delimit blocks of code.`,
        difficulty: 'EASY'
      });
    }
    return qList;
  };

  // RS-CIT questions for paper p6
  const generateQuestionsForPaper6 = () => {
    const qList = [];
    for (let i = 1; i <= 50; i++) {
      qList.push({
        id: `q_p6_${i}`,
        paper_id: 'p6',
        course_id: 'c7',
        subject_id: 's8',
        topic_id: 't8',
        level_id: 'l1',
        question_text: `RS-CIT Computer Question ${i}: What is the function of the main computer hardware components and operating systems?`,
        option_a: `CPU (Central Processing Unit) acts as the brain of the computer executing arithmetic and logic instructions.`,
        option_b: `RAM is permanent secondary storage that preserves data when power is turned off.`,
        option_c: `Monitor is an input device used to enter data.`,
        option_d: `Operating System cannot manage file storage or memory.`,
        correct_answer: 'A',
        marks: 2,
        negative_marks: 0.0,
        explanation: `CPU performs processing tasks and calculation for the computer system.`,
        difficulty: 'EASY'
      });
    }
    return qList;
  };

  // Helper generator to create questions for any paper
  const generateQuestionsForPaper = (paper) => {
    if (paper.id === 'p1') return generateQuestionsForPaper1();

    const qList = [];
    const count = paper.total_questions || 50;
    const sub = ALL_SUBJECTS.find((s) => s.id === paper.subject_id);
    const subName = sub ? sub.name : 'Curriculum';

    for (let i = 1; i <= count; i++) {
      qList.push({
        id: `q_${paper.id}_${i}`,
        paper_id: paper.id,
        course_id: paper.course_id || 'c1',
        subject_id: paper.subject_id,
        topic_id: paper.topic_id,
        level_id: paper.level_id || 'l1',
        question_text: `${subName} Practical Examination Question #${i}: What is the correct standard, methodology and optimal syntax in ${subName}?`,
        option_a: `Standard practice follows industry conventions, proper syntax, structure and robust error handling.`,
        option_b: `Deprecated approach that causes runtime failures and syntax incompatibilities.`,
        option_c: `Randomized approach without type validation or proper environment variable setup.`,
        option_d: `Bypasses security guidelines and produces memory leaks in execution.`,
        correct_answer: 'A',
        marks: 2,
        negative_marks: paper.negative_marking !== undefined ? paper.negative_marking : 0.5,
        explanation: `In ${subName}, applying verified coding and application standards ensures high performance, compliance and security.`,
        difficulty: i < 15 ? 'EASY' : i < 35 ? 'MEDIUM' : 'HARD'
      });
    }
    return qList;
  };

  const allQuestions = [];
  ALL_PAPERS.forEach((p) => {
    allQuestions.push(...generateQuestionsForPaper(p));
  });

  // Seed Students for APTIVOX EDUCATION & TECHNOLOGY
  const students = [
    {
      id: 'stu_1',
      student_id: 'APTIVOX-2026-001',
      name: 'Rahul Sharma',
      father_name: 'Mr. Ramesh Sharma',
      email: 'rahul.aptivox@gmail.com',
      mobile: '9829012345',
      dob: '2004-05-14',
      address: '',
      course_id: 'c5', // MERN Stack Developer
      enrolled_subjects: COURSE_DEFAULT_SUBJECTS.c5,
      batch: 'Morning 9:00 AM - 11:00 AM',
      enrollment_date: '2026-01-10',
      password: studentHashedPassword,
      status: 'ACTIVE',
      profile_image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'stu_2',
      student_id: 'APTIVOX-2026-002',
      name: 'Pooja Verma',
      father_name: 'Mr. Suresh Verma',
      email: 'pooja.aptivox@gmail.com',
      mobile: '9782145678',
      dob: '2003-08-22',
      address: '',
      course_id: 'c1', // Web Designer
      enrolled_subjects: COURSE_DEFAULT_SUBJECTS.c1,
      batch: 'Afternoon 12:00 PM - 2:00 PM',
      enrollment_date: '2026-02-01',
      password: studentHashedPassword,
      status: 'ACTIVE',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'stu_3',
      student_id: 'APTIVOX-2026-003',
      name: 'Amit Kumar Choudhary',
      father_name: 'Mr. Kailash Choudhary',
      email: 'amit.aptivox@gmail.com',
      mobile: '9414098765',
      dob: '2005-02-18',
      address: '',
      course_id: 'c2', // Web Development
      enrolled_subjects: COURSE_DEFAULT_SUBJECTS.c2,
      batch: 'Evening 4:00 PM - 6:00 PM',
      enrollment_date: '2026-01-20',
      password: studentHashedPassword,
      status: 'ACTIVE',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'stu_4',
      student_id: 'APTIVOX-2026-004',
      name: 'Kavita Saini',
      father_name: 'Mr. Ramawtar Saini',
      email: 'kavita.aptivox@gmail.com',
      mobile: '9672033445',
      dob: '2004-11-09',
      address: '',
      course_id: 'c7', // RS-CIT
      enrolled_subjects: COURSE_DEFAULT_SUBJECTS.c7,
      batch: 'Morning 8:00 AM - 10:00 AM',
      enrollment_date: '2026-02-15',
      password: studentHashedPassword,
      status: 'ACTIVE',
      profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'stu_5',
      student_id: 'APTIVOX-2026-005',
      name: 'Deepak Jangid',
      father_name: 'Mr. Mohan Lal Jangid',
      email: 'deepak.aptivox@gmail.com',
      mobile: '9587412390',
      dob: '2003-03-30',
      address: '',
      course_id: 'c6', // CAP
      enrolled_subjects: COURSE_DEFAULT_SUBJECTS.c6,
      batch: 'Evening 5:00 PM - 7:00 PM',
      enrollment_date: '2026-02-20',
      password: studentHashedPassword,
      status: 'ACTIVE',
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    },
    {
      id: 'stu_6',
      student_id: 'APTIVOX-2026-006',
      name: 'Arbaj Khan',
      father_name: 'Mr. Salim Khan',
      email: 'arbaj.aptivox@gmail.com',
      mobile: '9785589164',
      dob: '2004-07-12',
      address: '',
      course_id: 'c4', // Full Stack Developer
      enrolled_subjects: COURSE_DEFAULT_SUBJECTS.c4,
      batch: 'Morning 10:00 AM - 12:00 PM',
      enrollment_date: '2026-03-01',
      password: studentHashedPassword,
      status: 'ACTIVE',
      profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    }
  ];

  // Seed Notes
  const notes = [...ALL_NOTES];

  // Seed Completed Sample Exam Attempts
  const sampleAttempts = [
    {
      id: 'att_demo_1',
      student_id: 'stu_1',
      exam_id: 'p2',
      status: 'COMPLETED',
      started_at: '2026-03-01T10:00:00Z',
      submitted_at: '2026-03-01T10:48:22Z',
      time_taken_seconds: 2902,
      score: 88,
      total_marks: 100,
      percentage: 88,
      passed: true,
      correct_count: 44,
      wrong_count: 4,
      unanswered_count: 2,
      violation_count: 0,
      camera_status: 'ACTIVE_VERIFIED',
      re_exam_required: false,
      ip_address: '192.168.1.42'
    },
    {
      id: 'att_demo_2',
      student_id: 'stu_2',
      exam_id: 'p1',
      status: 'COMPLETED',
      started_at: '2026-03-05T12:15:00Z',
      submitted_at: '2026-03-05T12:58:10Z',
      time_taken_seconds: 2590,
      score: 84,
      total_marks: 100,
      percentage: 84,
      passed: true,
      correct_count: 43,
      wrong_count: 4,
      unanswered_count: 3,
      violation_count: 0,
      camera_status: 'ACTIVE_VERIFIED',
      re_exam_required: false,
      ip_address: '192.168.1.55'
    }
  ];

  return {
    admins: [
      {
        id: 'admin_1',
        email: 'aptivoxeducation@gmail.com',
        password: adminHashedPassword,
        name: 'Aptivox Director / Admin',
        role: 'SUPER_ADMIN',
        created_at: new Date().toISOString()
      }
    ],
    students,
    courses,
    subjects,
    topics,
    test_levels,
    exam_papers,
    questions: allQuestions,
    exam_attempts: sampleAttempts,
    exam_answers: [],
    exam_violations: [],
    re_exam_requests: [],
    notes,
    notifications: [
      {
        id: 'notif_1',
        recipient_type: 'ADMIN',
        title: 'New Exam Completed',
        message: 'Rahul Sharma scored 88% in HTML Basics - Paper 2.',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'notif_2',
        recipient_type: 'ADMIN',
        title: 'New Exam Completed',
        message: 'Pooja Verma scored 84% in HTML Basics - Paper 1.',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'notif_3',
        recipient_type: 'STUDENT',
        student_id: 'stu_1',
        title: 'HTML Basics - Paper 1 Available',
        message: 'You have a pending examination: HTML Basics - Paper 1. Camera monitoring is required.',
        read: false,
        created_at: new Date().toISOString()
      }
    ],
    settings: {
      institute_name: 'APTIVOX EDUCATION & TECHNOLOGY',
      tagline: 'Learn Today. Achieve Tomorrow.',
      address: '',
      contact: '9785589164',
      email: 'aptivoxeducation@gmail.com',
      passing_percentage: 40,
      default_exam_duration: 60,
      camera_required: true,
      fullscreen_required: true,
      re_exam_policy: 'STRICT_ADMIN_APPROVAL'
    }
  };
};

class DBManager {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all collections exist
        const initial = getInitialState();
        for (const key of Object.keys(initial)) {
          if (!this.data[key]) {
            this.data[key] = initial[key];
          }
        }

        // Sync subjects, topics, papers, questions & notes so new curriculum is always present
        ['subjects', 'topics', 'test_levels', 'exam_papers', 'questions', 'notes'].forEach((col) => {
          const currentList = this.data[col] || [];
          const currentIds = new Set(currentList.map((item) => item.id));
          const toAdd = (initial[col] || []).filter((item) => !currentIds.has(item.id));
          if (toAdd.length > 0) {
            this.data[col] = [...currentList, ...toAdd];
          }
        });

        // Ensure courses have subjects initialized
        if (Array.isArray(this.data.courses)) {
          this.data.courses.forEach((c) => {
            if (!Array.isArray(c.subjects) || c.subjects.length === 0) {
              c.subjects = COURSE_DEFAULT_SUBJECTS[c.id] || [];
            }
          });
        }

        // Ensure students have enrolled_subjects initialized if missing
        if (Array.isArray(this.data.students)) {
          this.data.students.forEach((stu) => {
            if (!stu.enrolled_subjects || stu.enrolled_subjects.length === 0) {
              stu.enrolled_subjects = COURSE_DEFAULT_SUBJECTS[stu.course_id] || ['s1', 's2', 's3'];
            }
          });
        }
        this.save();
      } else {
        this.data = getInitialState();
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, using fresh state:', err);
      this.data = getInitialState();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  findById(collection, id) {
    return (this.data[collection] || []).find((item) => item.id === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const record = {
      id: item.id || `${collection.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
      ...item
    };
    this.data[collection].push(record);
    this.save();
    return record;
  }

  update(collection, id, updates) {
    const list = this.data[collection] || [];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return list[index];
  }

  delete(collection, id) {
    const list = this.data[collection] || [];
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.save();
    return true;
  }
}

export const db = new DBManager();
