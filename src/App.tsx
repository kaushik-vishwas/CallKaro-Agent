import {BrowserRouter, Navigate, Outlet, Route, Routes, useLocation} from 'react-router-dom';
import {AuthProvider, useAuth} from './auth/AuthContext';
import {AppLayout} from './components/layout/AppLayout/AppLayout';
import {DashboardPage} from './pages/Dashboard/DashboardPage';
import {AddReceiverPage} from './pages/AddReceiver/AddReceiverPage';
import {ReceiversPage} from './pages/Receivers/ReceiversPage';
import {ReviewReceiverPage} from './pages/Receivers/ReviewReceiverPage';
import {PendingApprovalsPage} from './pages/PendingApprovals/PendingApprovalsPage';
import {ApprovalSuccessPage} from './pages/PendingApprovals/ApprovalSuccessPage';
import {ShareCredentialsPage} from './pages/ShareCredentials/ShareCredentialsPage';
import {ShareCredentialDetailPage} from './pages/ShareCredentials/ShareCredentialDetailPage';
import {AnalyticsPage} from './pages/Analytics/AnalyticsPage';
import {ProfilePage} from './pages/Profile/ProfilePage';
import {LoginPage} from './pages/Login/LoginPage';
import {OnboardingRedirect} from './pages/OnboardingRedirect/OnboardingRedirect';

function ProtectedShell() {
  const {agent, loading} = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{padding: 48, textAlign: 'center', color: '#6b7280'}}>
        Loading…
      </div>
    );
  }

  if (!agent) {
    return <Navigate to="/login" replace state={{from: location.pathname}} />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboard/*" element={<OnboardingRedirect />} />
          <Route path="/useregistration/*" element={<OnboardingRedirect />} />
          <Route element={<ProtectedShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-receiver" element={<AddReceiverPage />} />
            <Route path="/receivers" element={<ReceiversPage />} />
            <Route path="/receivers/:id" element={<ReviewReceiverPage />} />
            <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
            <Route
              path="/pending-approvals/:id/approved"
              element={<ApprovalSuccessPage />}
            />
            <Route
              path="/pending-approvals/:id"
              element={<ReviewReceiverPage />}
            />
            <Route path="/share-credentials" element={<ShareCredentialsPage />} />
            <Route
              path="/share-credentials/:id"
              element={<ShareCredentialDetailPage />}
            />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
