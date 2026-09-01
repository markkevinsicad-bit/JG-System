"use client";

import { Search, Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { navItems } from "./sidebar";

export function Header() {
  const pathname = usePathname();
  const current = navItems.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-gray-border bg-white/80 px-4 py-3.5 backdrop-blur-md md:px-8">
      <button className="rounded-lg p-2 hover:bg-gray-light md:hidden">
        <Menu className="h-5 w-5 text-navy" />
      </button>

      <h1 className="hidden text-lg font-semibold text-navy md:block">
        {current?.label ?? "Dashboard"}
      </h1>

      <div className="relative ml-auto flex max-w-md flex-1 items-center md:ml-8">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects, expenses, vendors..."
          className="h-10 w-full rounded-lg border border-gray-border bg-gray-light/60 pl-10 pr-3 text-sm text-navy placeholder:text-gray-400 transition-colors focus:border-eng-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-eng-blue/20"
        />
      </div>

      <button className="relative rounded-lg p-2 hover:bg-gray-light">
        <Bell className="h-5 w-5 text-navy" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red" />
      </button>

      <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-eng-blue text-sm font-semibold text-white md:flex">
        A
      </div>
    </header>
  );
}
