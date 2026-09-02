import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-light">
        <ShieldAlert className="h-8 w-8 text-red" />
      </div>
      <h1 className="text-xl font-bold text-navy">You don&apos;t have access to this page</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        This area is restricted to administrators. If you believe this is a mistake, contact your system administrator.
      </p>
      <Link href="/dashboard">
        <Button className="mt-6">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
