"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/features/auth/AuthProvider";
import { getErrorMessage } from "@/features/api";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const [serverError, setServerError] = React.useState<string>();
  const [isPending, setIsPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsPending(true);
    setServerError(undefined);

    try {
      await login(data.email, data.password);
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <FieldError>{errors.email.message}</FieldError>}
      </Field>

      <Field>
        <div className="flex items-center">
          <FieldLabel htmlFor="password">Password</FieldLabel>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && <FieldError>{errors.password.message}</FieldError>}
      </Field>

      {serverError && <FieldError>{serverError}</FieldError>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Spinner className="size-4" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <FieldDescription className="px-2 text-center">
        Don&#39;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        >
          Sign up
        </Link>
      </FieldDescription>
    </form>
  );
}
