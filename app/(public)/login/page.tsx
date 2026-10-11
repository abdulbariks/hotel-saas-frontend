import { Metadata } from "next";
import { Hotel } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in | Hotel SaaS",
  description: "Sign in to your hotel management account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Hotel className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage your hotel
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Suspense
              fallback={<div className="h-72 animate-pulse rounded-md bg-muted" />}
            >
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          New here? Create an account to set up your first hotel
        </p>
      </div>
    </div>
  );
}
