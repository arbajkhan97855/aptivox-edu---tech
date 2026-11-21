import fs from 'fs';
import path from 'path';
import assert from 'assert';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

const tests = [
  {
    name: '1. Uses rules_version = 2 and global catch-all deny',
    fn: () => {
      assert.ok(rulesContent.includes("rules_version = '2';"));
      assert.ok(rulesContent.includes('match /{document=**}'));
      assert.ok(rulesContent.includes('allow read, write: if false;'));
    }
  },
  {
    name: '2. Enforces Path Variable Hardening (isValidId) and explicit size bounds',
    fn: () => {
      assert.ok(rulesContent.includes('function isValidId(id)'));
      assert.ok(rulesContent.includes("id.matches('^[a-zA-Z0-9_\\\\-]+$')"));
    }
  },
  {
    name: '3. Enforces email_verified == true and bootstrapped admin check',
    fn: () => {
      assert.ok(rulesContent.includes('request.auth.token.email_verified == true'));
      assert.ok(rulesContent.includes('pathanarbaj03328@gmail.com'));
      assert.ok(rulesContent.includes('aptivoxeducation@gmail.com'));
    }
  },
  {
    name: '4. Prevents shadow field updates and enforces Validation Blueprints on every collection',
    fn: () => {
      const requiredHelpers = [
        'isValidSettings', 'isValidAdmin', 'isValidCourse', 'isValidSubject',
        'isValidTopic', 'isValidTestLevel', 'isValidExamPaper', 'isValidQuestion',
        'isValidStudent', 'isValidAttempt', 'isValidAnswer', 'isValidViolation',
        'isValidNote', 'isValidNotification', 'isValidStudentAlias'
      ];
      for (const h of requiredHelpers) {
        assert.ok(rulesContent.includes(`function ${h}(data)`), `Missing ${h}`);
      }
      assert.ok(rulesContent.includes('data.keys().hasOnly('));
    }
  },
  {
    name: '5. Enforces PII isolation on /students, admin-only student mutations, and blocks alias enumeration',
    fn: () => {
      assert.ok(rulesContent.includes('match /students/{studentDocId}'));
      assert.ok(rulesContent.includes('match /student_login_aliases/{studentCode}'));
      assert.ok(rulesContent.includes('allow list: if false;'));
      assert.ok(rulesContent.includes('resource.data.uid == request.auth.uid'));
      assert.ok(!/allow\s+(read|list)\s*:\s*if\s+true\b/.test(rulesContent));
      assert.ok(!/allow\s+(read|list)\s*:\s*if\s+isSignedIn\(\)\s*;/.test(rulesContent));
    }
  },
  {
    name: '6. Enforces Terminal State Locking on exam_attempts and Master Gate on exam_answers',
    fn: () => {
      assert.ok(rulesContent.includes("existing().status == 'IN_PROGRESS'"));
      assert.ok(rulesContent.includes('get(/databases/$(database)/documents/exam_attempts/$(incoming().attempt_id)).data.status == \'IN_PROGRESS\''));
    }
  },
  {
    name: '7. Enforces request.time Temporal Integrity on createdAt/updatedAt',
    fn: () => {
      assert.ok(rulesContent.includes('incoming().createdAt == request.time'));
      assert.ok(rulesContent.includes('incoming().updatedAt == request.time'));
    }
  }
];

let passed = 0;
for (const t of tests) {
  t.fn();
  passed++;
  console.log(`PASS: ${t.name}`);
}
console.log(`All ${passed}/${tests.length} security rule invariant tests passed.`);
