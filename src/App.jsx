import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { Toaster } from "@/components/ui/sonner";

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

          {/* Захищені маршрути */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* Тут буде ваша головна сторінка, наприклад ElectionsPage */}
                <div>Головна сторінка (список виборів буде тут)</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
