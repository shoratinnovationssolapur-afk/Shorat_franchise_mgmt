import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import NotFound from "./pages/NotFound";
import { LoginForm } from "./components/auth/LoginForm";

// Layouts for roles
import FranchiseLayout from "./pages/Franchise/Layout/FranchiseLayout";
import StaffLayout from "./pages/Staff/Layout/StaffLayout";
import AdminLayout from "./pages/Admin/Layout/AdminLayout";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "admin":
        return "Admin User";
      case "franchise_head":
        return "Franchise Head";
      case "staff":
        return "Staff Member";
      default:
        return "User";
    }
  };

  // Restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("name");
    const expiry = localStorage.getItem("expiry");

    if (token && role && email && expiry && Date.now() < +expiry) {
      setUser({
        name: name || getRoleDisplayName(role),
        role,
        email,
        token,
      });
      setIsAuthenticated(true);
    } else {
      handleLogout(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const expiry = localStorage.getItem("expiry");
      if (expiry) {
        const remaining = +expiry - Date.now();
        const timer = setTimeout(() => handleLogout(), remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user]);

  const handleLoginSuccess = (credentials) => {
    const { token, role, email, name } = credentials;

    const userData = {
      name: name || getRoleDisplayName(role),
      role,
      email,
      token,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);
    localStorage.setItem("name", userData.name);
    localStorage.setItem("expiry", Date.now() + 1000 * 60 * 60); // 1 hour

    setUser(userData);
    setIsAuthenticated(true);

    // Redirect based on role
    if (role === "admin") navigate("/admin/dashboard", { replace: true });
    else if (role === "franchise_head") navigate("/franchise/dashboard", { replace: true });
    else if (role === "staff") navigate("/staff/dashboard", { replace: true });
    else navigate("/login", { replace: true });
  };

  const handleLogout = (redirect = true) => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);

    if (redirect) navigate("/login", { replace: true });
  };

  const handleGoBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Protect routes by role
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login route */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginForm onLogin={handleLoginSuccess} />
              ) : (
                <Navigate
                  to={
                    user?.role === "admin"
                      ? "/admin/dashboard"
                      : user?.role === "franchise_head"
                      ? "/franchise/dashboard"
                      : "/staff/dashboard"
                  }
                  replace
                />
              )
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout
                  user={user}
                  onLogout={handleLogout}
                  onGoBack={handleGoBack}
                />
              </ProtectedRoute>
            }
          />

          {/* Franchise Head routes */}
          <Route
            path="/franchise/*"
            element={
              <ProtectedRoute allowedRoles={["franchise_head"]}>
                <FranchiseLayout
                  user={user}
                  onLogout={handleLogout}
                  onGoBack={handleGoBack}
                  email_user={user?.email}
                />
              </ProtectedRoute>
            }
          />

          {/* Staff routes */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffLayout
                  user={user}
                  onLogout={handleLogout}
                  onGoBack={handleGoBack}
                />
              </ProtectedRoute>
            }
          />

          {/* Not Found */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
