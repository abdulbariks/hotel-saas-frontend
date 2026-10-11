"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/AuthProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (initialized && user) {
      router.replace("/dashboard");
    }
  }, [user, initialized, router]);

  return <>{children}</>;
}
