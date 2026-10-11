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

const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerAccount } = useAuth();
  const [serverError, setServerError] = React.useState<string>();
  const [isPending, setIsPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsPending(true);
    setServerError(undefined);

    try {
      await registerAccount(data.email, data.password);
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
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <FieldDescription className="px-2 text-center">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        >
          Sign in
        </Link>
      </FieldDescription>
    </form>
  );
}
