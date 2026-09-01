"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sections = ["General", "Profile", "Appearance", "System", "Security"];

export default function SettingsPage() {
  const [active, setActive] = useState("General");

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible animate-fade-in-up">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3.5 py-2 text-left text-sm font-medium transition-colors",
                active === s ? "bg-eng-blue-light text-eng-blue" : "text-gray-500 hover:bg-gray-light"
              )}
            >
              {s}
            </button>
          ))}
        </nav>

        <Card className="animate-fade-in-up" hover>
          {active === "General" && (
            <>
              <CardHeader><CardTitle>General</CardTitle></CardHeader>
              <div className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input defaultValue="JG Crystal King Engineering Services" />
                </div>
                <div>
                  <Label>System Name</Label>
                  <Input defaultValue="JG Crystal King — Project & Expense Management System" />
                </div>
              </div>
            </>
          )}

          {active === "Profile" && (
            <>
              <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-eng-blue text-xl font-semibold text-white">A</div>
                  <Button variant="secondary" size="sm">Change Avatar</Button>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input defaultValue="Admin User" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input defaultValue="admin@jgcrystalking.com" type="email" />
                </div>
              </div>
            </>
          )}

          {active === "Appearance" && (
            <>
              <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
              <div>
                <Label>Theme</Label>
                <Select defaultValue="system">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
              </div>
            </>
          )}

          {active === "System" && (
            <>
              <CardHeader><CardTitle>System</CardTitle></CardHeader>
              <div className="space-y-4">
                <div>
                  <Label>Expense Categories</Label>
                  <p className="text-xs text-gray-400">Managed under Expenses — configurable list coming in Phase 2.</p>
                </div>
                <div>
                  <Label>Service Types</Label>
                  <p className="text-xs text-gray-400">Currently fixed; will be Admin-configurable in Phase 2.</p>
                </div>
              </div>
            </>
          )}

          {active === "Security" && (
            <>
              <CardHeader><CardTitle>Security</CardTitle></CardHeader>
              <div className="space-y-4">
                <div>
                  <Label>Password</Label>
                  <Button variant="secondary" size="sm">Change Password</Button>
                </div>
                <div>
                  <Label>Session</Label>
                  <p className="text-xs text-gray-400">Signed in via Supabase Authentication.</p>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end border-t border-gray-border pt-4">
            <Button size="sm">Save Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
