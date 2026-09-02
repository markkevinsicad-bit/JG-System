"use client";

import { useState } from "react";
import { Search, Bell, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "./sidebar";
import { Profile } from "@/types";
import { cn } from "@/lib/utils";

export function Header({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const current = navItems.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );
  const isAdmin = profile.role === "admin";
  const items = navItems.filter((i) => !i.adminOnly || isAdmin);
  const initial = profile.full_name?.[0]?.toUpperCase() ?? "U";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-border bg-white/80 px-4 py-3.5 backdrop-blur-md md:px-8">
        <button
          className="rounded-lg p-2 hover:bg-gray-light md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5 text-navy" />
        </button>

        <h1 className="hidden text-lg font-semibold text-navy md:block">
          {current?.label ?? "Dashboard"}
        </h1>

        <form onSubmit={handleSearch} className="relative ml-auto flex max-w-md flex-1 items-center md:ml-8">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, expenses, vendors..."
            className="h-10 w-full rounded-lg border border-gray-border bg-gray-light/60 pl-10 pr-3 text-sm text-navy placeholder:text-gray-400 transition-colors focus:border-eng-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-eng-blue/20"
          />
        </form>

        <button className="relative rounded-lg p-2 hover:bg-gray-light">
          <Bell className="h-5 w-5 text-navy" />
        </button>

        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-eng-blue text-sm font-semibold text-white md:flex">
          {initial}
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="h-full w-64 bg-navy text-white animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-5">
              <p className="text-sm font-bold">JG Crystal King</p>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 px-3">
              {items.map(({ href, label, icon: Icon }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    pathname.startsWith(href) ? "bg-eng-blue text-white" : "text-white/70"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
