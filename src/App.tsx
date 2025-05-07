
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import QueueStatusPage from "./pages/QueueStatusPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import WalkInPage from "./pages/WalkInPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ServicesPage from "./pages/ServicesPage";
import SettingsPage from "./pages/SettingsPage";
import PrivateRoute from "./components/auth/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/queue-status/:ticketId" element={<QueueStatusPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="/register-walkin" element={
            <PrivateRoute>
              <WalkInPage />
            </PrivateRoute>
          } />
          <Route path="/services" element={
            <PrivateRoute allowedRoles={["admin"]}>
              <ServicesPage />
            </PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AnalyticsPage />
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute allowedRoles={["admin"]}>
              <SettingsPage />
            </PrivateRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
