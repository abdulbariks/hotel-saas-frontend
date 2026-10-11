"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useListTenantsQuery,
  useCreateTenantMutation,
  getErrorMessage,
} from "@/features/api";
import { setCurrentTenant } from "@/features/tenant/tenantSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Building2, Check, Plus, Settings2 } from "lucide-react";

const createTenantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens",
    ),
});

type CreateTenantForm = z.infer<typeof createTenantSchema>;

export default function TenantsPage() {
  const dispatch = useAppDispatch();
  const currentTenantId = useAppSelector(
    (state) => state.tenant.currentTenantId,
  );
  const { data: tenants = [], isLoading } = useListTenantsQuery();
  const [createTenant] = useCreateTenantMutation();
  const { toast } = useToast();

  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { name: "", slug: "" },
  });

  const onSubmit = async (data: CreateTenantForm) => {
    try {
      const tenant = await createTenant(data).unwrap();

      if (!currentTenantId) {
        dispatch(setCurrentTenant(tenant.id));
      }

      toast({
        title: "Hotel created",
        description: `${data.name} has been added to your account.`,
        variant: "success",
      });
      reset({ name: "", slug: "" });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Creation failed",
        description: getErrorMessage(error),
        variant: "error",
      });
    }
  };

  const setCurrent = (tenantId: string, name: string) => {
    dispatch(setCurrentTenant(tenantId));
    toast({
      title: "Hotel selected",
      description: `${name} is now your active hotel.`,
      variant: "success",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hotels
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the hotels in your organization
          </p>
        </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="size-4" />
                  Add hotel
                </Button>
              }
            />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create hotel</DialogTitle>
              <DialogDescription>
                Add a new hotel to your organization.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Field>
                <FieldLabel htmlFor="tenant-name">
                  Hotel name
                </FieldLabel>
                <Input
                  id="tenant-name"
                  placeholder="Grand Hotel"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="tenant-slug">Slug</FieldLabel>
                <Input
                  id="tenant-slug"
                  placeholder="grand-hotel"
                  aria-invalid={!!errors.slug}
                  {...register("slug")}
                />
                <FieldDescription>
                  Used in URLs: /hotels/grand-hotel
                </FieldDescription>
                {errors.slug && (
                  <FieldError>{errors.slug.message}</FieldError>
                )}
              </Field>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner className="size-4" />}
                  Create hotel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tenants.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => {
            const isCurrent = tenant.id === currentTenantId;

            return (
              <Card
                key={tenant.id}
                className={
                  isCurrent ? "ring-1 ring-primary" : undefined
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="size-4 text-muted-foreground" />
                    </div>
                    {isCurrent ? (
                      <Badge variant="secondary">
                        <Check className="size-3" />
                        Current
                      </Badge>
                    ) : (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 text-base">
                    {tenant.name}
                  </CardTitle>
                  <CardDescription>/{tenant.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(tenant.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrent(tenant.id, tenant.name)
                        }
                      >
                        <Settings2 className="size-3.5" />
                        Set current
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
              <Building2 className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No hotels yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first hotel to start managing rooms,
              pricing, and bookings.
            </p>
            <Button className="mt-6" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Create your first hotel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
