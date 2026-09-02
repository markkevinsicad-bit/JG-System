"use client";

import { Suspense, useActionState, useState } from "react";
import { Flame, Eye, EyeOff } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInAction, type AuthResult } from "@/lib/actions/auth-actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

async function action(_prevState: AuthResult, formData: FormData): Promise<AuthResult> {
  return signInAction(formData);
}

function InactiveNotice() {
  const searchParams = useSearchParams();
  const inactiveNotice = searchParams.get("error") === "account_inactive";
  if (!inactiveNotice) return null;
  return (
    <div className="mb-4 rounded-lg bg-orange-light px-3 py-2.5 text-sm text-orange animate-fade-in">
      This account has been deactivated. Contact your administrator.
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-eng-blue shadow-lg overflow-hidden">
        <img src="public/logo.png" alt="JG Crystal King" className="h-full w-full object-contain p-1.5" />
          </div>
          <h1 className="text-xl font-bold text-white">JG Crystal King</h1>
          <p className="text-sm text-white/50">Engineering Services</p>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-xl">
          <h2 className="mb-1 text-lg font-semibold text-navy">Welcome back</h2>
          <p className="mb-6 text-sm text-gray-500">Sign in to your account to continue.</p>

          <Suspense fallback={null}>
            <InactiveNotice />
          </Suspense>

          {state.error && (
            <div className="mb-4 rounded-lg bg-red-light px-3 py-2.5 text-sm text-red animate-fade-in">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@jgcrystalking.com" required autoComplete="email" />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs font-medium text-eng-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" loading={pending}>
              {pending ? "Signing in..." : "Sign In"}
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
