"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  Wallet,
  BarChart3,
  Calendar,
  FileText,
  Users,
  Settings,
  Flame,
  History,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth-actions";
import { Profile } from "@/types";

export const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/projects", label: "Projects", icon: FolderKanban, adminOnly: false },
  { href: "/expenses", label: "Expenses", icon: Receipt, adminOnly: false },
  { href: "/budgets", label: "Budgets", icon: Wallet, adminOnly: true },
  { href: "/reports", label: "Reports", icon: BarChart3, adminOnly: true },
  { href: "/calendar", label: "Calendar", icon: Calendar, adminOnly: false },
  { href: "/documents", label: "Documents", icon: FileText, adminOnly: false },
  { href: "/staff", label: "Staff", icon: Users, adminOnly: true },
  { href: "/activity", label: "Activity Log", icon: History, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: false },
];

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const isAdmin = profile.role === "admin";
  const items = navItems.filter((i) => !i.adminOnly || isAdmin);
  const initial = profile.full_name?.[0]?.toUpperCase() ?? "U";

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-gray-border bg-navy text-white md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-eng-blue">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">JG Crystal King</p>
          <p className="text-[11px] text-white/50">Engineering Services</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-eng-blue text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-eng-blue text-sm font-semibold">
              {initial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-navy bg-green" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{profile.full_name}</p>
            <p className="truncate text-xs text-white/50">{isAdmin ? "Admin" : "Staff"}</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              title="Sign out"
              className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
