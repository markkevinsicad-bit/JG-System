"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Plus, Receipt, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { navItems } from "./sidebar";

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/expenses/new", label: "Add", icon: Plus, isAction: true },
    { href: "/expenses", label: "Expenses", icon: Receipt },
  ];

  return (
    <>
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 animate-fade-in md:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 rounded-t-2xl bg-white p-3 shadow-lg animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems
              .filter((i) => !items.some((b) => b.href === i.href))
              .map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-navy hover:bg-gray-light"
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </Link>
              ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-border bg-white py-2 md:hidden">
        {items.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium",
                active ? "text-eng-blue" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}

        <Link
          href="/expenses/new"
          className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-eng-blue text-white shadow-lg transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </Link>

        {items.slice(3).map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium",
                active ? "text-eng-blue" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}

        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium text-gray-400"
        >
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>
    </>
  );
}
