"use client";

import { useActionState } from "react";
import { Flame, ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestPasswordResetAction, type AuthResult } from "@/lib/actions/auth-actions";

async function action(_prevState: AuthResult & { sent?: boolean }, formData: FormData): Promise<AuthResult & { sent?: boolean }> {
  const result = await requestPasswordResetAction(formData);
  return { ...result, sent: !result.error };
}

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-eng-blue shadow-lg overflow-hidden">
      <img src="/logo.png" alt="JG Crystal King" className="h-full w-full object-contain p-1.5" />
          </div>
          <h1 className="text-xl font-bold text-white">JG Crystal King</h1>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-xl">
          {state.sent ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-light">
                <MailCheck className="h-5 w-5 text-green" />
              </div>
              <h2 className="text-lg font-semibold text-navy">Check your email</h2>
              <p className="mt-1.5 text-sm text-gray-500">
                If an account exists for that email, we&apos;ve sent password reset instructions.
              </p>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-lg font-semibold text-navy">Reset your password</h2>
              <p className="mb-6 text-sm text-gray-500">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {state.error && (
                <div className="mb-4 rounded-lg bg-red-light px-3 py-2.5 text-sm text-red">{state.error}</div>
              )}

              <form action={formAction} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="you@jgcrystalking.com" />
                </div>
                <Button type="submit" className="w-full" loading={pending}>
                  {pending ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}

          <Link href="/login" className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-eng-blue hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
