import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";

import { useMe } from "./hooks/useMe";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";

function ProtectedApp() {
  const me = useMe();

  if (me.isLoading) {
    return (
      <div className="min-h-full grid place-items-center">
        <div className="text-sm text-slate-300">Loading...</div>
      </div>
    );
  }

  if (me.isError) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedApp />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
