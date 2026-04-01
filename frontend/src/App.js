import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminAudits from './pages/admin/Audits';
import AdminChecklists from './pages/admin/Checklists';
import AdminAssignments from './pages/admin/Assignments';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';

import AuthCallback from './pages/AuthCallback';

// Auditor pages
import AuditorDashboard from './pages/auditor/Dashboard';
import AuditorAudits from './pages/auditor/Audits';
import AuditorReview from './pages/auditor/Review';

// Department pages
import DepartmentDashboard from './pages/department/Dashboard';
import DepartmentTasks from './pages/department/Tasks';
import DepartmentEvidence from './pages/department/Evidence';

import './styles/global.css';

const AdminWrap = ({ children }) => <ProtectedRoute roles={['admin']}><Layout>{children}</Layout></ProtectedRoute>;
const AuditorWrap = ({ children }) => <ProtectedRoute roles={['auditor']}><Layout>{children}</Layout></ProtectedRoute>;
const DeptWrap = ({ children }) => <ProtectedRoute roles={['department']}><Layout>{children}</Layout></ProtectedRoute>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/admin/dashboard" element={<AdminWrap><AdminDashboard /></AdminWrap>} />
          <Route path="/admin/audits" element={<AdminWrap><AdminAudits /></AdminWrap>} />
          <Route path="/admin/checklists" element={<AdminWrap><AdminChecklists /></AdminWrap>} />
          <Route path="/admin/assignments" element={<AdminWrap><AdminAssignments /></AdminWrap>} />
          <Route path="/admin/users" element={<AdminWrap><AdminUsers /></AdminWrap>} />
          <Route path="/admin/reports" element={<AdminWrap><AdminReports /></AdminWrap>} />
          <Route path="/auditor/dashboard" element={<AuditorWrap><AuditorDashboard /></AuditorWrap>} />
          <Route path="/auditor/audits" element={<AuditorWrap><AuditorAudits /></AuditorWrap>} />
          <Route path="/auditor/review" element={<AuditorWrap><AuditorReview /></AuditorWrap>} />
          <Route path="/department/dashboard" element={<DeptWrap><DepartmentDashboard /></DeptWrap>} />
          <Route path="/department/tasks" element={<DeptWrap><DepartmentTasks /></DeptWrap>} />
          <Route path="/department/evidence" element={<DeptWrap><DepartmentEvidence /></DeptWrap>} />

          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
