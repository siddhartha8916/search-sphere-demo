"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, User, Loader2 } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await response.json();
      console.log("Login successful:", data);
      
      // Call success callback
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-(--palette-surface) via-(--palette-surface-2) to-(--palette-secondary)">
      <div className="w-full max-w-md">
        <Card className="border-2 border-(--palette-border) shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-linear-to-br from-(--palette-primary) to-(--palette-secondary) rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-(--palette-foreground)" />
            </div>
            <CardTitle className="text-3xl font-bold text-(--palette-foreground)">
              SearchSphere
            </CardTitle>
            <CardDescription className="text-base">
              Sign in to access your hybrid search dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-(--palette-foreground)">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--palette-accent)]" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 border-2 border-[var(--palette-border)] focus:border-[var(--palette-accent)] focus:ring-[var(--palette-ring)]"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[var(--palette-foreground)]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--palette-accent)]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-2 border-[var(--palette-border)] focus:border-[var(--palette-accent)] focus:ring-[var(--palette-ring)]"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-[var(--palette-accent)] hover:bg-[var(--palette-foreground)] text-white font-semibold py-6 text-base transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Demo credentials: <span className="font-semibold">admin / admin123</span>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
