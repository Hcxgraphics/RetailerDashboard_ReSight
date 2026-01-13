import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ThemeProvider } from "@/hooks/use-theme";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Index from "./pages/Index";
import Recommendations from "./pages/Recommendations";
import ItemInspector from "./pages/ItemInspector";
import AskAI from "./pages/AskAI";
import ImpactPreview from "./pages/ImpactPreview";
import ManualControls from "./pages/ManualControls";
import Alerts from "./pages/Alerts";
import AuditLogs from "./pages/AuditLogs";
import Integrations from "./pages/Integrations";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
            <Route path="/inspector" element={<ProtectedRoute><ItemInspector /></ProtectedRoute>} />
            <Route path="/inspector/:id" element={<ProtectedRoute><ItemInspector /></ProtectedRoute>} />
            <Route path="/ask-ai" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
            <Route path="/impact" element={<ProtectedRoute><ImpactPreview /></ProtectedRoute>} />
            <Route path="/controls" element={<ProtectedRoute><ManualControls /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><PlaceholderPage title="Settings" description="System configuration and preferences coming soon." /></ProtectedRoute>} />
            <Route path="/settings/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/settings/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
            <Route path="/settings/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
