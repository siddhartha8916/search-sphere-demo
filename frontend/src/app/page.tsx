"use client";

import { HybridSearchDashboard } from "@/components/hybrid-search/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--palette-surface)] to-[var(--palette-surface-2)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--palette-accent)]" />
      </div>
    );
  }

  // If not authenticated, AuthContext will redirect to /login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[var(--palette-surface)] to-[var(--palette-surface-2)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--palette-accent)]" />
      </div>
    );
  }

  return <HybridSearchDashboard />;
}
