import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  buildStudentAliasEmail,
  createSecondaryAuthUser,
  db,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  INITIAL_SETTINGS,
  INITIAL_COURSES,
  ALL_SUBJECTS,
  ALL_TOPICS,
  TEST_LEVELS,
  ALL_PAPERS,
  ALL_NOTES,
  INITIAL_STUDENTS,
  INITIAL_ATTEMPTS,
  generateInitialQuestions,
} from '../data/seedCatalog';

let seedPromise: Promise<void> | null = null;

async function commitInChunks(ops: Array<{ path: string; id: string; data: Record<string, any> }>) {
  const CHUNK_SIZE = 400;
  for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    const slice = ops.slice(i, i + CHUNK_SIZE);
    for (const item of slice) {
      batch.set(doc(db, item.path, item.id), item.data);
    }
    await batch.commit();
  }
}

export interface AliasActivationResult {
  provisioned: number;
  alreadyActive: number;
  authDisabled: boolean;
  errors: string[];
}

let aliasSyncPromise: Promise<AliasActivationResult> | null = null;

export async function ensureSeededStudentAliases(): Promise<AliasActivationResult> {
  if (aliasSyncPromise) return aliasSyncPromise;

  aliasSyncPromise = (async () => {
    let provisioned = 0;
    let alreadyActive = 0;
    let authDisabled = false;
    const errors: string[] = [];

    try {
      const stuListSnap = await getDocs(collection(db, 'students'));
      for (const stuDocSnap of stuListSnap.docs) {
        const stuData = stuDocSnap.data();
        const aliasCode = String(stuData.student_id || '').trim().toUpperCase();
        if (!aliasCode) continue;

        const aliasRef = doc(db, 'student_login_aliases', aliasCode);
        try {
          const aliasSnap = await getDoc(aliasRef);
          if (aliasSnap.exists()) {
            const aliasUid = aliasSnap.data().auth_uid;
            if (aliasUid && stuData.uid !== aliasUid) {
              await updateDoc(doc(db, 'students', stuDocSnap.id), {
                uid: aliasUid,
                updatedAt: serverTimestamp(),
              }).catch(() => {});
            }
            alreadyActive++;
            continue;
          }

          const aliasEmail = buildStudentAliasEmail(aliasCode);
          const newUid = await createSecondaryAuthUser(aliasEmail, 'student123');

          await setDoc(aliasRef, {
            id: aliasCode,
            student_doc_id: stuDocSnap.id,
            auth_alias_email: aliasEmail,
            auth_uid: newUid,
            updatedAt: serverTimestamp(),
          });

          await updateDoc(doc(db, 'students', stuDocSnap.id), {
            uid: newUid,
            updatedAt: serverTimestamp(),
          });

          provisioned++;

          // Isolate attempt UID migration so a missing index/filter never blocks student credential creation
          try {
            const attSnap = await getDocs(
              query(collection(db, 'exam_attempts'), where('student_id', '==', stuDocSnap.id))
            );
            for (const attDoc of attSnap.docs) {
              await updateDoc(doc(db, 'exam_attempts', attDoc.id), {
                student_uid: newUid,
                updatedAt: serverTimestamp(),
              });
            }
          } catch {
            // Non-fatal attempt migration issue
          }
        } catch (err: any) {
          if (err?.code === 'auth/operation-not-allowed') {
            authDisabled = true;
            errors.push('Email/Password authentication is disabled in Firebase Console.');
            break;
          }
          errors.push(`${aliasCode}: ${err?.message || 'Failed to provision'}`);
        }
      }
    } catch (err: any) {
      errors.push(err?.message || 'Unable to inspect student records');
    } finally {
      aliasSyncPromise = null;
    }

    return { provisioned, alreadyActive, authDisabled, errors };
  })();

  return aliasSyncPromise;
}

export async function ensureFirestoreSeeded(
  adminUid: string,
  adminEmail: string,
  adminName = 'Aptivox Director / Admin'
) {
  if (!seedPromise) {
    seedPromise = (async () => {
      let currentOp: OperationType = OperationType.GET;
      let currentPath = `admins/${adminUid}`;

      try {
        // Ensure this bootstrapped admin is recorded in /admins/{adminUid} without mutating createdAt on re-login
        const adminRef = doc(db, 'admins', adminUid);
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
          currentOp = OperationType.CREATE;
          currentPath = `admins/${adminUid}`;
          await setDoc(adminRef, {
            uid: adminUid,
            name: adminName,
            email: adminEmail,
            role: 'SUPER_ADMIN',
            createdAt: serverTimestamp(),
          });
        }

        // Query with explicit status filter matching firestore.rules allow list
        currentOp = OperationType.LIST;
        currentPath = 'courses';
        const existingCourses = await getDocs(
          query(collection(db, 'courses'), where('status', 'in', ['ACTIVE', 'INACTIVE']), limit(1))
        );

        if (existingCourses.empty) {
          currentOp = OperationType.WRITE;
          currentPath = 'seed_batch';
          const ops: Array<{ path: string; id: string; data: Record<string, any> }> = [];

          ops.push({
            path: 'settings',
            id: 'institute',
            data: { ...INITIAL_SETTINGS, updatedAt: serverTimestamp() },
          });

          INITIAL_COURSES.forEach((c) => {
            ops.push({
              path: 'courses',
              id: c.id,
              data: { ...c, createdAt: serverTimestamp() },
            });
          });

          ALL_SUBJECTS.forEach((s) => {
            ops.push({ path: 'subjects', id: s.id, data: { ...s } });
          });

          ALL_TOPICS.forEach((t) => {
            ops.push({ path: 'topics', id: t.id, data: { ...t, status: (t as any).status || 'ACTIVE' } });
          });

          TEST_LEVELS.forEach((l) => {
            ops.push({ path: 'test_levels', id: l.id, data: { ...l } });
          });

          ALL_PAPERS.forEach((p) => {
            ops.push({ path: 'exam_papers', id: p.id, data: { ...p } });
          });

          const allQuestions = generateInitialQuestions();
          allQuestions.forEach((q) => {
            ops.push({ path: 'questions', id: q.id, data: { ...q } });
          });

          ALL_NOTES.forEach((n) => {
            ops.push({ path: 'notes', id: n.id, data: { ...n } });
          });

          INITIAL_STUDENTS.forEach((stu) => {
            ops.push({
              path: 'students',
              id: stu.id,
              data: { ...stu, createdAt: serverTimestamp() },
            });
          });

          INITIAL_ATTEMPTS.forEach((att) => {
            ops.push({
              path: 'exam_attempts',
              id: att.id,
              data: { ...att, createdAt: serverTimestamp() },
            });
          });

          ops.push({
            path: 'notifications',
            id: 'notif_1',
            data: {
              id: 'notif_1',
              recipient_type: 'ADMIN',
              student_id: 'stu_1',
              student_uid: 'demo_stu_1',
              title: 'New Exam Completed',
              message: 'Rahul Sharma scored 88% in HTML Basics - Paper 2.',
              read: false,
              createdAt: serverTimestamp(),
            },
          });

          await commitInChunks(ops);
        }
      } catch (error) {
        seedPromise = null;
        handleFirestoreError(error, currentOp, currentPath);
      }
    })();
  }

  await seedPromise;
  await ensureSeededStudentAliases();
}
