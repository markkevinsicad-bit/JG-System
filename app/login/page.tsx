"use client";

import { useState } from "react";
import { Flame, Eye, EyeOff } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Phase 1: UI + architecture only. Real Supabase sign-in wiring
    // and error handling arrive in Phase 2.
    setTimeout(() => {
      setLoading(false);
      setError("Authentication will be connected in Phase 2.");
    }, 900);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-eng-blue shadow-lg">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">JG Crystal King</h1>
          <p className="text-sm text-white/50">Engineering Services</p>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-xl">
          <h2 className="mb-1 text-lg font-semibold text-navy">Welcome back</h2>
          <p className="mb-6 text-sm text-gray-500">Sign in to your account to continue.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-light px-3 py-2.5 text-sm text-red animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@jgcrystalking.com" required />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-medium text-eng-blue hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-500">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-border text-eng-blue focus:ring-eng-blue/30" />
              Remember me
            </label>

            <Button type="submit" className="w-full" loading={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          © 2026 JG Crystal King Engineering Services
        </p>
      </div>
    </div>
  );
}
