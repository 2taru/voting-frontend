import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/main-layout";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { Toaster } from "@/components/ui/sonner";

import { ElectionsPage } from "@/pages/ElectionsPage";
import { ElectionDetailsPage } from "@/pages/ElectionDetailsPage";
import { MyVotesPage } from "@/pages/MyVotesPage";
import { AdminStats } from "@/pages/AdminStats";
import { GovernancePage } from "@/pages/GovernancePage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/elections" replace />} />
            <Route path="/elections" element={<ElectionsPage />} />
            <Route path="/elections/:id" element={<ElectionDetailsPage />} />

            <Route path="/my-votes" element={<MyVotesPage />} />

            <Route path="/admin/stats" element={<AdminStats />} />

            <Route path="/governance" element={<GovernancePage />} />
          </Route>

          {/* Маршрут для 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
