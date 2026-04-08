import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
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

export default function App() {
  return (
    <LangProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes (no auth required) */}
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/careers/:id" element={<CareerJobDetailPage />} />
            <Route path="/careers/:id/apply" element={<CareerApplyPage />} />
            <Route path="/feedback/:applicationId/:stageId" element={<InterviewerFeedbackPage />} />

            {/* ATS platform routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/jobs" element={<JobsListPage />} />
            <Route path="/jobs/new" element={<JobFormPage />} />
            <Route path="/jobs/:id/edit" element={<JobFormPage />} />
            <Route path="/jobs/:id/kanban" element={<KanbanPage />} />
            <Route path="/applications/:id" element={<ApplicationDetailPage />} />
            <Route path="/settings/stages" element={<PipelineSettingsPage />} />
            <Route path="/settings/feedback-forms" element={<FeedbackFormsPage />} />
            <Route path="/settings/access-control" element={<AccessControlPage />} />
            <Route path="/interviewers" element={<InterviewersPage />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </LangProvider>
  );
}
