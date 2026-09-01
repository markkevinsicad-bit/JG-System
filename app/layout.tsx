import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JG Crystal King | Project & Expense Management",
  description: "Project, budget, and expense management system for JG Crystal King Engineering Services.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
