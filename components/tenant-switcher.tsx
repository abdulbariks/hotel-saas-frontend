"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useListTenantsQuery } from "@/features/api/authApi";
import {
  setCurrentTenant,
} from "@/features/tenant/tenantSlice";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { Hotel } from "lucide-react";

export function TenantSwitcher() {
  const dispatch = useAppDispatch();
  const currentTenantId = useAppSelector(
    (state) => state.tenant.currentTenantId,
  );
  const { data: tenants, isLoading } = useListTenantsQuery();

  React.useEffect(() => {
    if (
      tenants?.length &&
      !currentTenantId &&
      !tenants.some((t) => t.id === currentTenantId)
    ) {
      dispatch(setCurrentTenant(tenants[0].id));
    }
  }, [tenants, currentTenantId, dispatch]);

  if (isLoading || !tenants?.length) {
    return (
      <div className="flex h-8 w-full items-center gap-2 rounded-lg px-2.5 text-sm text-muted-foreground">
        <Hotel className="size-4 shrink-0" />
        <span className="truncate">No hotel selected</span>
      </div>
    );
  }

  return (
    <Select
      value={currentTenantId ?? ""}
      onValueChange={(value) => dispatch(setCurrentTenant(value || null))}
    >
      <SelectTrigger
        size="sm"
        className="w-full justify-start gap-2 border-transparent bg-transparent font-medium shadow-none hover:bg-muted"
        aria-label="Select hotel"
      >
        <Hotel className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Select hotel" />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            {tenant.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TenantBadge() {
  const currentTenantId = useAppSelector(
    (state) => state.tenant.currentTenantId,
  );
  const { data: tenants } = useListTenantsQuery();
  const tenant = tenants?.find((t) => t.id === currentTenantId);

  if (!tenant) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      <Hotel className="size-3" />
      {tenant.name}
    </span>
  );
}
