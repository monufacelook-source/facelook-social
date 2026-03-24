import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

// Loader Component (Taaki code baar-baar repeat na ho)
const FullPageLoader = () => (
  <div className="h-screen w-screen bg-[#d1dbd3] flex flex-col items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
    <p className="mt-4 text-blue-600 font-black italic tracking-widest text-xs uppercase">
      Facelook Loading...
    </p>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  // Agar user logged in nahi hai, toh seedha login par bhejo
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  // Agar user pehle se logged in hai aur login page kholne ki koshish kare, toh dashboard par bhejo
  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      }
    />
    <Route
      path="/signup"
      element={
        <AuthRoute>
          <Signup />
        </AuthRoute>
      }
    />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      }
    />
    {/* 404 Page */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* AuthProvider sabse upar hona chahiye taaki Routes ko data mile */}
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
