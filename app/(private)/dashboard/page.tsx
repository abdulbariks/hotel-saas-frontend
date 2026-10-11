"use client";

import Link from "next/link";
import {
  useListTenantsQuery,
  useListRoomsQuery,
  useListBookingsQuery,
} from "@/features/api/authApi";
import { useAppSelector } from "@/hooks";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getBookingStatusVariant, formatCurrency, formatDateRange } from "@/lib/utils";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Hotel,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const tenantId = useAppSelector((state) => state.tenant.currentTenantId);
  const { data: tenants = [], isLoading: tenantsLoading } = useListTenantsQuery();
  const { data: rooms = [], isLoading: roomsLoading } = useListRoomsQuery(undefined, {
    skip: !tenantId,
  });
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
  } = useListBookingsQuery(undefined, { skip: !tenantId });

  const hasTenants = tenants.length > 0;
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.total), 0);
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  );
  const occupancyRate =
    rooms.length > 0
      ? Math.min(100, Math.round((confirmedBookings.length / rooms.length) * 100))
      : 0;

  const stats = [
    {
      label: "Total Rooms",
      value: String(rooms.length),
      icon: BedDouble,
      trend: "Active listings",
    },
    {
      label: "Active Bookings",
      value: String(confirmedBookings.length),
      icon: CalendarDays,
      trend: "Confirmed reservations",
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: Building2,
      trend: "Current period",
    },
    {
      label: "Revenue",
      value: formatCurrency(totalRevenue),
      icon: CircleDollarSign,
      trend: "Total earnings",
    },
  ];

  const isLoading = tenantsLoading || roomsLoading || bookingsLoading;

  if (!hasTenants && !tenantsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
              <Hotel className="size-6 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No hotel yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first hotel to start managing rooms and bookings.
            </p>
            <Button
              className="mt-6"
              render={<Link href="/tenants" />}
            >
              <Plus className="size-4" />
              Create your first hotel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your hotel operations
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-7 w-16" />
                <Skeleton className="mt-2 h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              render={<Link href="/rooms" />}
            >
              <BedDouble className="size-4" />
              Manage rooms
              <ArrowRight className="ml-auto size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              render={<Link href="/bookings" />}
            >
              <CalendarDays className="size-4" />
              View bookings
              <ArrowRight className="ml-auto size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              render={<Link href="/tenants" />}
            >
              <Building2 className="size-4" />
              Manage hotels
              <ArrowRight className="ml-auto size-4 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent bookings</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/bookings" />}
            >
              View all
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : bookings.length > 0 ? (
              <div className="flex flex-col divide-y">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {booking.guestName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {booking.room?.name ?? booking.roomId} ·{" "}
                        {formatDateRange(booking.checkIn, booking.checkOut)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={getBookingStatusVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatCurrency(booking.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No bookings yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
