import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import JobsListPage from './pages/JobsListPage';
import KanbanPage from './pages/KanbanPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import PipelineSettingsPage from './pages/PipelineSettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/jobs" element={<JobsListPage />} />
          <Route path="/jobs/:id/kanban" element={<KanbanPage />} />
          <Route path="/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/settings/stages" element={<PipelineSettingsPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
