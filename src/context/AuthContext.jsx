import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { ensureFirestoreSeeded } from '../lib/seedFirestore';
import { isAdminEmail } from '../lib/firestoreApi';
import { INITIAL_COURSES } from '../data/seedCatalog';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAppUser = async (fbUser, preferredPortal = null) => {
    if (!fbUser) {
      setFirebaseUser(null);
      setToken(null);
      setUser(null);
      return null;
    }

    setFirebaseUser(fbUser);
    const idToken = await fbUser.getIdToken();
    setToken(idToken);

    const email = (fbUser.email || '').toLowerCase();
    const adminCandidate = isAdminEmail(email);

    if (adminCandidate && fbUser.emailVerified) {
      await ensureFirestoreSeeded(
        fbUser.uid,
        fbUser.email || 'aptivoxeducation@gmail.com',
        fbUser.displayName || 'Aptivox Director / Admin'
      );
    }

    let isAdminUser = adminCandidate && fbUser.emailVerified;
    if (!isAdminUser) {
      try {
        const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
        if (adminSnap.exists()) isAdminUser = true;
      } catch {
        // Ignore permission check for non-admins
      }
    }

    if (isAdminUser && preferredPortal !== 'STUDENT') {
      const adminUser = {
        id: fbUser.uid,
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || 'Aptivox Director / Admin',
        profile_image: fbUser.photoURL || '',
        role: 'ADMIN',
      };
      setUser(adminUser);
      return adminUser;
    }

    // Resolve Student profile strictly by UID field (Admin-provisioned accounts use doc IDs like stu_1 / stu_*)
    try {
      const byUid = await getDocs(query(collection(db, 'students'), where('uid', '==', fbUser.uid)));
      const stu = !byUid.empty ? byUid.docs[0].data() : null;

      if (stu) {
        if (stu.status !== 'ACTIVE') {
          await signOut(auth);
          setUser(null);
          throw new Error('Student account is deactivated. Contact Aptivox Admin.');
        }

        let courseName = 'MERN Stack Developer';
        try {
          const courseSnap = await getDoc(doc(db, 'courses', stu.course_id));
          if (courseSnap.exists()) {
            courseName = courseSnap.data().name;
          } else {
            const fallback = INITIAL_COURSES.find((c) => c.id === stu.course_id);
            if (fallback) courseName = fallback.name;
          }
        } catch {
          const fallback = INITIAL_COURSES.find((c) => c.id === stu.course_id);
          if (fallback) courseName = fallback.name;
        }

        const fullStudent = {
          ...stu,
          uid: fbUser.uid,
          course_name: courseName,
          profile_image: stu.profile_image || '',
          role: 'STUDENT',
        };
        setUser(fullStudent);
        return fullStudent;
      }

      await signOut(auth).catch(() => {});
      setUser(null);
      setFirebaseUser(null);
      setToken(null);
      return null;
    } catch (err) {
      if (err instanceof Error && err.message.includes('deactivated')) {
        throw err;
      }
      handleFirestoreError(err, OperationType.GET, 'students');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        const preferredPortal =
          window.location.pathname.toLowerCase().startsWith('/aptivox/admin') ||
          window.location.pathname.startsWith('/admin')
            ? 'ADMIN'
            : null;
        await loadAppUser(fbUser, preferredPortal);
      } catch (err) {
        console.error('Auth state load error:', err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const verifyAdminResult = async (fbUser) => {
    const email = (fbUser.email || '').toLowerCase();
    const isWhitelistedEmail = isAdminEmail(email);

    if (isWhitelistedEmail && !fbUser.emailVerified) {
      await sendEmailVerification(fbUser).catch(() => {});
      await signOut(auth);
      setUser(null);
      setToken(null);
      throw new Error(
        `Email verification required before Admin access. A verification link has been sent to ${fbUser.email}. Please check your inbox/spam, click the link, and sign in again.`
      );
    }

    let allowed = isWhitelistedEmail && fbUser.emailVerified;
    if (!allowed) {
      try {
        const adminSnap = await getDoc(doc(db, 'admins', fbUser.uid));
        allowed = adminSnap.exists();
      } catch {
        allowed = false;
      }
    }

    if (!allowed) {
      await signOut(auth);
      setUser(null);
      setToken(null);
      throw new Error('Access denied. This account is not an authorized Aptivox Administrator.');
    }

    return await loadAppUser(fbUser, 'ADMIN');
  };

  const loginAdmin = async (email, password, rememberSession = true) => {
    if (!email || !password) {
      throw new Error('Please enter both Admin Email and Password');
    }
    try {
      await setPersistence(auth, rememberSession ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      return await verifyAdminResult(cred.user);
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password login is disabled in Firebase Console. Enable Email/Password under Authentication → Sign-in method.'
        );
      }
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        throw new Error('Invalid Admin Email or Password.');
      }
      throw err;
    }
  };

  const loginStudent = async (studentId, password) => {
    const cleanCode = String(studentId || '').trim().toUpperCase();
    if (!cleanCode || !password) {
      throw new Error('Please enter both Student ID and Password');
    }

    let aliasEmail = '';
    try {
      const aliasSnap = await getDoc(doc(db, 'student_login_aliases', cleanCode));
      if (aliasSnap.exists()) {
        aliasEmail = aliasSnap.data().auth_alias_email || '';
      }
    } catch {
      // Permission denied or missing alias doc resolves cleanly to invalid ID/password below
    }

    if (!aliasEmail) {
      throw new Error('Invalid Student ID or password. Please verify your ID or contact Admin.');
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, aliasEmail, password);
      const resolved = await loadAppUser(cred.user, 'STUDENT');
      if (!resolved) {
        throw new Error('Student account not found or deactivated. Contact Aptivox Admin.');
      }
      return { user: resolved };
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        throw new Error(
          'Email/Password login is disabled in Firebase Console. Ask Admin to enable Email/Password under Authentication → Sign-in method.'
        );
      }
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        throw new Error('Invalid Student ID or password.');
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        loading,
        loginAdmin,
        loginStudent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
