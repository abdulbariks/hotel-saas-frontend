"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";
import { AppSidebar, MobileNav } from "@/components/app-sidebar";
import { Spinner } from "@/components/ui/spinner";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (initialized && !user) {
      router.replace("/login");
    }
  }, [initialized, user, router]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="size-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <MobileNav />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
