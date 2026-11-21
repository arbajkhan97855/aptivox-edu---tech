/**
 * Aptivox Bilingual Exam Translation Engine (Hindi & English)
 * Provides verified Hindi translations for questions, options, explanations, and exam UI.
 */

// Exact dictionary for core curriculum exam questions
const EXACT_QUESTION_TRANSLATIONS = {
  // HTML Basics - Paper 1
  'What does HTML stand for?': {
    q_hi: 'HTML का पूरा नाम (Full Form) क्या है?',
    a_hi: 'हाइपर टेक्स्ट मार्कअप लैंग्वेज (Hyper Text Markup Language)',
    b_hi: 'हाई टेक्स्ट मॉडर्न लैंग्वेज (High Text Modern Language)',
    c_hi: 'हाइपर ट्रांसफर मार्कअप लेवल (Hyper Transfer Markup Level)',
    d_hi: 'होम टूल मार्कअप लैंग्वेज (Home Tool Markup Language)',
    exp_hi: 'HTML का पूर्ण रूप HyperText Markup Language है, जो वेब पेजों को बनाने की मानक भाषा है।'
  },
  'Who is the inventor of the World Wide Web and HTML?': {
    q_hi: 'वर्ल्ड वाइड वेब (WWW) और HTML के आविष्कारक कौन हैं?',
    a_hi: 'बिल गेट्स (Bill Gates)',
    b_hi: 'टिम बर्नर्स-ली (Tim Berners-Lee)',
    c_hi: 'ब्रेंडन आइच (Brendan Eich)',
    d_hi: 'जेम्स गोस्लिंग (James Gosling)',
    exp_hi: 'सर टिम बर्नर्स-ली ने 1989-1990 में HTML और World Wide Web का आविष्कार किया था।'
  },
  'Which HTML element is used to define the title of a document?': {
    q_hi: 'दस्तावेज़ का शीर्षक (Title) परिभाषित करने के लिए किस HTML टैग का उपयोग किया जाता है?',
    a_hi: '<meta>',
    b_hi: '<head>',
    c_hi: '<title>',
    d_hi: '<header>',
    exp_hi: '<title> टैग ब्राउज़र के टाइटल बार या टैब में दिखने वाले शीर्षक को परिभाषित करता है।'
  },
  'Which is the largest heading tag in HTML?': {
    q_hi: 'HTML में सबसे बड़ा हेडिंग टैग कौन सा है?',
    a_hi: '<h6>',
    b_hi: '<head>',
    c_hi: '<heading>',
    d_hi: '<h1>',
    exp_hi: '<h1> सबसे महत्वपूर्ण और सबसे बड़ा हेडिंग टैग है।'
  },
  'What is the correct HTML element for inserting a line break?': {
    q_hi: 'HTML में लाइन ब्रेक (Line Break) डालने के लिए सही एलिमेंट कौन सा है?',
    a_hi: '<lb>',
    b_hi: '<break>',
    c_hi: '<br>',
    d_hi: '<newline>',
    exp_hi: '<br> टैग टेक्स्ट में नई लाइन शुरू करने के लिए उपयोग किया जाता है।'
  },
  'What is the correct HTML for creating a hyperlink?': {
    q_hi: 'हाइपरलिंक (Hyperlink) बनाने के लिए सही HTML कोड कौन सा है?',
    a_hi: '<a href="https://aptivox.in">Aptivox</a>',
    b_hi: '<a name="https://aptivox.in">Aptivox</a>',
    c_hi: '<link url="https://aptivox.in">Aptivox</link>',
    d_hi: '<a>https://aptivox.in</a>',
    exp_hi: '<a> टैग href एट्रिब्यूट के साथ हाइपरलिंक बनाने के लिए प्रयोग किया जाता है।'
  },
  'Which character is used to indicate an end tag in HTML?': {
    q_hi: 'HTML में एंड टैग (क्लोजिंग टैग) को दर्शाने के लिए किस वर्ण का उपयोग किया जाता है?',
    a_hi: '*',
    b_hi: '<',
    c_hi: '^',
    d_hi: '/',
    exp_hi: 'फॉरवर्ड स्लैश (/) का उपयोग टैग बंद करने के लिए किया जाता है, जैसे </p>।'
  },
  'How can you open a link in a new tab/browser window?': {
    q_hi: 'आप किसी लिंक को नए टैब या ब्राउज़र विंडो में कैसे खोल सकते हैं?',
    a_hi: '<a href="url" target="_blank">',
    b_hi: '<a href="url" new>',
    c_hi: '<a href="url" target="new">',
    d_hi: '<a href="url" window="_new">',
    exp_hi: 'target="_blank" ब्राउज़र को नए विंडो या टैब में लिंक खोलने का निर्देश देता है।'
  },
  'Which element is used to specify a footer for a document or section?': {
    q_hi: 'किसी दस्तावेज़ या सेक्शन का फुटर (Footer) निर्दिष्ट करने के लिए किस एलिमेंट का उपयोग किया जाता है?',
    a_hi: '<bottom>',
    b_hi: '<footer>',
    c_hi: '<section-footer>',
    d_hi: '<foot>',
    exp_hi: '<footer> टैग दस्तावेज़ या अनुभाग के फुटर को परिभाषित करता है।'
  },
  'What is the correct HTML for adding a background color?': {
    q_hi: 'बैकग्राउंड कलर जोड़ने के लिए सही HTML कौन सा है?',
    a_hi: '<body bg="yellow">',
    b_hi: '<body style="background-color:yellow;">',
    c_hi: '<background>yellow</background>',
    d_hi: '<body color="yellow">',
    exp_hi: 'आधुनिक HTML में CSS style="background-color: yellow;" का उपयोग होता है।'
  },
  'Which HTML attribute specifies an alternate text for an image, if the image cannot be displayed?': {
    q_hi: 'यदि इमेज प्रदर्शित नहीं हो पाती है, तो इमेज के लिए वैकल्पिक टेक्स्ट (Alternate Text) कौन सा एट्रिब्यूट प्रदान करता है?',
    a_hi: 'title',
    b_hi: 'src',
    c_hi: 'alt',
    d_hi: 'longdesc',
    exp_hi: 'alt एट्रिब्यूट स्क्रीन रीडर्स और टूटी हुई छवियों के लिए वैकल्पिक विवरण देता है।'
  },
  'Which HTML element is used to display a scalar measurement within a range?': {
    q_hi: 'किसी सीमा (Range) के भीतर स्केलर माप प्रदर्शित करने के लिए किस HTML एलिमेंट का उपयोग किया जाता है?',
    a_hi: '<range>',
    b_hi: '<meter>',
    c_hi: '<gauge>',
    d_hi: '<measure>',
    exp_hi: '<meter> एलिमेंट ज्ञात सीमा के भीतर एक मान को प्रदर्शित करता है।'
  },
  'What is the correct HTML for making a checkbox input?': {
    q_hi: 'चेकबॉक्स इनपुट बनाने के लिए सही HTML कौन सा है?',
    a_hi: '<input type="check">',
    b_hi: '<checkbox>',
    c_hi: '<input type="checkbox">',
    d_hi: '<check>',
    exp_hi: '<input type="checkbox"> से चेकबॉक्स कंट्रोल बनता है।'
  },
  'What is the correct HTML for making a text input area with multiple lines?': {
    q_hi: 'मल्टी-लाइन (कई पंक्तियों) का टेक्स्ट इनपुट एरिया बनाने के लिए सही HTML कौन सा है?',
    a_hi: '<input type="textbox">',
    b_hi: '<textarea>',
    c_hi: '<input type="text" multiline="true">',
    d_hi: '<text-multiline>',
    exp_hi: '<textarea> टैग मल्टी-लाइन टेक्स्ट इनपुट के लिए उपयोग किया जाता है।'
  },
  'Which HTML doctype declaration is correct for HTML5?': {
    q_hi: 'HTML5 के लिए कौन सा doctype डिक्लेरेशन सही है?',
    a_hi: '<!DOCTYPE html>',
    b_hi: '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 5.0//EN">',
    c_hi: '<!DOCTYPE HTML5>',
    d_hi: '<!DOCTYPE html-5>',
    exp_hi: '<!DOCTYPE html> HTML5 का सबसे संक्षिप्त और मानक doctype है।'
  },
  'Which HTML element is used to specify navigation links?': {
    q_hi: 'नेविगेशन लिंक (Navigation Links) का समूह बनाने के लिए किस HTML टैग का उपयोग होता है?',
    a_hi: '<navigation>',
    b_hi: '<nav>',
    c_hi: '<navigate>',
    d_hi: '<links>',
    exp_hi: '<nav> एलिमेंट नेविगेशन लिंक्स के सेट को परिभाषित करता है।'
  },
  'Which HTML tag is used for ordered (numbered) lists?': {
    q_hi: 'क्रमबद्ध (नंबर वाली सूची - Ordered List) के लिए किस HTML टैग का उपयोग किया जाता है?',
    a_hi: '<ul>',
    b_hi: '<dl>',
    c_hi: '<ol>',
    d_hi: '<list>',
    exp_hi: '<ol> ऑर्डर्ड लिस्ट बनाता है, जहाँ डिफ़ॉल्ट रूप से नंबर (1, 2, 3) प्रदर्शित होते हैं।'
  },
  'Which HTML element represents emphasized text that carries semantic importance?': {
    q_hi: 'कौन सा HTML एलिमेंट सिमेंटिक महत्व वाले एम्फैसाइज्ड (जोरदार) टेक्स्ट को दर्शाता है?',
    a_hi: '<i>',
    b_hi: '<bold>',
    c_hi: '<em>',
    d_hi: '<italic>',
    exp_hi: '<em> सिमेंटिक जोर (stress emphasis) को दर्शाता है।'
  },
  'Which input type defines a slider control in HTML5?': {
    q_hi: 'HTML5 में कौन सा इनपुट टाइप स्लाइडर कंट्रोल (Slider Control) को परिभाषित करता है?',
    a_hi: '<input type="slider">',
    b_hi: '<input type="range">',
    c_hi: '<input type="controls">',
    d_hi: '<input type="bar">',
    exp_hi: '<input type="range"> स्लाइडर कंट्रोल को परिभाषित करता है।'
  },
  'What is the purpose of the <meta charset="UTF-8"> tag?': {
    q_hi: '<meta charset="UTF-8"> टैग का मुख्य उद्देश्य क्या है?',
    a_hi: 'CSS वर्शन को परिभाषित करना',
    b_hi: 'HTML दस्तावेज़ के लिए कैरेक्टर एन्कोडिंग (Character Encoding) निर्दिष्ट करना',
    c_hi: 'स्क्रीन रेजोल्यूशन सेट करना',
    d_hi: 'जावास्क्रिप्ट इंजन निर्दिष्ट करना',
    exp_hi: 'UTF-8 दुनिया के लगभग सभी अक्षरों और प्रतीकों का समर्थन करता है।'
  },
  'Which HTML5 element is used for drawing graphics on the fly via JavaScript?': {
    q_hi: 'जावास्क्रिप्ट के जरिए रनटाइम पर ग्राफिक्स बनाने के लिए किस HTML5 एलिमेंट का उपयोग किया जाता है?',
    a_hi: '<svg>',
    b_hi: '<canvas>',
    c_hi: '<draw>',
    d_hi: '<graphic>',
    exp_hi: '<canvas> का उपयोग जावास्क्रिप्ट स्क्रिप्टिंग के माध्यम से ग्राफिक्स बनाने में होता है।'
  },
  'Which HTML tag is used to embed audio files natively in HTML5?': {
    q_hi: 'HTML5 में ऑडियो फाइलों को सीधे एम्बेड करने के लिए किस टैग का उपयोग किया जाता है?',
    a_hi: '<sound>',
    b_hi: '<audio>',
    c_hi: '<mp3>',
    d_hi: '<music>',
    exp_hi: '<audio> टैग ध्वनि और ऑडियो फाइल्स को एम्बेड करता है।'
  },
  'Which attribute in <video> allows automatic playback when loaded?': {
    q_hi: '<video> टैग में कौन सा एट्रिब्यूट पेज लोड होने पर वीडियो को अपने आप चालू करने की अनुमति देता है?',
    a_hi: 'autoplay',
    b_hi: 'play',
    c_hi: 'auto',
    d_hi: 'start="now"',
    exp_hi: 'autoplay वीडियो को अपने आप लोड होते ही चालू कर देता है।'
  },
  'What is the purpose of semantic HTML elements?': {
    q_hi: 'सिमेंटिक (Semantic) HTML एलिमेंट्स का मुख्य उद्देश्य क्या है?',
    a_hi: 'वे फाइल साइज को छोटा करते हैं',
    b_hi: 'वे ब्राउज़र और डेवलपर दोनों को अपने अर्थ और संरचना को स्पष्ट रूप से समझाते हैं',
    c_hi: 'वे PHP के लिए अनिवार्य हैं',
    d_hi: 'वे CSS स्टाइल को बंद कर देते हैं',
    exp_hi: '<header>, <article>, <footer> जैसे सिमेंटिक टैग्स सामग्री का स्पष्ट अर्थ बताते हैं।'
  },
  'Which HTML element represents independent, self-contained content such as a blog post or news story?': {
    q_hi: 'ब्लॉग पोस्ट या समाचार जैसी स्वतंत्र और पूर्ण सामग्री को दर्शाने के लिए किस HTML एलिमेंट का उपयोग किया जाता है?',
    a_hi: '<section>',
    b_hi: '<aside>',
    c_hi: '<article>',
    d_hi: '<div>',
    exp_hi: '<article> टैग स्वतंत्र रूप से वितरित की जा सकने वाली सामग्री को निर्दिष्ट करता है।'
  },
  'Which tag defines content aside from the content it is placed in (like a sidebar)?': {
    q_hi: 'मुख्य सामग्री के अतिरिक्त साइडबार जैसी सामग्री को परिभाषित करने के लिए कौन सा टैग उपयोग होता है?',
    a_hi: '<sidebar>',
    b_hi: '<aside>',
    c_hi: '<subcontent>',
    d_hi: '<margin>',
    exp_hi: '<aside> मुख्य सामग्री से संबंधित साइड कंटेंट (जैसे साइडबार) को दर्शाता है।'
  },
  'Which HTML attribute specifies that an input field must be filled out before submitting?': {
    q_hi: 'फॉर्म सबमिट करने से पहले कौन सा एट्रिब्यूट यह अनिवार्य करता है कि इनपुट फील्ड खाली न रहे?',
    a_hi: 'validate',
    b_hi: 'required',
    c_hi: 'necessary',
    d_hi: 'mandatory',
    exp_hi: 'required एट्रिब्यूट यह सुनिश्चित करता है कि फील्ड को खाली नहीं छोड़ा जा सकता।'
  },
  'Which element is used to group related elements in a form with a visible border?': {
    q_hi: 'फॉर्म में संबंधित इनपुट एलिमेंट्स को एक बॉर्डर के साथ समूहीकृत (Group) करने के लिए किस एलिमेंट का उपयोग किया जाता है?',
    a_hi: '<group>',
    b_hi: '<fieldset>',
    c_hi: '<block>',
    d_hi: '<form-group>',
    exp_hi: '<fieldset> टैग संबंधित फॉर्म एलिमेंट्स को एक दृश्य सीमा (बॉर्डर) के साथ समूहित करता है।'
  },
  'What is the caption element used specifically inside <fieldset>?': {
    q_hi: '<fieldset> के अंदर कैप्शन (शीर्षक) के रूप में किस एलिमेंट का उपयोग किया जाता है?',
    a_hi: '<label>',
    b_hi: '<legend>',
    c_hi: '<caption>',
    d_hi: '<title>',
    exp_hi: '<legend> टैग <fieldset> के लिए शीर्षक या कैप्शन को परिभाषित करता है।'
  },
  'What is the default method for an HTML form when not specified?': {
    q_hi: 'जब HTML फॉर्म में method निर्दिष्ट नहीं किया जाता है, तो डिफ़ॉल्ट मेथड कौन सा होता है?',
    a_hi: 'POST',
    b_hi: 'GET',
    c_hi: 'PUT',
    d_hi: 'FETCH',
    exp_hi: 'फॉर्म सबमिशन के लिए डिफ़ॉल्ट HTTP विधि GET होती है।'
  },
  'Which attribute specifies where to send the form-data when a form is submitted?': {
    q_hi: 'फॉर्म सबमिट होने पर फॉर्म का डेटा कहाँ भेजना है, यह कौन सा एट्रिब्यूट निर्धारित करता है?',
    a_hi: 'target',
    b_hi: 'action',
    c_hi: 'method',
    d_hi: 'route',
    exp_hi: 'action एट्रिब्यूट फॉर्म सबमिशन का टारगेट यूआरएल तय करता है।'
  },
  'Which HTML tag is used to define table rows?': {
    q_hi: 'टेबल में पंक्तियों (Rows) को परिभाषित करने के लिए किस HTML टैग का उपयोग किया जाता है?',
    a_hi: '<td>',
    b_hi: '<th>',
    c_hi: '<tr>',
    d_hi: '<table-row>',
    exp_hi: '<tr> टेबल की एक पंक्ति (Table Row) को परिभाषित करता है।'
  },
  'Which HTML tag defines a table header cell?': {
    q_hi: 'टेबल हेडर सेल (Table Header Cell) को परिभाषित करने के लिए किस HTML टैग का उपयोग होता है?',
    a_hi: '<td>',
    b_hi: '<th>',
    c_hi: '<head>',
    d_hi: '<cell-head>',
    exp_hi: '<th> टेबल हेडर सेल को परिभाषित करता है, जो बोल्ड और केंद्र में दिखता है।'
  },
  'How do you create an HTML comment?': {
    q_hi: 'HTML में कमेंट (टिप्पणी) कैसे बनाई जाती है?',
    a_hi: '// This is a comment',
    b_hi: '/* This is a comment */',
    c_hi: '<!-- This is a comment -->',
    d_hi: '# This is a comment',
    exp_hi: 'HTML में कमेंट <!-- टिप्पणी टेक्स्ट --> सिंटैक्स से बनाई जाती है।'
  },
  'Which HTML attribute provides a tooltip when hovering over an element?': {
    q_hi: 'किसी एलिमेंट पर माउस ले जाने पर टूलटिप (Tooltip) प्रदर्शित करने के लिए कौन सा एट्रिब्यूट उपयोग होता है?',
    a_hi: 'alt',
    b_hi: 'tooltip',
    c_hi: 'title',
    d_hi: 'hover',
    exp_hi: 'title एट्रिब्यूट माउस होवर करने पर टूलटिप प्रदर्शित करता है।'
  },
  'Which HTML element is used to highlight or mark text with a yellow background by default?': {
    q_hi: 'डिफ़ॉल्ट रूप से पीले बैकग्राउंड के साथ टेक्स्ट को हाइलाइट या मार्क करने के लिए किस एलिमेंट का उपयोग किया जाता है?',
    a_hi: '<highlight>',
    b_hi: '<mark>',
    c_hi: '<yellow>',
    d_hi: '<em>',
    exp_hi: '<mark> एलिमेंट टेक्स्ट को हाइलाइट करता है।'
  },
  'What is the correct tag for superscript text in HTML (e.g., x²)?': {
    q_hi: 'HTML में सुपरस्क्रिप्ट टेक्स्ट (जैसे x²) के लिए सही टैग कौन सा है?',
    a_hi: '<super>',
    b_hi: '<sup>',
    c_hi: '<sub>',
    d_hi: '<up>',
    exp_hi: '<sup> सामान्य बेसलाइन से ऊपर सुपरस्क्रिप्ट टेक्स्ट दिखाता है।'
  },
  'What is the correct tag for subscript text in HTML (e.g., H₂O)?': {
    q_hi: 'HTML में सबस्क्रिप्ट टेक्स्ट (जैसे H₂O) के लिए सही टैग कौन सा है?',
    a_hi: '<subscript>',
    b_hi: '<down>',
    c_hi: '<sub>',
    d_hi: '<sup>',
    exp_hi: '<sub> सामान्य बेसलाइन से नीचे सबस्क्रिप्ट टेक्स्ट दिखाता है।'
  },
  'Which tag defines preformatted text where whitespace and line breaks are preserved?': {
    q_hi: 'कौन सा टैग प्रीफॉर्मेटेड टेक्स्ट को दर्शाता है जहाँ स्पेस और लाइन ब्रेक वैसे ही रहते हैं?',
    a_hi: '<code>',
    b_hi: '<pre>',
    c_hi: '<format>',
    d_hi: '<samp>',
    exp_hi: '<pre> टैग में लिखे टेक्स्ट के सभी रिक्त स्थान और पंक्तियाँ सुरक्षित रहती हैं।'
  },
  'Which HTML element is used to embed an external webpage or document?': {
    q_hi: 'बाहरी वेबपेज या दस्तावेज़ को अपने पेज में एम्बेड करने के लिए किस HTML टैग का उपयोग होता है?',
    a_hi: '<embed-page>',
    b_hi: '<iframe>',
    c_hi: '<web-view>',
    d_hi: '<frame>',
    exp_hi: '<iframe> का उपयोग वेबपेज के अंदर दूसरा वेबपेज दिखाने के लिए किया जाता है।'
  },
  'Which HTML attribute specifies that an audio or video file should start over again every time it finishes?': {
    q_hi: 'कौन सा एट्रिब्यूट यह तय करता है कि ऑडियो या वीडियो समाप्त होते ही अपने आप दोबारा शुरू हो जाए?',
    a_hi: 'repeat',
    b_hi: 'loop',
    c_hi: 'replay',
    d_hi: 'infinite',
    exp_hi: 'loop एट्रिब्यूट मीडिया फाइल को बार-बार दोहराने का काम करता है।'
  },
  'What is the purpose of the <noscript> tag in HTML?': {
    q_hi: 'HTML में <noscript> टैग का क्या उद्देश्य है?',
    a_hi: 'पेज पर जावास्क्रिप्ट बंद करना',
    b_hi: 'यदि ब्राउज़र में जावास्क्रिप्ट अक्षम (Disabled) है तो वैकल्पिक सामग्री प्रदर्शित करना',
    c_hi: 'वायरस को रोकना',
    d_hi: 'स्क्रिप्ट एरर को लॉग करना',
    exp_hi: '<noscript> तब दिखता है जब ब्राउज़र जावास्क्रिप्ट को सपोर्ट नहीं करता या वह डिसेबल्ड हो।'
  },
  'Which tag defines a drop-down list in an HTML form?': {
    q_hi: 'HTML फॉर्म में ड्रॉप-डाउन सूची (Drop-down List) बनाने के लिए किस टैग का उपयोग होता है?',
    a_hi: '<dropdown>',
    b_hi: '<list>',
    c_hi: '<select>',
    d_hi: '<input type="dropdown">',
    exp_hi: '<select> टैग से ड्रॉप-डाउन सूची बनाई जाती है।'
  },
  'Which element defines an option in a drop-down list?': {
    q_hi: 'ड्रॉप-डाउन सूची में विकल्पों (Options) को कौन सा एलिमेंट परिभाषित करता है?',
    a_hi: '<item>',
    b_hi: '<option>',
    c_hi: '<list-item>',
    d_hi: '<choice>',
    exp_hi: '<option> टैग <select> के अंदर विभिन्न विकल्पों को दर्शाता है।'
  },
  'Which HTML tag is used for keyboard input display in documentation?': {
    q_hi: 'डॉक्यूमेंटेशन में कीबोर्ड इनपुट (Keyboard Key) प्रदर्शित करने के लिए कौन सा टैग उपयोग होता है?',
    a_hi: '<key>',
    b_hi: '<kbd>',
    c_hi: '<button>',
    d_hi: '<input>',
    exp_hi: '<kbd> कीबोर्ड इनपुट या शॉर्टकट कीज को दर्शाने के लिए मानक टैग है।'
  },
  'Which HTML5 element represents a disclosure widget from which the user can obtain additional information?': {
    q_hi: 'कौन सा HTML5 एलिमेंट डिस्क्लोजर विजेट (ड्रॉपडाउन अकॉर्डियन) को दर्शाता है जिससे अतिरिक्त जानकारी मिल सकती है?',
    a_hi: '<details>',
    b_hi: '<summary>',
    c_hi: '<accordion>',
    d_hi: '<popup>',
    exp_hi: '<details> टैग एक इंटरैक्टिव विजेट बनाता है जिसे यूजर खोल और बंद कर सकता है।'
  },
  'Which tag is used as a summary/heading for a <details> element?': {
    q_hi: '<details> एलिमेंट के लिए सारांश या दृश्य हेडिंग के रूप में कौन सा टैग उपयोग होता है?',
    a_hi: '<heading>',
    b_hi: '<title>',
    c_hi: '<summary>',
    d_hi: '<caption>',
    exp_hi: '<summary> टैग <details> विजेट के मुख्य शीर्षक को प्रदर्शित करता है।'
  },
  'Which input type is specifically optimized for entering telephone numbers on mobile keyboards?': {
    q_hi: 'मोबाइल कीबोर्ड पर टेलीफोन नंबर दर्ज करने के लिए कौन सा इनपुट टाइप अनुकूलित (Optimized) है?',
    a_hi: '<input type="number">',
    b_hi: '<input type="tel">',
    c_hi: '<input type="phone">',
    d_hi: '<input type="digits">',
    exp_hi: '<input type="tel"> मोबाइल स्क्रीन पर टेलीफोन डायल पैड खोलता है।'
  },
  'What is the default display value of a <div> element in CSS?': {
    q_hi: 'CSS में <div> एलिमेंट का डिफ़ॉल्ट डिस्प्ले मान (display value) क्या होता है?',
    a_hi: 'inline',
    b_hi: 'inline-block',
    c_hi: 'block',
    d_hi: 'flex',
    exp_hi: '<div> एक ब्लॉक-लेवल (block) एलिमेंट होता है जो पूरी चौड़ाई घेरता है।'
  },
  'What is the default display value of a <span> element in CSS?': {
    q_hi: 'CSS में <span> एलिमेंट का डिफ़ॉल्ट डिस्प्ले मान (display value) क्या होता है?',
    a_hi: 'block',
    b_hi: 'inline',
    c_hi: 'none',
    d_hi: 'table',
    exp_hi: '<span> एक इनलाइन (inline) एलिमेंट है जिसका उपयोग टेक्स्ट के हिस्सों को स्टाइल करने के लिए होता है।'
  },

  // CSS Questions
  'What does CSS stand for?': {
    q_hi: 'CSS का पूरा नाम (Full Form) क्या है?',
    a_hi: 'कैस्केडिंग स्टाइल शीट्स (Cascading Style Sheets)',
    b_hi: 'कंप्यूटर स्टाइल सिंटैक्स (Computer Style Syntax)',
    c_hi: 'क्रिएटिव शीट सिस्टम (Creative Sheet System)',
    d_hi: 'कलरफुल स्टाइल शीट्स (Colorful Style Sheets)',
    exp_hi: 'CSS का अर्थ Cascading Style Sheets है, जिसका उपयोग वेब पेजों के लेआउट और डिज़ाइन को नियंत्रित करने के लिए किया जाता है।'
  },
  'Which CSS property is used to change text color?': {
    q_hi: 'टेक्स्ट का रंग बदलने के लिए किस CSS प्रॉपर्टी का उपयोग किया जाता है?',
    a_hi: 'text-color',
    b_hi: 'color',
    c_hi: 'font-color',
    d_hi: 'text-style',
    exp_hi: 'CSS में टेक्स्ट का रंग बदलने के लिए सीधे "color" प्रॉपर्टी का उपयोग किया जाता है।'
  },
  'Which property is used to change font family?': {
    q_hi: 'फ़ॉन्ट फैमिली (Font Style) बदलने के लिए किस CSS प्रॉपर्टी का उपयोग किया जाता है?',
    a_hi: 'font-family',
    b_hi: 'font-style',
    c_hi: 'typeface',
    d_hi: 'text-font',
    exp_hi: 'फ़ॉन्ट का प्रकार (जैसे Arial, Roboto) बदलने के लिए font-family का उपयोग होता है।'
  },
  'How do you center an element horizontally using margin?': {
    q_hi: 'margin का उपयोग करके किसी ब्लॉक एलिमेंट को क्षैतिज रूप से (Horizontally) केंद्र में कैसे लाते हैं?',
    a_hi: 'margin: 0 center;',
    b_hi: 'margin: 0 auto;',
    c_hi: 'margin: auto 0;',
    d_hi: 'margin: center;',
    exp_hi: 'margin: 0 auto; ब्लॉक स्तर के एलिमेंट को केंद्र में संरेखित करता है।'
  },
  'Which CSS box model component is between padding and margin?': {
    q_hi: 'CSS बॉक्स मॉडल में पैडिंग (Padding) और मार्जिन (Margin) के बीच कौन सा घटक होता है?',
    a_hi: 'कंटेंट (Content)',
    b_hi: 'बॉर्डर (Border)',
    c_hi: 'आउटलाइन (Outline)',
    d_hi: 'गैप (Gap)',
    exp_hi: 'बॉक्स मॉडल का क्रम है: Content -> Padding -> Border -> Margin।'
  }
};

/**
 * Exact translations for common and multiple-choice options across all exam papers
 */
export const EXACT_OPTION_TRANSLATIONS = {
  // Common IT & Web options
  'Hyper Text Markup Language': 'हाइपर टेक्स्ट मार्कअप लैंग्वेज (Hyper Text Markup Language)',
  'High Text Modern Language': 'हाई टेक्स्ट मॉडर्न लैंग्वेज (High Text Modern Language)',
  'Hyper Transfer Markup Level': 'हाइपर ट्रांसफर मार्कअप लेवल (Hyper Transfer Markup Level)',
  'Home Tool Markup Language': 'होम टूल मार्कअप लैंग्वेज (Home Tool Markup Language)',
  'Bill Gates': 'बिल गेट्स (Bill Gates)',
  'Tim Berners-Lee': 'टिम बर्नर्स-ली (Tim Berners-Lee)',
  'Brendan Eich': 'ब्रेंडन आइच (Brendan Eich)',
  'James Gosling': 'जेम्स गोस्लिंग (James Gosling)',
  'Defines CSS version': 'CSS वर्शन को परिभाषित करता है',
  'Specifies character encoding for the HTML document': 'HTML दस्तावेज़ के लिए कैरेक्टर एन्कोडिंग (Character Encoding) निर्दिष्ट करता है',
  'Defines screen resolution': 'स्क्रीन रिज़ॉल्यूशन को परिभाषित करता है',
  'Specifies JavaScript engine': 'जावास्क्रिप्ट इंजन निर्दिष्ट करता है',
  'They make the file smaller': 'वे फ़ाइल का आकार छोटा करते हैं',
  'They clearly describe their meaning to both the browser and developer': 'वे ब्राउज़र और डेवलपर दोनों के लिए अपने अर्थ और संरचना का स्पष्ट वर्णन करते हैं',
  'They are required for PHP': 'वे PHP के लिए आवश्यक हैं',
  'They disable CSS styles': 'वे CSS शैलियों को अक्षम करते हैं',
  'Disables JavaScript on page': 'पेज पर जावास्क्रिप्ट बंद करता है',
  'Displays alternate content if JavaScript is disabled in the browser': 'यदि ब्राउज़र में जावास्क्रिप्ट अक्षम है तो वैकल्पिक सामग्री प्रदर्शित करता है',
  'Blocks harmful viruses': 'हानिकारक वायरस को रोकता है',
  'Logs script errors': 'स्क्रिप्ट त्रुटियों को लॉग करता है',
  'Standard semantic tags like <main>, <header> and <section> increase SEO ranking and accessibility score.': 'मानक सिमेंटिक टैग जैसे <main>, <header> और <section> SEO रैंकिंग और सुगमता स्कोर बढ़ाते हैं।',
  'Using <div> tags for all elements is faster and more compliant with WCAG 2.1 guidelines.': 'सभी तत्वों के लिए <div> टैग का उपयोग करना तेज़ है और WCAG 2.1 दिशानिर्देशों का अधिक अनुपालन करता है।',
  'HTML5 requires closing tags for <img> and <br> with XML-style slashes.': 'HTML5 को XML-शैली के स्लैश के साथ <img> और <br> के लिए क्लोजिंग टैग की आवश्यकता होती है।',
  'All heading tags <h1> through <h6> must be nested inside an <aside> block.': '<h1> से <h6> तक के सभी हेडिंग टैग को <aside> ब्लॉक के अंदर नेस्टेड होना चाहिए।',
  'Cascading Style Sheets': 'कैस्केडिंग स्टाइल शीट्स (Cascading Style Sheets)',
  'Computer Style Syntax': 'कंप्यूटर स्टाइल सिंटैक्स',
  'Creative Sheet System': 'क्रिएटिव शीट सिस्टम',
  'Colorful Style Sheets': 'कलरफुल स्टाइल शीट्स',
  'text-color': 'text-color (टेक्स्ट कलर)',
  'color': 'color (कलर)',
  'font-color': 'font-color (फ़ॉन्ट कलर)',
  'text-style': 'text-style (टेक्स्ट स्टाइल)',
  'font-family': 'font-family (फ़ॉन्ट शैली)',
  'font-style': 'font-style (फ़ॉन्ट स्टाइल)',
  'typeface': 'typeface (टाइपफेस)',
  'text-font': 'text-font (टेक्स्ट फ़ॉन्ट)',
  'margin: 0 center;': 'margin: 0 center;',
  'margin: 0 auto;': 'margin: 0 auto;',
  'margin: auto 0;': 'margin: auto 0;',
  'margin: center;': 'margin: center;',
  'Content': 'कंटेंट (Content)',
  'Border': 'बॉर्डर (Border)',
  'Outline': 'आउटलाइन (Outline)',
  'Gap': 'गैप (Gap)',
  'Applies cascading styles with high specificity and clean inheritance.': 'उच्च विशिष्टता और स्वच्छ इनहेरिटेंस के साथ कैस्केडिंग शैलियों को लागू करता है।',
  'Disables rendering in WebKit and Blink browser engines.': 'WebKit और Blink ब्राउज़र इंजन में रेंडरिंग को अक्षम करता है।',
  'Forces synchronous repaint on every DOM mutation.': 'प्रत्येक DOM म्यूटेशन पर सिंक्रोनस रीपेंट को बाध्य करता है।',
  'Overwrites all browser default user-agent properties completely.': 'सभी ब्राउज़र डिफ़ॉल्ट यूजर-एजेंट गुणों को पूरी तरह से अधिलेखित करता है।',
  'Call stack executes synchronous code, while microtasks (Promises) run before macrotasks (setTimeout).': 'कॉल स्टैक सिंक्रोनस कोड निष्पादित करता है, जबकि माइक्रोटास्क (Promises) मैक्रोटास्क (setTimeout) से पहले चलते हैं।',
  'JavaScript creates a new thread for every function call in modern V8.': 'जावास्क्रिप्ट आधुनिक V8 में प्रत्येक फ़ंक्शन कॉल के लिए एक नया थ्रेड बनाता है।',
  'Closures immediately release outer variables to garbage collector on return.': 'क्लोज़र रिटर्न होने पर तुरंत बाहरी चर को कचरा कलेक्टर में छोड़ देते हैं।',
  "All variables declared with 'const' are deeply immutable and cannot mutate properties.": "'const' के साथ घोषित सभी चर पूरी तरह से अपरिवर्तनीय होते हैं और गुणों को संशोधित नहीं कर सकते।",
  'Python uses indentation to define code blocks instead of curly braces.': 'पायथन कर्ली ब्रेसेस के बजाय कोड ब्लॉक को परिभाषित करने के लिए इंडेंटेशन (Indentation) का उपयोग करता है।',
  'Lists in Python are immutable while Tuples are mutable.': 'पायथन में सूचियाँ (Lists) अपरिवर्तनीय हैं जबकि टुपल्स (Tuples) परिवर्तनीय हैं।',
  "The 'def' keyword is used to declare global constants.": "'def' कीवर्ड का उपयोग ग्लोबल स्थिरांक घोषित करने के लिए किया जाता है।",
  'Python code must be compiled into machine binaries before execution.': 'निष्पादन से पहले पायथन कोड को मशीन बाइनरी में संकलित किया जाना चाहिए।',
  'CPU (Central Processing Unit) acts as the brain of the computer executing arithmetic and logic instructions.': 'CPU (सेंट्रल प्रोसेसिंग यूनिट) अंकगणितीय और तार्किक निर्देशों को निष्पादित करने वाले कंप्यूटर के मस्तिष्क के रूप में कार्य करता है।',
  'RAM is permanent secondary storage that preserves data when power is turned off.': 'RAM स्थायी द्वितीयक मेमोरी है जो पावर बंद होने पर भी डेटा को सुरक्षित रखती है।',
  'Monitor is an input device used to enter data.': 'मॉनिटर डेटा दर्ज करने के लिए उपयोग किया जाने वाला एक इनपुट डिवाइस है।',
  'Operating System cannot manage file storage or memory.': 'ऑपरेटिंग सिस्टम फ़ाइल स्टोरेज या मेमोरी का प्रबंधन नहीं कर सकता है।',
  'XLOOKUP searches both vertically and horizontally with exact match by default.': 'XLOOKUP डिफ़ॉल्ट रूप से सटीक मिलान के साथ लंबवत (vertically) और क्षैतिज (horizontally) दोनों तरह से खोज करता है।',
  'VLOOKUP can look up values to the left without helper columns.': 'VLOOKUP सहायक कॉलम के बिना बाईं ओर के मानों को देख सकता है।',
  'Pivot tables permanently destroy underlying raw data.': 'पिवट टेबल मूल कच्चे डेटा को स्थायी रूप से नष्ट कर देते हैं।',
  'Formulas in Excel must begin with an exclamation mark (!).': 'एक्सेल में फ़ॉर्मूले विस्मयादिबोधक चिह्न (!) से शुरू होने चाहिए।',
  'Standard practice follows industry conventions, proper syntax, structure and robust error handling.': 'मानक अभ्यास उद्योग सम्मेलनों, उचित सिंटैक्स, संरचना और मजबूत त्रुटि प्रबंधन का पालन करता है।',
  'Deprecated approach that causes runtime failures and syntax incompatibilities.': 'अप्रचलित दृष्टिकोण जो रनटाइम विफलता और सिंटैक्स असंगति का कारण बनता है।',
  'Randomized approach without type validation or proper environment variable setup.': 'टाइप सत्यापन या उचित वातावरण चर सेटअप के बिना यादृच्छिक दृष्टिकोण।',
  'Bypasses security guidelines and produces memory leaks in execution.': 'सुरक्षा दिशानिर्देशों को दरकिनार करता है और निष्पादन में मेमोरी लीक उत्पन्न करता है।',
  'inline': 'इनलाइन (inline)',
  'inline-block': 'इनलाइन-ब्लॉक (inline-block)',
  'block': 'ब्लॉक (block)',
  'flex': 'फ्लेक्स (flex)',
  'none': 'कोई नहीं (none)',
  'table': 'टेबल (table)',
  'POST': 'POST',
  'GET': 'GET',
  'PUT': 'PUT',
  'FETCH': 'FETCH',
  'target': 'target',
  'action': 'action',
  'method': 'method',
  'route': 'route',
  'tooltip': 'tooltip (टूलटिप)',
  'hover': 'hover (होवर)',
  'validate': 'validate (सत्यापित करें)',
  'required': 'required (अनिवार्य)',
  'necessary': 'necessary (आवश्यक)',
  'mandatory': 'mandatory (अनिवार्य)',
  'repeat': 'repeat (दोहराएं)',
  'loop': 'loop (लूप)',
  'replay': 'replay (पुनः चलाएं)',
  'infinite': 'infinite (अनंत)',
  'autoplay': 'autoplay',
  'play': 'play',
  'auto': 'auto',
  'start="now"': 'start="now"',
  'True': 'सत्य (True)',
  'False': 'असत्य (False)',
  'None of the above': 'उपरोक्त में से कोई नहीं',
  'All of the above': 'उपरोक्त सभी (All of the above)',
  'Both A and B': 'A और B दोनों'
};

/**
 * Intelligent Rule-Based Hindi Translator for questions in any subject (JS, Python, Office, RS-CIT, DM, Graphic etc.)
 */
export function translateToHindi(englishText, type = 'QUESTION') {
  if (!englishText || typeof englishText !== 'string') return englishText;

  const trimmed = englishText.trim();

  // 1. Direct match in Option Dictionary
  if (EXACT_OPTION_TRANSLATIONS[trimmed]) {
    return EXACT_OPTION_TRANSLATIONS[trimmed];
  }

  // 2. Direct match in Question Dictionary
  if (EXACT_QUESTION_TRANSLATIONS[trimmed]) {
    const entry = EXACT_QUESTION_TRANSLATIONS[trimmed];
    if (type === 'QUESTION') return entry.q_hi;
    if (type === 'OPT_A') return entry.a_hi;
    if (type === 'OPT_B') return entry.b_hi;
    if (type === 'OPT_C') return entry.c_hi;
    if (type === 'OPT_D') return entry.d_hi;
    if (type === 'EXP') return entry.exp_hi;
  }

  // 3. Question regex patterns
  if (type === 'QUESTION') {
    // Subject Practical Examination Question #N: What is the correct standard, methodology and optimal syntax in Subject?
    const matchPract = trimmed.match(/^(.*?)\s+Practical Examination Question #(\d+):\s+What is the correct standard, methodology and optimal syntax in\s+(.*?)\?$/i);
    if (matchPract) {
      return `${matchPract[1]} प्रायोगिक परीक्षा प्रश्न #${matchPract[2]}: ${matchPract[3]} में सही मानक, कार्यप्रणाली और इष्टतम सिंटैक्स क्या है?`;
    }

    // RS-CIT
    const matchRscit = trimmed.match(/^RS-CIT Computer Question (\d+):\s+What is the function of the main computer hardware components and operating systems\?$/i);
    if (matchRscit) {
      return `RS-CIT कंप्यूटर प्रश्न ${matchRscit[1]}: मुख्य कंप्यूटर हार्डवेयर घटकों और ऑपरेटिंग सिस्टम का क्या कार्य है?`;
    }

    // HTML Structure Exam Question #N: Which statement about semantic tags, accessibility and valid DOM tree construction in HTML5 is correct?
    const matchHtmlStruct = trimmed.match(/^HTML Structure Exam Question #(\d+):\s+Which statement about semantic tags, accessibility and valid DOM tree construction in HTML5 is correct\?$/i);
    if (matchHtmlStruct) {
      return `HTML संरचना परीक्षा प्रश्न #${matchHtmlStruct[1]}: HTML5 में सिमेंटिक टैग, सुगमता और वैध DOM ट्री निर्माण के संबंध में कौन सा कथन सही है?`;
    }

    // JavaScript Advanced Question N: How does the JavaScript engine handle execution context, closures and event loop queues?
    const matchJs = trimmed.match(/^JavaScript Advanced Question (\d+):\s+How does the JavaScript engine handle execution context, closures and event loop queues\?$/i);
    if (matchJs) {
      return `जावास्क्रिप्ट एडवांस्ड प्रश्न ${matchJs[1]}: जावास्क्रिप्ट इंजन एक्ज़ीक्यूशन कॉन्टेक्स्ट, क्लोज़र्स और इवेंट लूप को कैसे प्रोसेस करता है?`;
    }

    // Python Core Question N: What is the output or mechanism of Python data structures and indentation syntax?
    const matchPy = trimmed.match(/^Python Core Question (\d+):\s+What is the output or mechanism of Python data structures and indentation syntax\?$/i);
    if (matchPy) {
      return `पायथन कोर प्रश्न ${matchPy[1]}: पायथन डेटा संरचनाओं और इंडेंटेशन सिंटैक्स का आउटपुट या कार्यप्रणाली क्या है?`;
    }

    // General patterns
    if (trimmed.includes('What is the function of the main computer hardware components')) {
      return trimmed.replace(
        /What is the function of the main computer hardware components and operating systems\?/i,
        'मुख्य कंप्यूटर हार्डवेयर घटकों और ऑपरेटिंग सिस्टम का क्या कार्य है?'
      );
    }
    if (trimmed.includes('What does') && trimmed.includes('stand for?')) {
      const match = trimmed.match(/What does\s+(.*?)\s+stand for\?/i);
      if (match && match[1]) {
        return `${match[1]} का पूरा नाम (Full Form) क्या है?`;
      }
    }
    if (trimmed.includes('Which statement about') && trimmed.includes('is correct?')) {
      return trimmed
        .replace(/Which statement about/i, '')
        .replace(/is correct\?/i, 'के संबंध में कौन सा कथन सही है?')
        .trim();
    }
    if (trimmed.includes('What is the purpose of')) {
      return trimmed.replace(/What is the purpose of/i, 'का मुख्य उद्देश्य क्या है? : ');
    }
    if (trimmed.includes('Which of the following')) {
      return trimmed.replace(/Which of the following/i, 'निम्नलिखित में से कौन सा');
    }
    if (trimmed.includes('Which tag') || trimmed.includes('Which element')) {
      return trimmed.replace(/Which tag/i, 'कौन सा टैग').replace(/Which element/i, 'कौन सा एलिमेंट');
    }
  }

  // 4. Common option translations
  if (type.startsWith('OPT_')) {
    if (trimmed === 'True') return 'सत्य (True)';
    if (trimmed === 'False') return 'असत्य (False)';
    if (trimmed === 'None of the above') return 'उपरोक्त में से कोई नहीं';
    if (trimmed === 'All of the above') return 'उपरोक्त सभी (All of the above)';
    if (trimmed === 'Both A and B') return 'A और B दोनों';
  }

  return englishText;
}

/**
 * Returns Hindi translation specifically for the Question text
 */
export function getQuestionHindi(question) {
  if (!question) return '';
  const qText = typeof question === 'string' ? question : (question.question_text || '');
  if (typeof question === 'object' && question.question_text_hi) {
    return question.question_text_hi;
  }
  const exact = EXACT_QUESTION_TRANSLATIONS[qText.trim()];
  if (exact && exact.q_hi) return exact.q_hi;
  return translateToHindi(qText, 'QUESTION');
}

/**
 * Returns localized question object according to selected language ('EN' or 'HI')
 */
export function getLocalizedQuestion(question, language = 'EN') {
  if (!question) return question;
  if (language === 'EN') {
    return {
      ...question,
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      explanation: question.explanation
    };
  }

  // Hindi ('HI') Mode
  const exact = EXACT_QUESTION_TRANSLATIONS[question.question_text?.trim()];

  return {
    ...question,
    question_text: question.question_text_hi || exact?.q_hi || translateToHindi(question.question_text, 'QUESTION'),
    option_a: question.option_a_hi || exact?.a_hi || translateToHindi(question.option_a, 'OPT_A'),
    option_b: question.option_b_hi || exact?.b_hi || translateToHindi(question.option_b, 'OPT_B'),
    option_c: question.option_c_hi || exact?.c_hi || translateToHindi(question.option_c, 'OPT_C'),
    option_d: question.option_d_hi || exact?.d_hi || translateToHindi(question.option_d, 'OPT_D'),
    explanation: question.explanation_hi || exact?.exp_hi || translateToHindi(question.explanation, 'EXP')
  };
}

/**
 * Common UI Strings in Hindi & English
 */
export const EXAM_UI_TEXT = {
  EN: {
    question: 'Question',
    of: 'of',
    marks: 'Marks',
    negative: 'Negative',
    markForReview: 'Mark for Review',
    markedForReview: 'Marked for Review',
    clearResponse: 'Clear Response',
    previous: 'Previous',
    next: 'Next',
    submitExam: 'Finish & Submit',
    examRules: 'Examination Instructions & Verification',
    chooseLang: 'Select Question Paper Language:',
    langNote: 'You can change language anytime during the examination.',
    answered: 'Answered',
    unanswered: 'Unanswered',
    review: 'Marked for Review',
    notVisited: 'Not Visited',
    candidate: 'Candidate',
    readyToSubmit: 'Ready to Submit Your Examination?',
    submitWarning: 'Once submitted, you cannot change your answers.',
    confirmSubmit: 'Confirm & Submit Exam',
    continueExam: 'Continue Exam',
    langToggle: 'Language'
  },
  HI: {
    question: 'प्रश्न',
    of: 'कुल',
    marks: 'अंक',
    negative: 'नकारात्मक अंक',
    markForReview: 'समीक्षा के लिए चिह्नित करें',
    markedForReview: 'समीक्षा हेतु चिह्नित',
    clearResponse: 'उत्तर हटाएं',
    previous: 'पिछला प्रश्न',
    next: 'अगला प्रश्न',
    submitExam: 'परीक्षा सबमिट करें',
    examRules: 'परीक्षा निर्देश एवं सत्यापन',
    chooseLang: 'प्रश्न पत्र की भाषा चुनें:',
    langNote: 'आप परीक्षा के दौरान भी कभी भी भाषा बदल सकते हैं।',
    answered: 'उत्तर दिया',
    unanswered: 'अनुत्तरित',
    review: 'समीक्षा हेतु चिह्नित',
    notVisited: 'नहीं देखा',
    candidate: 'परीक्षार्थी',
    readyToSubmit: 'क्या आप परीक्षा सबमिट करने के लिए तैयार हैं?',
    submitWarning: 'सबमिट करने के बाद आप अपने उत्तर नहीं बदल सकते।',
    confirmSubmit: 'पुष्टि करें एवं परीक्षा सबमिट करें',
    continueExam: 'परीक्षा जारी रखें',
    langToggle: 'भाषा'
  }
};
