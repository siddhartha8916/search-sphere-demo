"use client";

import { HybridSearchDashboard } from "@/components/hybrid-search/dashboard";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--palette-accent)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={login} />;
  }

  return <HybridSearchDashboard />;
}
