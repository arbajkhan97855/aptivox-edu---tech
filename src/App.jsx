import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import StudentLoginPage from './pages/StudentLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentTestsPage from './pages/student/StudentTestsPage';
import LiveExamPage from './pages/student/LiveExamPage';
import StudentResultsListPage from './pages/student/StudentResultsListPage';
import ExamResultPage from './pages/student/ExamResultPage';
import StudentNotesPage from './pages/student/StudentNotesPage';
import StudentProfilePage from './pages/student/StudentProfilePage';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminHierarchyPage from './pages/admin/AdminHierarchyPage';
import AdminExamsPage from './pages/admin/AdminExamsPage';
import AdminQuestionBankPage from './pages/admin/AdminQuestionBankPage';
import AdminLiveMonitorPage from './pages/admin/AdminLiveMonitorPage';
import AdminResultsPage from './pages/admin/AdminResultsPage';
import AdminReExamsPage from './pages/admin/AdminReExamsPage';
import AdminNotesPage from './pages/admin/AdminNotesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isExamLiveRoute = location.pathname.startsWith('/student/exam/');

  return (
    <div className="app-container">
      {/* Show Main Header only when not inside Admin Layout and not in Fullscreen Exam */}
      {!isAdminRoute && !isExamLiveRoute && <Header />}

      <div className="main-content">
        <Routes>
          {/* Public Authentication Routes */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'ADMIN' ? (
                  <Navigate to="/admin/dashboard" replace />
                ) : (
                  <Navigate to="/student/dashboard" replace />
                )
              ) : (
                <StudentLoginPage />
              )
            }
          />
          <Route
            path="/APTIVOX/admin"
            element={
              user?.role === 'ADMIN' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <AdminLoginPage />
              )
            }
          />
          <Route
            path="/aptivox/admin"
            element={<Navigate to="/APTIVOX/admin" replace />}
          />

          {/* Student Protected Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/tests"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentTestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:id"
            element={
              <ProtectedRoute role="STUDENT">
                <LiveExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentResultsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam-history"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentResultsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results/:attemptId"
            element={
              <ProtectedRoute>
                <ExamResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notes"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentNotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="STUDENT">
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="hierarchy" element={<AdminHierarchyPage />} />
            <Route path="exams" element={<AdminExamsPage />} />
            <Route path="questions" element={<AdminQuestionBankPage />} />
            <Route path="live-monitor" element={<AdminLiveMonitorPage />} />
            <Route path="results" element={<AdminResultsPage />} />
            <Route path="re-exams" element={<AdminReExamsPage />} />
            <Route path="notes" element={<AdminNotesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Show Main Footer only when not in Admin Layout and not in Fullscreen Exam */}
      {!isAdminRoute && !isExamLiveRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
