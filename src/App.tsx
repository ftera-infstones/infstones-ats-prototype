import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LangProvider } from './context/LangContext';
import LoginPage from './pages/LoginPage';
import JobsListPage from './pages/JobsListPage';
import JobFormPage from './pages/JobFormPage';
import KanbanPage from './pages/KanbanPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import PipelineSettingsPage from './pages/PipelineSettingsPage';
import InterviewersPage from './pages/InterviewersPage';
import FeedbackFormsPage from './pages/InterviewQuestionsPage';
import InterviewerFeedbackPage from './pages/InterviewerFeedbackPage';
import CareersPage from './pages/CareersPage';
import CareerJobDetailPage from './pages/CareerJobDetailPage';
import CareerApplyPage from './pages/CareerApplyPage';
import AccessControlPage from './pages/AccessControlPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useApp();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-400 text-sm">Loading...</div>
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (no auth required) */}
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/careers/:id" element={<CareerJobDetailPage />} />
        <Route path="/careers/:id/apply" element={<CareerApplyPage />} />
        <Route path="/feedback/:applicationId/:stageId" element={<InterviewerFeedbackPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* ATS platform routes — protected */}
        <Route path="/" element={<Navigate to="/jobs" replace />} />
        <Route path="/jobs" element={<AuthGuard><JobsListPage /></AuthGuard>} />
        <Route path="/jobs/new" element={<AuthGuard><JobFormPage /></AuthGuard>} />
        <Route path="/jobs/:id/edit" element={<AuthGuard><JobFormPage /></AuthGuard>} />
        <Route path="/jobs/:id/kanban" element={<AuthGuard><KanbanPage /></AuthGuard>} />
        <Route path="/applications/:id" element={<AuthGuard><ApplicationDetailPage /></AuthGuard>} />
        <Route path="/settings/stages" element={<AuthGuard><PipelineSettingsPage /></AuthGuard>} />
        <Route path="/settings/feedback-forms" element={<AuthGuard><FeedbackFormsPage /></AuthGuard>} />
        <Route path="/settings/access-control" element={<AuthGuard><AccessControlPage /></AuthGuard>} />
        <Route path="/interviewers" element={<AuthGuard><InterviewersPage /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </LangProvider>
  );
}
