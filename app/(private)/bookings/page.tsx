"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  useListBookingsQuery,
  useListRoomsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  getErrorMessage,
} from "@/features/api";
import { useAppSelector } from "@/hooks";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "cn";
import {
  Ban,
  CalendarDays,
  CalendarPlus,
  Search,
  User,
  Users,
} from "lucide-react";
import {
  formatCurrency,
  formatDateRange,
  getBookingStatusVariant,
} from "@/lib/utils";
import type { Booking } from "@/types/models";

const bookingSchema = z
  .object({
    roomId: z.string().min(1, "Please select a room"),
    guestName: z.string().min(1, "Guest name is required").max(100),
    guestEmail: z
      .string()
      .min(1, "Guest email is required")
      .email("Enter a valid email address"),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
    guests: z
      .string()
      .min(1, "Guest count is required")
      .regex(/^\d+$/, "Must be a whole number"),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

type BookingFormData = z.infer<typeof bookingSchema>;

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function useDefaultDates() {
  return React.useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      today: toDateInputValue(now),
      tomorrow: toDateInputValue(tomorrow),
    };
  }, []);
}

export default function BookingsPage() {
  const tenantId = useAppSelector((state) => state.tenant.currentTenantId);
  const {
    data: bookings = [],
    isLoading,
  } = useListBookingsQuery(undefined, { skip: !tenantId });
  const { data: rooms = [] } = useListRoomsQuery(undefined, {
    skip: !tenantId,
  });
  const [createBooking] = useCreateBookingMutation();
  const [cancelBooking] = useCancelBookingMutation();
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [cancellingBooking, setCancellingBooking] =
    React.useState<Booking | null>(null);
  const [cancellingId, setCancellingId] = React.useState<
    string | null
  >(null);

  const { today, tomorrow } = useDefaultDates();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomId: "",
      guestName: "",
      guestEmail: "",
      checkIn: today,
      checkOut: tomorrow,
      guests: "2",
    },
  });

  const selectedRoomId = useWatch({ control, name: "roomId" });
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
  const guestsValue = useWatch({ control, name: "guests" });

  const openCreate = () => {
    reset({
      roomId: "",
      guestName: "",
      guestEmail: "",
      checkIn: today,
      checkOut: tomorrow,
      guests: "2",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: BookingFormData) => {
    const guests = Number.parseInt(data.guests, 10);

    if (Number.isNaN(guests) || guests < 1 || guests > 50) {
      toast({
        title: "Invalid guest count",
        description: "Guests must be between 1 and 50.",
        variant: "error",
      });
      return;
    }

    if (selectedRoom && guests > selectedRoom.capacity) {
      toast({
        title: "Too many guests",
        description: `${selectedRoom.name} can host up to ${selectedRoom.capacity} guest${
          selectedRoom.capacity === 1 ? "" : "s"
        }.`,
        variant: "error",
      });
      return;
    }

    try {
      await createBooking({ ...data, guests }).unwrap();
      toast({
        title: "Booking created",
        description: `${data.guestName} booked ${
          selectedRoom?.name ?? "a room"
        } for ${guests} guest${guests === 1 ? "" : "s"}.`,
        variant: "success",
      });
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: "Booking failed",
        description: getErrorMessage(error),
        variant: "error",
      });
    }
  };

  const onCancel = async () => {
    if (!cancellingBooking) return;

    setCancellingId(cancellingBooking.id);

    try {
      await cancelBooking({
        bookingId: cancellingBooking.id,
      }).unwrap();
      toast({
        title: "Booking cancelled",
        description: `Booking for ${cancellingBooking.guestName} has been cancelled.`,
        variant: "success",
      });
      setCancellingBooking(null);
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: getErrorMessage(error),
        variant: "error",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.guestName.toLowerCase().includes(search.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(search.toLowerCase()) ||
      (booking.room?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const guestCapacity = selectedRoom?.capacity ?? 50;
  const guestsOverCapacity =
    Number(guestsValue) > guestCapacity &&
    !errors.guests;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bookings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage reservations for your hotel
          </p>
        </div>
        <Button onClick={openCreate}>
          <CalendarPlus className="size-4" />
          New booking
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">
              All bookings
            </CardTitle>
            <CardDescription>
              {bookings.length} reservation
              {bookings.length === 1 ? "" : "s"} on record
            </CardDescription>
          </div>
          <InputGroup className="sm:w-72">
            <InputGroupAddon align="inline-start">
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guests or rooms..."
              aria-label="Search bookings"
            />
          </InputGroup>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <CalendarDays className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium">
                No bookings found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "No bookings match your search."
                  : "Create your first booking to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-center">Guests</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {booking.guestName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booking.guestEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.room?.name ?? booking.roomId}
                    </TableCell>
                    <TableCell>
                      <span className="whitespace-nowrap text-muted-foreground">
                        {formatDateRange(
                          booking.checkIn,
                          booking.checkOut,
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Users className="size-3.5" />
                        {booking.guests}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(booking.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getBookingStatusVariant(
                          booking.status,
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === "CONFIRMED" ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Cancel booking for ${booking.guestName}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setCancellingBooking(booking)}
                        >
                          <Ban className="size-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New booking</DialogTitle>
            <DialogDescription>
              Create a reservation for a guest.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="booking-room">Room</FieldLabel>
              <Select
                value={selectedRoomId}
                onValueChange={(value) => setValue("roomId", value ?? "")}
              >
                <SelectTrigger
                  id="booking-room"
                  className="w-full"
                  aria-invalid={!!errors.roomId}
                >
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} · {formatCurrency(room.price)} / night ·{" "}
                      {room.capacity} guests
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roomId && (
                <FieldError>{errors.roomId.message}</FieldError>
              )}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="booking-checkin">
                  Check-in
                </FieldLabel>
                <Input
                  id="booking-checkin"
                  type="date"
                  min={today}
                  aria-invalid={!!errors.checkIn}
                  {...register("checkIn")}
                />
                {errors.checkIn && (
                  <FieldError>{errors.checkIn.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="booking-checkout">
                  Check-out
                </FieldLabel>
                <Input
                  id="booking-checkout"
                  type="date"
                  min={today}
                  aria-invalid={!!errors.checkOut}
                  {...register("checkOut")}
                />
                {errors.checkOut && (
                  <FieldError>{errors.checkOut.message}</FieldError>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="booking-guest-name">
                Guest name
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <User className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="booking-guest-name"
                  placeholder="John Doe"
                  aria-invalid={!!errors.guestName}
                  {...register("guestName")}
                />
              </InputGroup>
              {errors.guestName && (
                <FieldError>{errors.guestName.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="booking-guest-email">
                Guest email
              </FieldLabel>
              <Input
                id="booking-guest-email"
                type="email"
                placeholder="john@example.com"
                aria-invalid={!!errors.guestEmail}
                {...register("guestEmail")}
              />
              {errors.guestEmail && (
                <FieldError>{errors.guestEmail.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="booking-guests">Guests</FieldLabel>
              <Input
                id="booking-guests"
                type="number"
                min="1"
                max={guestCapacity}
                placeholder="2"
                aria-invalid={!!errors.guests || guestsOverCapacity}
                {...register("guests")}
              />
              <FieldDescription>
                Room capacity: {guestCapacity} guest
                {guestCapacity === 1 ? "" : "s"}
              </FieldDescription>
              {(errors.guests || guestsOverCapacity) && (
                <FieldError>
                  {errors.guests?.message ??
                    `Guests cannot exceed room capacity (${guestCapacity})`}
                </FieldError>
              )}
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="size-4" />}
                Create booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!cancellingBooking}
        onOpenChange={(open) => !open && setCancellingBooking(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the booking for{" "}
              <span className="font-medium">
                &quot;{cancellingBooking?.guestName}&quot;
              </span>{" "}
              ({formatDateRange(
                cancellingBooking?.checkIn ?? "",
                cancellingBooking?.checkOut ?? "",
              )}
              )? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
              onClick={onCancel}
              disabled={cancellingId !== null}
            >
              {cancellingId !== null && (
                <Spinner className="size-4" />
              )}
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
