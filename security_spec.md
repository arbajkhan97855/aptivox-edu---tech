# Security Specification — APTIVOX EDUCATION & TECHNOLOGY (Firestore Rules)

## Data Invariants
1. **Admin Authority**: Only verified users matching bootstrapped admin emails (`pathanarbaj03328@gmail.com`, `aptivoxeducation@gmail.com`) with `email_verified == true` OR present in `/admins/{request.auth.uid}` can modify curriculum (`courses`, `subjects`, `topics`, `test_levels`, `exam_papers`, `questions`, `notes`, `settings`) or delete/manage arbitrary student records.
2. **PII Isolation**: Student profiles (`/students/{studentDocId}`) contain PII (`email`, `mobile`, `dob`, `address`). Reads (`get`, `list`) are strictly restricted to the owning student (`resource.data.uid == request.auth.uid` or verified email match) or an Admin.
3. **Self-Registration Integrity**: A student creating `/students/{uid}` MUST bind `uid == request.auth.uid`, `email == request.auth.token.email`, `status == 'ACTIVE'`, `createdAt == request.time`, and reference an existing `course_id` in `/courses`.
4. **Attempt Ownership & Terminal State Locking**: An `exam_attempt` can only be created by an authenticated verified user with `student_uid == request.auth.uid`, `status == 'IN_PROGRESS'`, `violation_count == 0`, `re_exam_required == false`, `createdAt == request.time`, and a valid `exam_papers` reference. Once `status` leaves `'IN_PROGRESS'` (e.g., `'COMPLETED'` or `'RE_EXAM_REQUIRED'`), students CANNOT update the attempt; only Admins can grant re-exam resets.
5. **Master Gate on Answers**: Students can only write `/exam_answers/{answerId}` when the parent `/exam_attempts/{attempt_id}` exists, belongs to `request.auth.uid`, and has `status == 'IN_PROGRESS'`.
6. **Temporal Integrity & Path Hardening**: Every document ID on `get`/`create`/`update`/`delete` must match `^[a-zA-Z0-9_-]+$` (`<= 128` chars), and every string/list field must enforce explicit `.size()` bounds.

## The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Student Read**: Unauthenticated client requests `get /students/stu_1` -> Denied.
2. **Cross-Student PII Read**: Authenticated Student A queries `list /students` without matching own `uid` / `email` -> Denied.
3. **Privilege Escalation (Self-Admin)**: Non-admin student attempts `create /admins/{uid}` -> Denied.
4. **Shadow Field Injection on Student Create**: Student creates `/students/{uid}` with extra field `isAdmin: true` -> Denied by `keys().hasOnly(...)`.
5. **Email Spoofing Admin Bypass**: Unverified token (`email_verified: false`) with email `pathanarbaj03328@gmail.com` attempts `write /settings/institute` -> Denied.
6. **Curriculum Tampering by Student**: Student attempts `update /questions/q_p1_1` to alter `correct_answer` -> Denied.
7. **Orphan Exam Attempt**: Student creates `/exam_attempts/att_fake` referencing non-existent `exam_id: "non_existent_paper"` -> Denied by `exists(...)`.
8. **Score Tampering on Create**: Student creates `/exam_attempts/att_cheat` with `status: "COMPLETED"` and `score: 100` -> Denied (must create as `IN_PROGRESS`).
9. **Terminal State Mutation**: Student updates a `COMPLETED` attempt to change `score` from `40` to `98` -> Denied by terminal state lock.
10. **Answer Modification After Submit**: Student writes `/exam_answers/ans_1` for an `exam_attempt` whose status is `COMPLETED` -> Denied by Master Gate `get(...)`.
11. **ID Poisoning / 1MB String Attack**: Client writes `/courses/<2000-char-id>` or `description` exceeding `maxLength` -> Denied by `isValidId` & `.size()`.
12. **Client Timestamp Forgery**: Student creates `/exam_attempts/att_time` with client-forged `createdAt` != `request.time` -> Denied by `incoming().createdAt == request.time`.
