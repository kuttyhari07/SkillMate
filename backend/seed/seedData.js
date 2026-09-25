import bcrypt from 'bcryptjs';
import { getStore, saveStore } from '../config/store.js';

export const seedDatabase = async () => {
  const store = getStore();

  // If already seeded with users, skip
  if (store.users && store.users.length > 0) {
    console.log('[Seed] Database already populated.');
    return;
  }

  console.log('[Seed] Seeding initial SkillMate data...');

  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminHashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Seed Users
  store.users = [
    {
      id: 'usr_swedha',
      name: 'Swedha Jasmine',
      email: 'swedha@skillmate.edu',
      password: hashedPassword,
      college: 'Anna University College of Engineering',
      department: 'Computer Science and Engineering',
      year: '3rd Year',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: 'Chennai, India',
      languages: ['English', 'Tamil'],
      bio: 'Enthusiastic full stack learner! I love building responsive UIs and teaching Python & HTML/CSS fundamentals.',
      availability: 'Weekdays 6:00 PM - 9:00 PM, Weekends',
      learningMode: 'Peer',
      role: 'student',
      skillsToTeach: [
        { skill: 'Python', level: 'Advanced' },
        { skill: 'HTML', level: 'Intermediate' },
        { skill: 'CSS', level: 'Intermediate' }
      ],
      skillsToLearn: [
        { skill: 'Java', level: 'Beginner' },
        { skill: 'UI/UX Design', level: 'Beginner' }
      ],
      skillCredits: 120,
      learningHours: 18,
      teachingHours: 12,
      averageRating: 4.9,
      reviewsCount: 14,
      badges: ['First Skill Exchange', 'Fast Learner', 'Coding Explorer'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_priya',
      name: 'Priya Sharma',
      email: 'priya@skillmate.edu',
      password: hashedPassword,
      college: 'Anna University College of Engineering',
      department: 'Information Technology',
      year: '3rd Year',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      location: 'Chennai, India',
      languages: ['English', 'Hindi', 'Tamil'],
      bio: 'Backend & Java developer with expertise in OOP, Spring Boot, and SQL. Looking forward to mastering Python automation!',
      availability: 'Weekdays 5:00 PM - 8:00 PM',
      learningMode: 'Peer',
      role: 'student',
      skillsToTeach: [
        { skill: 'Java', level: 'Advanced' },
        { skill: 'Spring Boot', level: 'Intermediate' },
        { skill: 'SQL / Database', level: 'Advanced' }
      ],
      skillsToLearn: [
        { skill: 'Python', level: 'Beginner' },
        { skill: 'React', level: 'Beginner' }
      ],
      skillCredits: 180,
      learningHours: 24,
      teachingHours: 32,
      averageRating: 5.0,
      reviewsCount: 22,
      badges: ['Top Mentor', 'Community Helper', '7 Day Learning Streak'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_rahul',
      name: 'Rahul Verma',
      email: 'rahul@skillmate.edu',
      password: hashedPassword,
      college: 'National Institute of Design',
      department: 'Interaction & Product Design',
      year: '2nd Year',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      location: 'Bangalore, India',
      languages: ['English', 'Hindi', 'Kannada'],
      bio: 'UI/UX enthusiast and Figma wizard. Wanting to learn frontend HTML & CSS so I can turn my prototypes into live code!',
      availability: 'Mon, Wed, Fri 4:00 PM - 7:00 PM',
      learningMode: 'Peer',
      role: 'student',
      skillsToTeach: [
        { skill: 'Figma', level: 'Advanced' },
        { skill: 'UI/UX Design', level: 'Advanced' }
      ],
      skillsToLearn: [
        { skill: 'HTML', level: 'Beginner' },
        { skill: 'CSS', level: 'Beginner' }
      ],
      skillCredits: 95,
      learningHours: 10,
      teachingHours: 15,
      averageRating: 4.8,
      reviewsCount: 9,
      badges: ['Practice Master'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_meena',
      name: 'Meena Sundaram',
      email: 'meena@skillmate.edu',
      password: hashedPassword,
      college: 'College of Fine Arts & Media',
      department: 'Performing Arts',
      year: '4th Year',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      location: 'Coimbatore, India',
      languages: ['English', 'Tamil'],
      bio: 'Trained classical and contemporary dancer and vocalist. Always excited to share rhythm techniques and learn video creation!',
      availability: 'Weekends 10:00 AM - 4:00 PM',
      learningMode: 'Peer',
      role: 'student',
      skillsToTeach: [
        { skill: 'Dance', level: 'Advanced' },
        { skill: 'Music', level: 'Advanced' }
      ],
      skillsToLearn: [
        { skill: 'Photography', level: 'Beginner' },
        { skill: 'Video Editing', level: 'Beginner' }
      ],
      skillCredits: 150,
      learningHours: 20,
      teachingHours: 25,
      averageRating: 4.95,
      reviewsCount: 18,
      badges: ['Community Helper', 'Top Mentor'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_admin',
      name: 'Admin System',
      email: 'admin@skillmate.edu',
      password: adminHashedPassword,
      college: 'SkillMate HQ',
      department: 'Platform Administration',
      year: 'Staff',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      location: 'Virtual',
      languages: ['English'],
      bio: 'SkillMate platform superintendent and analytics administrator.',
      availability: '24/7',
      learningMode: 'Self',
      role: 'admin',
      skillsToTeach: [],
      skillsToLearn: [],
      skillCredits: 9999,
      learningHours: 0,
      teachingHours: 0,
      averageRating: 5.0,
      reviewsCount: 0,
      badges: ['Admin Privileges'],
      createdAt: new Date().toISOString()
    }
  ];

  // 2. Seed Skills Catalog
  store.skills = [
    { id: 'sk_fullstack', name: 'Full Stack Development', category: 'Technical', isPopular: true, icon: 'Globe' },
    { id: 'sk_python', name: 'Python', category: 'Technical', isPopular: true, icon: 'Terminal' },
    { id: 'sk_java', name: 'Java', category: 'Technical', isPopular: true, icon: 'Cpu' },
    { id: 'sk_uiux', name: 'UI/UX Design', category: 'Design', isPopular: true, icon: 'Layout' },
    { id: 'sk_figma', name: 'Figma', category: 'Design', isPopular: true, icon: 'PenTool' },
    { id: 'sk_dance', name: 'Dance', category: 'Creative', isPopular: true, icon: 'Activity' },
    { id: 'sk_music', name: 'Music', category: 'Creative', isPopular: true, icon: 'Music' },
    { id: 'sk_photography', name: 'Photography', category: 'Creative', isPopular: false, icon: 'Camera' },
    { id: 'sk_sql', name: 'SQL / Database', category: 'Technical', isPopular: true, icon: 'Database' },
    { id: 'sk_publicspeaking', name: 'Public Speaking', category: 'Soft Skills', isPopular: false, icon: 'Mic' },
    { id: 'sk_react', name: 'React', category: 'Technical', isPopular: true, icon: 'Code' }
  ];

  // 3. Seed Full Stack Roadmap with all 10 Levels
  store.roadmaps = [
    {
      id: 'rd_fullstack',
      goalTitle: 'Full Stack Development',
      category: 'Technical',
      totalLevels: 10,
      description: 'End-to-end masterpath taking you from foundational web markup to deploying production-ready full-stack applications.',
      levels: [
        {
          id: 'lvl_1',
          levelNumber: 1,
          title: 'HTML Basics & Semantic Web',
          shortName: 'HTML',
          description: 'Master web building blocks, semantic tags, forms, tables, and accessibility.',
          learningObjectives: [
            'Understand HTML document structure and DOCTYPE',
            'Use semantic tags (<header>, <nav>, <main>, <section>, <article>, <footer>)',
            'Create interactive and accessible web forms with validation',
            'Embed images, audio, video and hyperlinks correctly'
          ],
          topics: [
            {
              id: 't_html_struct',
              title: 'HTML Structure & Anatomy',
              concept: 'HTML (HyperText Markup Language) defines the skeleton and semantic meaning of every webpage.',
              explanation: 'An HTML document begins with <!DOCTYPE html> followed by <html>, <head> for metadata, and <body> where visible content lives.',
              keyPoints: [
                'HTML is NOT a programming language, but a declarative markup language',
                'Tags usually come in opening and closing pairs: <p>...</p>',
                'Void elements like <img/>, <br/>, <input/> do not have closing tags'
              ],
              miniExample: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello SkillMate!</h1>\n  </body>\n</html>'
            },
            {
              id: 't_html_tags',
              title: 'Headings, Paragraphs & Text Elements',
              concept: 'Text hierarchy helps users and search engines navigate content naturally.',
              explanation: 'Use <h1> through <h6> to establish document outline. Use <p> for paragraphs, <strong> for important text, and <em> for emphasis.',
              keyPoints: [
                'Have only ONE <h1> per page for optimal SEO and accessibility',
                'Do not skip heading levels (e.g. going from h1 directly to h4)',
                'Use <span> for inline styling hooks'
              ],
              miniExample: '<h1>Main Topic</h1>\n<p>This is a paragraph with <strong>bold</strong> text.</p>'
            },
            {
              id: 't_html_links',
              title: 'Hyperlinks & Navigation',
              concept: 'Links connect pages and resources across the world wide web.',
              explanation: 'The <a> (anchor) tag with the href attribute allows navigation to other URLs, internal bookmarks, or mailto links.',
              keyPoints: [
                'href attribute defines target URL',
                'target="_blank" opens link in new tab (always pair with rel="noopener noreferrer")',
                'href="#section-id" navigates to an element with matching ID on the same page'
              ],
              miniExample: '<a href="https://skillmate.edu" target="_blank" rel="noopener noreferrer">Visit SkillMate</a>'
            },
            {
              id: 't_html_forms',
              title: 'HTML Forms & Inputs',
              concept: 'Forms capture user inputs like credentials, feedback, and search queries.',
              explanation: 'A <form> contains elements like <input>, <textarea>, <select>, and <button>. Use the label element to associate textual prompts with inputs.',
              keyPoints: [
                'Always pair <label for="email"> with <input id="email">',
                'Use specific input types: email, number, date, password for automatic mobile keyboard optimization',
                'Use "required" attribute for browser-level validation'
              ],
              miniExample: '<form>\n  <label for="uname">Name:</label>\n  <input id="uname" type="text" required />\n  <button type="submit">Register</button>\n</form>'
            },
            {
              id: 't_html_semantic',
              title: 'Semantic HTML5 Architecture',
              concept: 'Semantic elements convey meaning to browsers, assistive screen readers, and search engine crawlers.',
              explanation: 'Instead of generic <div> tags everywhere, semantic HTML uses specialized tags like <header>, <nav>, <article>, <aside>, and <footer>.',
              keyPoints: [
                '<article> is for self-contained independent content',
                '<section> groups related thematic content together',
                '<aside> represents tangential content like sidebars or author bios'
              ],
              miniExample: '<header>\n  <nav><a href="/">Home</a></nav>\n</header>\n<main>\n  <article><h2>Article Title</h2></article>\n</main>'
            }
          ],
          mcqs: [
            {
              id: 'mcq_h1',
              question: 'Which HTML tag is used to define a hyperlink?',
              options: ['<link>', '<a>', '<href>', '<url>'],
              correctIndex: 1,
              explanation: 'The <a> (anchor) tag with the "href" attribute creates hyperlinks to other pages or files.'
            },
            {
              id: 'mcq_h2',
              question: 'Which HTML5 element represents self-contained, independently distributable content like a blog post or news item?',
              options: ['<section>', '<article>', '<aside>', '<main>'],
              correctIndex: 1,
              explanation: '<article> is specifically intended for standalone, syndicated, or independently redistributable content.'
            },
            {
              id: 'mcq_h3',
              question: 'What is the correct input type for entering passwords so characters are masked?',
              options: ['type="secret"', 'type="password"', 'type="hidden"', 'type="text"'],
              correctIndex: 1,
              explanation: '<input type="password"> automatically masks entered characters on screen.'
            },
            {
              id: 'mcq_h4',
              question: 'Which attribute should always be provided on an <img> tag for accessibility and screen readers?',
              options: ['src-alt', 'title', 'alt', 'desc'],
              correctIndex: 2,
              explanation: 'The "alt" attribute provides alternative text for screen readers and displays when the image fails to load.'
            },
            {
              id: 'mcq_h5',
              question: 'How do you open a hyperlink in a new browser tab safely?',
              options: ['target="_new"', 'target="_blank" rel="noopener noreferrer"', 'window="new"', 'open="tab"'],
              correctIndex: 1,
              explanation: 'target="_blank" opens in a new tab, and rel="noopener noreferrer" prevents tabnabbing security risks.'
            },
            {
              id: 'mcq_h6',
              question: 'Which tag is used to create an unordered bulleted list?',
              options: ['<ol>', '<dl>', '<ul>', '<list>'],
              correctIndex: 2,
              explanation: '<ul> defines an unordered (bulleted) list, whereas <ol> defines an ordered (numbered) list.'
            },
            {
              id: 'mcq_h7',
              question: 'Which attribute pairs a <label> element with an <input> element?',
              options: ['name', 'for', 'id-link', 'target'],
              correctIndex: 1,
              explanation: 'The "for" attribute on <label> must match the "id" attribute on the target input element.'
            },
            {
              id: 'mcq_h8',
              question: 'What does the <!DOCTYPE html> declaration do?',
              options: ['Links external styles', 'Tells the browser to render using modern HTML5 standards mode', 'Encrypts HTML payload', 'Defines page language'],
              correctIndex: 1,
              explanation: '<!DOCTYPE html> informs web browsers that the document is written in modern HTML5.'
            },
            {
              id: 'mcq_h9',
              question: 'Which tag is used to define tabular data rows in an HTML table?',
              options: ['<td>', '<th>', '<tr>', '<table-row>'],
              correctIndex: 2,
              explanation: '<tr> defines table rows; <td> defines table cells (data), and <th> defines header cells.'
            },
            {
              id: 'mcq_h10',
              question: 'Which semantic element contains introductory content or navigational links for a page or section?',
              options: ['<header>', '<footer>', '<aside>', '<head>'],
              correctIndex: 0,
              explanation: '<header> represents a container for introductory content or navigation links.'
            }
          ],
          codingChallenges: [
            {
              id: 'code_h1',
              title: 'HTML Practice 1: Semantic Document Shell',
              difficulty: 'Beginner',
              statement: 'Write an HTML document that has a <main> tag containing an <h1> with text "SkillMate Portal" and a <p> with text "Connect Skills. Learn Together.".',
              starterCode: '<!DOCTYPE html>\n<html>\n  <body>\n    <!-- Write your code here -->\n  </body>\n</html>',
              hints: ['Include <main> inside <body>', 'Put <h1>SkillMate Portal</h1> and <p>Connect Skills. Learn Together.</p> inside <main>'],
              testCases: [
                { input: 'structure check', expected: '<main>' },
                { input: 'heading check', expected: 'SkillMate Portal' },
                { input: 'tag check', expected: 'Connect Skills. Learn Together.' }
              ]
            },
            {
              id: 'code_h2',
              title: 'HTML Practice 2: Accessible Registration Form',
              difficulty: 'Intermediate',
              statement: 'Create a form containing a label for "email" with text "Email Address:", an input with type="email" and id="email" required, and a submit button with text "Join Now".',
              starterCode: '<form action="/submit">\n  <!-- Add label, input, and button -->\n</form>',
              hints: ['Use <label for="email">', '<input type="email" id="email" required />', '<button type="submit">Join Now</button>'],
              testCases: [
                { input: 'label check', expected: 'for="email"' },
                { input: 'input type check', expected: 'type="email"' },
                { input: 'button check', expected: 'Join Now' }
              ]
            }
          ],
          miniChallenge: {
            title: 'Mini Challenge: Student Registration & Skill Card',
            description: 'Build a complete student registration card including full name, college dropdown, email field, bio textarea, and skills checkbox group with valid semantic tags.',
            requirements: [
              'Include at least one <form> tag with proper method and action',
              'Include inputs for full name, email with HTML5 validation',
              'Include at least 2 skill checkboxes',
              'Include a submit button labeled "Complete Registration"'
            ]
          },
          peerPracticePrompt: {
            title: 'HTML Peer Code Review Session',
            description: 'Connect with a Skill Mate to review each other\'s form accessibility, semantic tag hierarchy, and discuss common pitfalls.',
            suggestedQuestions: [
              'Why is using <div> for buttons bad for screen readers?',
              'How do semantic HTML5 tags improve SEO ranking?',
              'What happens when you omit the "name" attribute on form inputs?'
            ]
          }
        },
        {
          id: 'lvl_2',
          levelNumber: 2,
          title: 'CSS Styling, Flexbox & Responsive Layouts',
          shortName: 'CSS',
          description: 'Master CSS selectors, box model, Flexbox layout, Grid systems, and mobile-first responsive media queries.',
          learningObjectives: [
            'Master Box Model (margin, border, padding, content)',
            'Build 1-dimensional layouts using CSS Flexbox',
            'Build 2-dimensional grid layouts using CSS Grid',
            'Write mobile-first media queries'
          ],
          topics: [
            {
              id: 't_css_box',
              title: 'The CSS Box Model',
              concept: 'Every HTML element is rendered as a rectangular box comprising margin, border, padding, and content.',
              explanation: 'Using box-sizing: border-box ensures padding and borders do not unexpectedly expand the element width.',
              keyPoints: [
                'Content: text/images inside the element',
                'Padding: space between content and border',
                'Margin: transparent space outside the border separating neighboring elements',
                'Always use *, *::before, *::after { box-sizing: border-box; }'
              ],
              miniExample: '.card {\n  box-sizing: border-box;\n  width: 300px;\n  padding: 16px;\n  border: 1px solid #e2e8f0;\n  margin: 12px;\n}'
            },
            {
              id: 't_css_flexbox',
              title: 'Modern Flexbox Layouts',
              concept: 'Flexbox distributes space and aligns items along a single axis (row or column).',
              explanation: 'Set display: flex on a parent container to turn its children into flex items with powerful justification and alignment options.',
              keyPoints: [
                'justify-content aligns along the main axis (center, space-between, space-around)',
                'align-items aligns along the cross axis (center, flex-start, stretch)',
                'flex-wrap: wrap allows items to wrap onto multiple lines on mobile screens'
              ],
              miniExample: '.nav-container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}'
            }
          ],
          mcqs: [
            {
              id: 'mcq_c1',
              question: 'Which CSS property ensures that padding and borders are included within the specified element width and height?',
              options: ['box-sizing: border-box', 'box-model: inner', 'content-box: adjust', 'display: inline-block'],
              correctIndex: 0,
              explanation: 'box-sizing: border-box tells the browser to account for any border and padding in the values you specify for an element\'s width and height.'
            },
            {
              id: 'mcq_c2',
              question: 'In Flexbox, which property aligns items along the primary main axis?',
              options: ['align-items', 'justify-content', 'flex-direction', 'align-content'],
              correctIndex: 1,
              explanation: 'justify-content aligns flex items along the main axis (default horizontal row).'
            },
            {
              id: 'mcq_c3',
              question: 'Which CSS unit is relative to the root html element font-size?',
              options: ['em', 'px', 'rem', 'vh'],
              correctIndex: 2,
              explanation: 'rem stands for "root em" and is always relative to the font-size of the <html> element.'
            }
          ],
          codingChallenges: [
            {
              id: 'code_c1',
              title: 'CSS Practice: Centered Flexbox Card',
              difficulty: 'Beginner',
              statement: 'Write CSS for a .container class that uses Flexbox to center its child items both horizontally and vertically.',
              starterCode: '.container {\n  /* Add flexbox properties */\n}',
              hints: ['display: flex;', 'justify-content: center;', 'align-items: center;'],
              testCases: [
                { input: 'display check', expected: 'display: flex' },
                { input: 'justify check', expected: 'justify-content: center' },
                { input: 'align check', expected: 'align-items: center' }
              ]
            }
          ],
          miniChallenge: {
            title: 'Mini Challenge: Responsive SkillMate Profile Badge',
            description: 'Design a responsive student profile card with avatar image, skill tags flex container, and a hover transition effect.',
            requirements: [
              'Use border-radius to create rounded avatar',
              'Use display: flex with flex-wrap: wrap for skill tags',
              'Add a smooth :hover transform or shadow effect'
            ]
          },
          peerPracticePrompt: {
            title: 'CSS Responsive Pairing',
            description: 'Debug a broken responsive navigation bar on mobile viewport with your peer mate.',
            suggestedQuestions: [
              'Why do images overflow containers if max-width: 100% is missing?',
              'When should you pick CSS Grid over Flexbox?'
            ]
          }
        },
        {
          id: 'lvl_3',
          levelNumber: 3,
          title: 'JavaScript Fundamentals & DOM Manipulation',
          shortName: 'JavaScript',
          description: 'Learn modern ES6+ JavaScript, variables (let/const), functions, array methods, DOM events, and async promises.',
          learningObjectives: [
            'Understand variables, primitives, and object references',
            'Master array higher-order methods (.map, .filter, .reduce)',
            'Handle browser DOM events and state changes',
            'Understand asynchronous JavaScript with Promises & Async/Await'
          ],
          topics: [
            {
              id: 't_js_vars',
              title: 'Variables, Types & Scope',
              concept: 'JavaScript is a dynamically typed language powering interactive web logic.',
              explanation: 'Use const for values that are not reassigned and let for mutable variables. Avoid var due to hoisting confusion.',
              keyPoints: [
                'Primitives: string, number, boolean, null, undefined, symbol, bigint',
                'const prevents variable reassignment, but object properties can still be mutated',
                'Use template literals `${var}` for clean string formatting'
              ],
              miniExample: 'const student = "Swedha";\nlet credits = 100;\ncredits += 20;\nconsole.log(`${student} has ${credits} credits`);'
            },
            {
              id: 't_js_arrays',
              title: 'Array Methods (.map, .filter, .reduce)',
              concept: 'Functional array methods transform and summarize lists without mutating the original data.',
              explanation: '.map creates a new array by applying a function; .filter creates a subset passing a test condition; .reduce accumulates items into a single result.',
              keyPoints: [
                'Always return a value inside the .map callback',
                '.filter expects a boolean return',
                'Chaining array methods produces clean declarative pipelines'
              ],
              miniExample: 'const scores = [85, 92, 60, 95];\nconst highScores = scores.filter(s => s >= 80);\nconsole.log(highScores); // [85, 92, 95]'
            }
          ],
          mcqs: [
            {
              id: 'mcq_j1',
              question: 'Which method returns a new array with all elements that pass the test implemented by the provided function?',
              options: ['map()', 'filter()', 'forEach()', 'reduce()'],
              correctIndex: 1,
              explanation: 'Array.prototype.filter() returns a new array containing all elements for which the callback returns true.'
            },
            {
              id: 'mcq_j2',
              question: 'What is the value of typeof null in JavaScript?',
              options: ['"null"', '"undefined"', '"object"', '"boolean"'],
              correctIndex: 2,
              explanation: 'typeof null returns "object", which is a famous historical bug in JavaScript that was retained for backward compatibility.'
            }
          ],
          codingChallenges: [
            {
              id: 'code_j1',
              title: 'JavaScript Practice: String Reversal',
              difficulty: 'Beginner',
              statement: 'Write a JavaScript function reverseString(str) that returns the reversed string.',
              starterCode: 'function reverseString(str) {\n  // Your code here\n  return str.split("").reverse().join("");\n}',
              hints: ['Use str.split("").reverse().join("") or a loop'],
              testCases: [
                { input: 'hello', expected: 'olleh' },
                { input: 'SkillMate', expected: 'etaMllikS' }
              ]
            },
            {
              id: 'code_j2',
              title: 'JavaScript Practice: Even or Odd Checker',
              difficulty: 'Beginner',
              statement: 'Write a function checkEvenOdd(num) that returns "Even" if num is even, or "Odd" if num is odd.',
              starterCode: 'function checkEvenOdd(num) {\n  return num % 2 === 0 ? "Even" : "Odd";\n}',
              hints: ['Use modulo operator num % 2 === 0'],
              testCases: [
                { input: '4', expected: 'Even' },
                { input: '7', expected: 'Odd' }
              ]
            }
          ],
          miniChallenge: {
            title: 'Mini Challenge: Interactive Todo App',
            description: 'Create an interactive task tracker where students can type a task, add it to an array, mark it done, and see live count.',
            requirements: [
              'Add item to list on submit',
              'Clear input after submission',
              'Toggle completed state on click'
            ]
          },
          peerPracticePrompt: {
            title: 'JavaScript Debugging Exchange',
            description: 'Pair with your peer to solve asynchronous fetch issues and understand event loop microtasks.',
            suggestedQuestions: [
              'What is the difference between synchronous and asynchronous code?',
              'How does Promise.all work?'
            ]
          }
        },
        {
          id: 'lvl_4',
          levelNumber: 4,
          title: 'Git Version Control & GitHub Collaboration',
          shortName: 'Git & GitHub',
          description: 'Master branch workflows, commits, pull requests, resolving merge conflicts, and remote team repositories.',
          learningObjectives: [
            'Understand git staging area and commit snapshots',
            'Create, switch, and merge git branches',
            'Open and review GitHub Pull Requests',
            'Handle merge conflicts smoothly'
          ],
          topics: [
            {
              id: 't_git_basics',
              title: 'Git Repositories, Staging & Commits',
              concept: 'Git records changes to files over time so you can recall specific versions later.',
              explanation: 'Files move from Working Directory -> Staging Area (git add) -> Local Repository (git commit).',
              keyPoints: [
                'git init creates a new local repository',
                'git add . stages changed files',
                'git commit -m "descriptive message" records snapshot'
              ],
              miniExample: 'git checkout -b feature/login\ngit add .\ngit commit -m "feat: add user login modal"\ngit push origin feature/login'
            }
          ],
          mcqs: [
            {
              id: 'mcq_g1',
              question: 'Which git command creates and immediately switches to a new branch?',
              options: ['git branch -new <name>', 'git checkout -b <name>', 'git switch --create-new', 'git merge <name>'],
              correctIndex: 1,
              explanation: 'git checkout -b <name> (or modern git switch -c <name>) creates and switches to the branch.'
            }
          ],
          codingChallenges: [],
          miniChallenge: {
            title: 'Mini Challenge: GitHub Collaborative Pull Request',
            description: 'Fork a demo SkillMate repository, create a feature branch, commit a component, and simulate a pull request review.',
            requirements: ['Branch naming convention', 'Conventional commit messages']
          },
          peerPracticePrompt: {
            title: 'Git Merge Scenario Pairing',
            description: 'Simulate a simultaneous code conflict with your peer and practice manual merge conflict resolution.',
            suggestedQuestions: ['What are the <<<<<<< HEAD markers in git?']
          }
        },
        {
          id: 'lvl_5',
          levelNumber: 5,
          title: 'React.js Component Architecture & Hooks',
          shortName: 'React',
          description: 'Build modern user interfaces with JSX, component hierarchies, useState, useEffect, custom hooks, and context.',
          learningObjectives: [
            'Create reusable functional components with props',
            'Manage interactive state using useState and useReducer',
            'Handle side effects, data fetching, and cleanup with useEffect',
            'Share global state using React Context API'
          ],
          topics: [
            {
              id: 't_react_state',
              title: 'State & Component Lifecycle with Hooks',
              concept: 'React components re-render automatically whenever their internal state or incoming props change.',
              explanation: 'useState declares a state variable and setter. useEffect synchronizes your component with an external system or API.',
              keyPoints: [
                'State updates are asynchronous and trigger re-renders',
                'Pass dependencies array to useEffect to avoid infinite loops',
                'Lift state up when multiple components need to share data'
              ],
              miniExample: 'function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}'
            }
          ],
          mcqs: [
            {
              id: 'mcq_r1',
              question: 'What is the purpose of the dependency array in the useEffect hook?',
              options: ['To list imported libraries', 'To control when the effect function executes based on changed values', 'To specify component props', 'To catch render errors'],
              correctIndex: 1,
              explanation: 'React compares the values in the dependency array between renders and only executes the effect if any value changed.'
            }
          ],
          codingChallenges: [
            {
              id: 'code_r1',
              title: 'React Practice: Interactive Counter Component',
              difficulty: 'Beginner',
              statement: 'Write a React component Counter with a state variable "count" initialized to 0, and two buttons for Increment and Decrement.',
              starterCode: 'import React, { useState } from "react";\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <span data-testid="count">{count}</span>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n      <button onClick={() => setCount(count - 1)}>Decrement</button>\n    </div>\n  );\n}',
              hints: ['useState(0)', 'setCount(count + 1)'],
              testCases: [
                { input: 'useState check', expected: 'useState' },
                { input: 'increment check', expected: 'Increment' }
              ]
            }
          ],
          miniChallenge: {
            title: 'Mini Challenge: Dynamic Skill Filter Component',
            description: 'Build a React component that filters a list of peer mentors in real-time as the student types in a search box.',
            requirements: ['Controlled input state', 'Dynamic array .filter()', 'Clean empty state message']
          },
          peerPracticePrompt: {
            title: 'React Code Pairing: Custom Hooks',
            description: 'Build a reusable useDebounce or useLocalStorage hook with your peer mate.',
            suggestedQuestions: ['Why should hooks only be called at the top level?']
          }
        },
        {
          id: 'lvl_6',
          levelNumber: 6,
          title: 'Node.js Runtime & Asynchronous Server Fundamentals',
          shortName: 'Node.js',
          description: 'Learn the Node.js event loop, CommonJS vs ES Modules, file system operations, streams, and HTTP servers.',
          learningObjectives: [
            'Understand the non-blocking event loop',
            'Manage packages with NPM and scripts',
            'Handle file system I/O and buffers'
          ],
          topics: [
            {
              id: 't_node_eventloop',
              title: 'The Node.js Event Loop',
              concept: 'Node.js uses single-threaded non-blocking I/O to handle high concurrency with low overhead.',
              explanation: 'Heavy I/O operations are offloaded to Libuv worker threads while the main thread coordinates events.',
              keyPoints: ['Single-threaded JavaScript execution', 'Event-driven architecture', 'Ideal for I/O-heavy applications like chat and streaming'],
              miniExample: 'import http from "http";\nconst server = http.createServer((req, res) => res.end("Hello from Node!"));\nserver.listen(8000);'
            }
          ],
          mcqs: [
            {
              id: 'mcq_n1',
              question: 'Which engine does Node.js use to execute JavaScript code outside the browser?',
              options: ['SpiderMonkey', 'V8', 'JavaScriptCore', 'Chakra'],
              correctIndex: 1,
              explanation: 'Node.js is built on Google Chrome\'s V8 high-performance open-source JavaScript engine.'
            }
          ],
          codingChallenges: [],
          miniChallenge: { title: 'Mini Challenge: HTTP File Server', description: 'Create a Node.js server that reads and streams a JSON file.' },
          peerPracticePrompt: { title: 'Node.js Peer Review', description: 'Discuss event loop microtask vs macrotask execution orders.' }
        },
        {
          id: 'lvl_7',
          levelNumber: 7,
          title: 'Express.js Framework, RESTful Routing & Middleware',
          shortName: 'Express.js',
          description: 'Design robust REST APIs, modular routers, request validation, error handling middleware, and CORS security.',
          learningObjectives: [
            'Structure RESTful routes with HTTP verbs (GET, POST, PUT, DELETE)',
            'Create custom middleware for logging and validation',
            'Implement centralized error handling'
          ],
          topics: [
            {
              id: 't_exp_middleware',
              title: 'Express Middleware Pattern',
              concept: 'Middleware functions have access to req, res, and the next() callback in the request-response cycle.',
              explanation: 'Middleware can run code, modify request and response objects, end the cycle, or call next() to pass control.',
              keyPoints: ['Order of middleware declaration matters', 'Error middleware accepts 4 parameters (err, req, res, next)'],
              miniExample: 'app.use((req, res, next) => {\n  console.log(`${req.method} ${req.url}`);\n  next();\n});'
            }
          ],
          mcqs: [
            {
              id: 'mcq_e1',
              question: 'How do you pass control to the next middleware function in Express?',
              options: ['return true', 'next()', 'res.continue()', 'dispatch()'],
              correctIndex: 1,
              explanation: 'Invoking next() passes execution to the next matched middleware function in the stack.'
            }
          ],
          codingChallenges: [],
          miniChallenge: { title: 'Mini Challenge: RESTful Student CRUD API', description: 'Build an Express router supporting GET, POST, and DELETE for student records.' },
          peerPracticePrompt: { title: 'Express API Design Pairing', description: 'Draft OpenAPI / Swagger specifications together.' }
        },
        {
          id: 'lvl_8',
          levelNumber: 8,
          title: 'Databases, Schemas & Data Modeling',
          shortName: 'Database / SQL & NoSQL',
          description: 'Understand relational SQL schemas, joins, indexing, and document-based NoSQL data modeling with Mongoose.',
          learningObjectives: [
            'Write queries using SELECT, JOIN, GROUP BY, and aggregations',
            'Model relational and document data with schemas and validations',
            'Implement indexing for query performance'
          ],
          topics: [
            {
              id: 't_db_modeling',
              title: 'Data Modeling & Relationships',
              concept: 'Proper schemas prevent data anomalies, enforce integrity, and optimize query latency.',
              explanation: 'Choose between embedding documents (1-to-few) or referencing IDs (1-to-many / many-to-many) based on access patterns.',
              keyPoints: ['Use foreign keys or ObjectIds for relationships', 'Index frequently queried fields like email and status'],
              miniExample: 'SELECT u.name, s.skill_name FROM users u JOIN user_skills s ON u.id = s.user_id;'
            }
          ],
          mcqs: [
            {
              id: 'mcq_db1',
              question: 'Which SQL clause is used to filter records resulting from a GROUP BY operation?',
              options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
              correctIndex: 1,
              explanation: 'HAVING filters aggregated groups created by GROUP BY, whereas WHERE filters individual rows before grouping.'
            }
          ],
          codingChallenges: [],
          miniChallenge: { title: 'Mini Challenge: Skill Exchange Schema Design', description: 'Design an optimal schema linking students, skills, and session reviews.' },
          peerPracticePrompt: { title: 'Database Optimization Pairing', description: 'Analyze query execution plans and index trade-offs.' }
        },
        {
          id: 'lvl_9',
          levelNumber: 9,
          title: 'Authentication, Authorization & API Security',
          shortName: 'Auth & APIs',
          description: 'Implement JWT tokens, password hashing with bcrypt, role-based access control, and defense against CORS/XSS/CSRF.',
          learningObjectives: [
            'Hash passwords securely using bcrypt salt rounds',
            'Issue and verify JSON Web Tokens (JWT) for stateless authentication',
            'Enforce route protection and role-based permissions'
          ],
          topics: [
            {
              id: 't_auth_jwt',
              title: 'JWT Authentication Architecture',
              concept: 'JSON Web Tokens provide a compact, URL-safe means of representing claims securely between client and server.',
              explanation: 'A JWT consists of Header.Payload.Signature. The server signs the token using a secret key and verifies subsequent requests without database session lookups.',
              keyPoints: ['Never store passwords in plain text—always use bcrypt', 'Include user ID and role in token payload', 'Send token in Authorization: Bearer <token> header'],
              miniExample: 'const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });'
            }
          ],
          mcqs: [
            {
              id: 'mcq_a1',
              question: 'What are the three components of a JSON Web Token separated by dots?',
              options: ['Key, Value, Signature', 'Header, Payload, Signature', 'Algorithm, Secret, Hash', 'User, Role, Expiry'],
              correctIndex: 1,
              explanation: 'A JWT consists of three base64url-encoded parts: Header, Payload, and Signature.'
            }
          ],
          codingChallenges: [],
          miniChallenge: { title: 'Mini Challenge: Protected Route Middleware', description: 'Implement an auth middleware that extracts Bearer token and attaches user payload.' },
          peerPracticePrompt: { title: 'Security Audit Pairing', description: 'Review authentication edge cases like expired tokens and unauthorized role elevation.' }
        },
        {
          id: 'lvl_10',
          levelNumber: 10,
          title: 'Full Stack Capstone Project & Deployment',
          shortName: 'Full Stack Project',
          description: 'Bring everything together by architecting, testing, and deploying an end-to-end full-stack SaaS platform like SkillMate!',
          learningObjectives: [
            'Integrate React frontend with Express REST API and WebSockets',
            'Implement full CRUD, authentication, and smart recommendation flows',
            'Deploy frontend and backend to production environments with CI/CD'
          ],
          topics: [
            {
              id: 't_cap_arch',
              title: 'Production SaaS Architecture',
              concept: 'Modern SaaS applications decouple reactive frontend interfaces from scalable API services and real-time sockets.',
              explanation: 'SkillMate utilizes Vite React for rapid client state, Express for business logic and WebSocket coordination, and structured persistent storage.',
              keyPoints: ['Keep environment configurations in .env', 'Use automated build verification before deployments'],
              miniExample: 'console.log("Full Stack Capstone Ready!");'
            }
          ],
          mcqs: [
            {
              id: 'mcq_cap1',
              question: 'Which protocol enables bidirectional, real-time communication between browser and server without repeated HTTP polling?',
              options: ['FTP', 'WebSocket', 'SMTP', 'REST'],
              correctIndex: 1,
              explanation: 'WebSocket provides a persistent, full-duplex TCP connection enabling instant real-time data streaming like chat.'
            }
          ],
          codingChallenges: [],
          miniChallenge: { title: 'Final Capstone Project', description: 'Deploy your complete SkillMate full stack application with verified peer exchange and AI tutoring!' },
          peerPracticePrompt: { title: 'Capstone Demo Showcase', description: 'Present your completed learning path and exchange feedback with fellow graduates!' }
        }
      ]
    },
    // Seed creative roadmap: Dance
    {
      id: 'rd_dance',
      goalTitle: 'Dance',
      category: 'Creative',
      totalLevels: 5,
      description: 'Master body rhythm, footwork, posture, musicality, and stage choreography.',
      levels: [
        {
          id: 'lvl_d1',
          levelNumber: 1,
          title: 'Rhythm, Stance & Warm-up Conditioning',
          shortName: 'Basics & Rhythm',
          description: 'Learn foundational body alignment, rhythm pulse counting, and dynamic muscle warm-ups.',
          learningObjectives: ['Master 4/4 and 8-count tempo', 'Develop balanced center of gravity'],
          topics: [{ id: 't_d_rhythm', title: 'The 8-Count Foundation', concept: 'Dance routines are structured around repeating musical 8-count measures.' }],
          mcqs: [{ id: 'mcq_d1', question: 'How many beats are typically counted in a standard dance phrase?', options: ['4 beats', '8 beats', '12 beats', '16 beats'], correctIndex: 1, explanation: 'Modern choreography is predominantly taught and structured around 8-count phrases.' }],
          codingChallenges: [],
          miniChallenge: { title: 'Record 8-Count Rhythm Video', description: 'Practice keeping steady 8-count timing with dynamic foot steps.' },
          peerPracticePrompt: { title: 'Dance Rhythm Jam', description: 'Warm up together over video call and count tempo in unison.' }
        },
        { id: 'lvl_d2', levelNumber: 2, title: 'Footwork & Transitions', shortName: 'Footwork', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Step Combination', description: 'Perform 4 connected foot transitions.' } },
        { id: 'lvl_d3', levelNumber: 3, title: 'Body Isolations & Flow', shortName: 'Isolations', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Chest & Shoulder Isolations', description: 'Isolate movement to rhythm.' } },
        { id: 'lvl_d4', levelNumber: 4, title: 'Choreography Routine', shortName: 'Choreography', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: '1-Minute Routine', description: 'Combine steps into sequence.' } },
        { id: 'lvl_d5', levelNumber: 5, title: 'Performance & Musicality', shortName: 'Performance', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Stage Delivery', description: 'Expressive movement piece.' } }
      ]
    },
    // Seed creative roadmap: Music
    {
      id: 'rd_music',
      goalTitle: 'Music',
      category: 'Creative',
      totalLevels: 5,
      description: 'Master musical ear training, notation, scale mechanics, rhythm, and expressive improvisation.',
      levels: [
        {
          id: 'lvl_m1',
          levelNumber: 1,
          title: 'Musical Notation & Scale Fundamentals',
          shortName: 'Basics & Notation',
          description: 'Learn treble and bass clefs, note durations, and major/minor scales.',
          learningObjectives: ['Read sheet music notes', 'Understand whole and half steps'],
          topics: [{ id: 't_m_notes', title: 'Reading Pitch & Staff', concept: 'The five lines of the staff denote standard pitches in Western music.' }],
          mcqs: [{ id: 'mcq_m1', question: 'What note sits on the first line of the treble clef staff?', options: ['C', 'E', 'G', 'F'], correctIndex: 1, explanation: 'Every Good Boy Does Fine: E is the first bottom line.' }],
          codingChallenges: [],
          miniChallenge: { title: 'Scale Recitation', description: 'Perform C Major scale ascending and descending with steady tempo.' },
          peerPracticePrompt: { title: 'Ear Training Pairing', description: 'Play notes or sing pitches and have your peer identify intervals.' }
        },
        { id: 'lvl_m2', levelNumber: 2, title: 'Chords & Harmonies', shortName: 'Chords', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Triad Progressions', description: 'Play I-IV-V progression.' } },
        { id: 'lvl_m3', levelNumber: 3, title: 'Rhythm & Syncopation', shortName: 'Rhythm', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Syncopated Groove', description: 'Maintain complex rhythm.' } },
        { id: 'lvl_m4', levelNumber: 4, title: 'Improvisation & Ear Training', shortName: 'Improvisation', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Pentatonic Solo', description: 'Improvise over backing track.' } },
        { id: 'lvl_m5', levelNumber: 5, title: 'Live Performance & Songcraft', shortName: 'Performance', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Full Song Presentation', description: 'Complete live piece.' } }
      ]
    },
    // Seed technical roadmap: Python
    {
      id: 'rd_python',
      goalTitle: 'Python Development',
      category: 'Technical',
      totalLevels: 5,
      description: 'Master Python from scripting basics to object-oriented design and web automation.',
      levels: [
        {
          id: 'lvl_p1',
          levelNumber: 1,
          title: 'Python Syntax & Data Types',
          shortName: 'Python Basics',
          description: 'Variables, loops, conditionals, strings, and standard collections.',
          learningObjectives: ['Understand indentation and dynamic typing', 'Master lists, dictionaries, and tuples'],
          topics: [{ id: 't_py_intro', title: 'Python Syntax & Philosophy', concept: 'Python values readability and concise, clean syntax.' }],
          mcqs: [{ id: 'mcq_p1', question: 'Which keyword creates a function in Python?', options: ['func', 'def', 'function', 'lambda'], correctIndex: 1, explanation: 'The "def" keyword is used to define functions in Python.' }],
          codingChallenges: [],
          miniChallenge: { title: 'Number Guessing Script', description: 'Write a program checking user guesses against a random integer.' },
          peerPracticePrompt: { title: 'Python Code Review', description: 'Review list comprehensions vs traditional for-loops.' }
        },
        { id: 'lvl_p2', levelNumber: 2, title: 'Functions & Modules', shortName: 'Functions', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Math Utility Module', description: 'Create reusable functions.' } },
        { id: 'lvl_p3', levelNumber: 3, title: 'Object Oriented Programming', shortName: 'OOP', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Student Management Class', description: 'Encapsulate attributes and methods.' } },
        { id: 'lvl_p4', levelNumber: 4, title: 'File I/O & Exception Handling', shortName: 'File I/O', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'CSV Report Generator', description: 'Parse data with try/except blocks.' } },
        { id: 'lvl_p5', levelNumber: 5, title: 'API Integration & Automation', shortName: 'Web & APIs', topics: [], mcqs: [], codingChallenges: [], miniChallenge: { title: 'Automated Weather Fetcher', description: 'Use requests library to parse JSON.' } }
      ]
    }
  ];

  // 4. Seed Swedha's active roadmap for the complete demo walkthrough
  store.userProgress = [
    {
      userId: 'usr_swedha',
      goalId: 'rd_fullstack',
      goalTitle: 'Full Stack Development',
      currentLevelId: 'lvl_1',
      currentLevelNumber: 1,
      overallProgress: 10,
      completedLevels: [],
      levelProgress: {
        'lvl_1': {
          status: 'in_progress',
          topicsViewed: ['t_html_struct', 't_html_tags'],
          mcqScore: 0,
          mcqAttempts: 0,
          practiceDone: false,
          challengeDone: false
        },
        'lvl_2': { status: 'locked' },
        'lvl_3': { status: 'locked' },
        'lvl_4': { status: 'locked' },
        'lvl_5': { status: 'locked' },
        'lvl_6': { status: 'locked' },
        'lvl_7': { status: 'locked' },
        'lvl_8': { status: 'locked' },
        'lvl_9': { status: 'locked' },
        'lvl_10': { status: 'locked' }
      }
    }
  ];

  // 5. Seed Pre-existing Connection between Swedha and Priya
  store.connections = [
    {
      id: 'conn_swedha_priya',
      requesterId: 'usr_swedha',
      recipientId: 'usr_priya',
      status: 'accepted',
      skillOffered: 'Python',
      skillRequested: 'Java',
      matchScore: 95,
      reasons: [
        'Priya teaches Java',
        'You teach Python',
        'Both want each other\'s skills',
        'Compatible availability (Weekdays 6:00 PM)'
      ],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];

  // 6. Seed Sample Messages between Swedha and Priya
  store.messages = [
    {
      id: 'msg_1',
      senderId: 'usr_swedha',
      receiverId: 'usr_priya',
      content: 'Hi Priya! I saw you are learning Python and teach Java. Would you like to do a skill exchange session?',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'msg_2',
      senderId: 'usr_priya',
      receiverId: 'usr_swedha',
      content: 'Hello Swedha! That sounds awesome. I can help you with Java OOP and Spring Boot basics anytime!',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
    },
    {
      id: 'msg_3',
      senderId: 'usr_swedha',
      receiverId: 'usr_priya',
      content: 'Awesome! Let us schedule an online session for today evening at 7:00 PM.',
      read: true,
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
    }
  ];

  // 7. Seed Sample Practice Task from Priya to Swedha
  store.practiceTasks = [
    {
      id: 'pt_java_oop',
      creatorId: 'usr_priya',
      creatorName: 'Priya Sharma',
      assignedToId: 'usr_swedha',
      skill: 'Java',
      title: 'Java OOP Challenge: Classes & Encapsulation',
      description: 'Test your understanding of private fields, getters/setters, and constructor overloading in Java.',
      difficulty: 'Medium',
      timeMinutes: 20,
      questions: [
        {
          id: 'q1',
          question: 'What is the keyword in Java used to restrict direct access to a class member from outside the class?',
          type: 'mcq',
          options: ['protected', 'private', 'static', 'final'],
          sampleAnswer: 'private'
        },
        {
          id: 'q2',
          question: 'Explain what happens if you do not define any constructor in a Java class.',
          type: 'text',
          sampleAnswer: 'The Java compiler automatically inserts a default no-argument constructor.'
        }
      ],
      status: 'assigned',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    }
  ];

  // 8. Seed Sample Scheduled Session
  store.sessions = [
    {
      id: 'sess_swedha_priya',
      mentorId: 'usr_priya',
      mentorName: 'Priya Sharma',
      mentorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      learnerId: 'usr_swedha',
      learnerName: 'Swedha Jasmine',
      learnerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      skill: 'Java',
      topic: 'Java OOP Fundamentals & Inheritance',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '19:00',
      durationMinutes: 60,
      mode: 'online',
      meetingLink: 'http://localhost:5173/meeting/sm-demo101',
      isDemoMeeting: true,
      status: 'scheduled',
      agenda: [
        { time: '10 min', topic: 'Concept Revision', description: 'Review class definitions, references and heap memory in Java' },
        { time: '20 min', topic: 'Encapsulation & Access Modifiers', description: 'Live coding walkthrough of private fields and getters/setters' },
        { time: '20 min', topic: 'Coding Practice Challenge', description: 'Swedha implements a StudentRecord manager class' },
        { time: '10 min', topic: 'Q&A & Feedback Exchange', description: 'Clear doubts and award Skill Credits and ratings' }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  // 9. Seed Credit Transactions
  store.credits = [
    {
      id: 'tx_welcome',
      userId: 'usr_swedha',
      amount: 100,
      type: 'welcome_bonus',
      description: '🎉 Welcome to SkillMate Bonus',
      balanceAfter: 100,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 'tx_teach',
      userId: 'usr_swedha',
      amount: 20,
      type: 'teaching_session',
      description: 'Taught Python Basics peer session',
      balanceAfter: 120,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  // 10. Seed Notifications
  store.notifications = [
    {
      id: 'notif_1',
      userId: 'usr_swedha',
      title: '🤝 Connection Accepted',
      message: 'Priya accepted your SkillMate connection request!',
      type: 'connection_accepted',
      read: false,
      actionLink: '/messages',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'notif_2',
      userId: 'usr_swedha',
      title: '📅 Session Scheduled',
      message: 'Your Java OOP session with Priya is confirmed for 7:00 PM.',
      type: 'session_scheduled',
      read: false,
      actionLink: '/sessions',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString()
    },
    {
      id: 'notif_3',
      userId: 'usr_swedha',
      title: '📝 Practice Assigned',
      message: 'Priya sent you a "Java OOP Challenge" practice task.',
      type: 'practice_assigned',
      read: false,
      actionLink: '/practice',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  ];

  // 11. Seed Assessments
  store.assessments = [
    {
      id: 'asm_fullstack_beg',
      skill: 'Full Stack Development',
      level: 'Beginner Diagnostic Assessment',
      title: 'Full Stack Beginner Diagnostic',
      description: 'Take this quick 5-minute diagnostic to assess your starting skill level and calibrate your learning path.',
      questions: [
        {
          id: 'aq1',
          question: 'What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Hyperlink and Text Management Level',
            'Home Tool Markup Language'
          ],
          correctIndex: 0,
          topic: 'HTML Fundamentals'
        },
        {
          id: 'aq2',
          question: 'Which CSS property defines the space between the content and the border of an element?',
          options: ['margin', 'padding', 'outline', 'spacing'],
          correctIndex: 1,
          topic: 'CSS Box Model'
        },
        {
          id: 'aq3',
          question: 'What is the correct syntax for declaring a constant variable in JavaScript?',
          options: ['constant x = 10;', 'var const x = 10;', 'const x = 10;', 'let constant x = 10;'],
          correctIndex: 2,
          topic: 'JavaScript Basics'
        },
        {
          id: 'aq4',
          question: 'Which HTTP method is typically used to request data from a server without side effects?',
          options: ['POST', 'PUT', 'GET', 'DELETE'],
          correctIndex: 2,
          topic: 'HTTP & REST APIs'
        },
        {
          id: 'aq5',
          question: 'Which command initializes a new Git repository in the current folder?',
          options: ['git start', 'git create', 'git init', 'git setup'],
          correctIndex: 2,
          topic: 'Git Version Control'
        }
      ]
    },
    {
      id: 'asm_frontend_periodic',
      skill: 'Full Stack Development',
      level: 'Periodic Frontend Milestone',
      title: 'Frontend Milestone Assessment (HTML, CSS, JS)',
      description: 'Comprehensive review to test your mastery across frontend technologies.',
      questions: [
        {
          id: 'ap1',
          question: 'Which HTML5 semantic element is best suited for navigation links?',
          options: ['<menu>', '<nav>', '<links>', '<navigate>'],
          correctIndex: 1,
          topic: 'HTML Semantic'
        },
        {
          id: 'ap2',
          question: 'In Flexbox, which property controls wrapping onto multiple lines?',
          options: ['flex-wrap', 'flex-break', 'flex-flow-direction', 'wrap-items'],
          correctIndex: 0,
          topic: 'CSS Flexbox'
        },
        {
          id: 'ap3',
          question: 'What will [1, 2, 3].map(x => x * 2) return?',
          options: ['[2, 4, 6]', '[1, 2, 3, 2, 4, 6]', 'undefined', '6'],
          correctIndex: 0,
          topic: 'JavaScript Arrays'
        }
      ]
    }
  ];

  // 12. Seed Ratings
  store.ratings = [
    {
      id: 'rat_1',
      sessionId: 'sess_prev',
      reviewerId: 'usr_rahul',
      reviewerName: 'Rahul Verma',
      targetUserId: 'usr_swedha',
      teachingRating: 5,
      communicationRating: 5,
      knowledgeRating: 4.8,
      reliabilityRating: 5,
      feedback: 'Swedha was extremely patient and clearly explained Python loops with great practical examples!',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
    },
    {
      id: 'rat_2',
      sessionId: 'sess_prev_2',
      reviewerId: 'usr_swedha',
      reviewerName: 'Swedha Jasmine',
      targetUserId: 'usr_priya',
      teachingRating: 5,
      communicationRating: 5,
      knowledgeRating: 5,
      reliabilityRating: 5,
      feedback: 'Priya is an incredible Java mentor. Her explanations of OOP principles made concepts click immediately!',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ];

  saveStore();
  console.log('[Seed] Database successfully seeded with demo users, roadmaps, and activities!');
};

export default { seedDatabase };
