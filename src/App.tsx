import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CityDetail from "@/pages/CityDetail";
import Alerts from "@/pages/Alerts";
import CampusPlanning from "@/pages/CampusPlanning";
import Reports from "@/pages/Reports";
import Permissions from "@/pages/Permissions";
import { useAuthStore } from "@/store/useAuthStore";
import { canAccessRoute } from "@/utils/permissions";

function ProtectedRoute({ path, children }: { path: string; children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !canAccessRoute(user.role, path)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute path="/dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="dashboard/city/:cityId" element={<ProtectedRoute path="/dashboard"><CityDetail /></ProtectedRoute>} />
          <Route path="alerts" element={<ProtectedRoute path="/alerts"><Alerts /></ProtectedRoute>} />
          <Route path="campus" element={<ProtectedRoute path="/campus"><CampusPlanning /></ProtectedRoute>} />
          <Route path="reports" element={<ProtectedRoute path="/reports"><Reports /></ProtectedRoute>} />
          <Route path="permissions" element={<ProtectedRoute path="/permissions"><Permissions /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute path="/users"><Permissions /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
