"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  useListRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
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
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
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
  BedDouble,
  DoorClosed,
  DoorOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { CreateRoomRequest, RoomType } from "@/types/models";

const roomSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100),
  type: z.string().min(1, "Please select a room type"),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price (e.g. 149.99)"),
  capacity: z
    .string()
    .min(1, "Capacity is required")
    .regex(/^\d+$/, "Capacity must be a whole number"),
});

type RoomFormData = z.infer<typeof roomSchema>;

const ROOM_TYPES = [
  "SINGLE",
  "DOUBLE",
  "TWIN",
  "STANDARD",
  "DELUXE",
  "SUITE",
  "FAMILY",
  "PRESIDENT",
];

function formatRoomType(type: string): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export default function RoomsPage() {
  const tenantId = useAppSelector((state) => state.tenant.currentTenantId);
  const {
    data: rooms = [],
    isLoading,
  } = useListRoomsQuery({ includeInactive: true }, { skip: !tenantId });
  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [deleteRoom] = useDeleteRoomMutation();
  const { toast } = useToast();

  const [search, setSearch] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<RoomType | null>(
    null,
  );
  const [deletingRoom, setDeletingRoom] = React.useState<RoomType | null>(
    null,
  );
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof roomSchema>>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      type: "",
      price: "",
      capacity: "2",
    },
  });

  const selectedType = useWatch({ control, name: "type" });

  const openCreate = () => {
    setEditingRoom(null);
    reset({ name: "", type: "", price: "", capacity: "2" });
    setDialogOpen(true);
  };

  const openEdit = (room: RoomType) => {
    setEditingRoom(room);
    reset({
      name: room.name,
      type: room.type,
      price: String(room.price),
      capacity: String(room.capacity),
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: RoomFormData) => {
    const capacity = Number.parseInt(data.capacity, 10);

    if (Number.isNaN(capacity) || capacity < 1 || capacity > 50) {
      toast({
        title: "Invalid capacity",
        description: "Capacity must be between 1 and 50.",
        variant: "error",
      });
      return;
    }

    const payload: CreateRoomRequest = {
      name: data.name,
      type: data.type,
      price: Number(data.price),
      capacity,
    };

    try {
      if (editingRoom) {
        await updateRoom({
          roomId: editingRoom.id,
          body: payload,
        }).unwrap();
        toast({
          title: "Room updated",
          description: `${data.name} has been updated.`,
          variant: "success",
        });
      } else {
        await createRoom(payload).unwrap();
        toast({
          title: "Room created",
          description: `${data.name} has been created.`,
          variant: "success",
        });
      }
      setDialogOpen(false);
      reset({ name: "", type: "", price: "", capacity: "2" });
    } catch (error) {
      toast({
        title: editingRoom ? "Update failed" : "Creation failed",
        description: getErrorMessage(error),
        variant: "error",
      });
    }
  };

  const onDelete = async () => {
    if (!deletingRoom) return;

    try {
      await deleteRoom({ roomId: deletingRoom.id }).unwrap();
      toast({
        title: "Room deleted",
        description: `${deletingRoom.name} has been removed.`,
        variant: "success",
      });
      setDeletingRoom(null);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "error",
      });
    }
  };

  const onToggleActive = async (room: RoomType) => {
    setTogglingId(room.id);

    try {
      await updateRoom({
        roomId: room.id,
        body: { isActive: !room.isActive },
      }).unwrap();
      toast({
        title: room.isActive ? "Room deactivated" : "Room activated",
        description: `${room.name} is now ${
          room.isActive ? "unavailable" : "available"
        } for booking.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: getErrorMessage(error),
        variant: "error",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.type.toLowerCase().includes(search.toLowerCase()),
  );

  const typeLabel = selectedType ? formatRoomType(selectedType) : "Select type";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rooms</h1>
          <p className="text-sm text-muted-foreground">
            Manage room types and pricing for your hotel
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add room
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">All rooms</CardTitle>
            <CardDescription>
              {rooms.length} room type{rooms.length === 1 ? "" : "s"} configured
            </CardDescription>
          </div>
          <InputGroup className="sm:w-72">
            <InputGroupAddon align="inline-start">
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search rooms..."
              aria-label="Search rooms"
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
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <BedDouble className="size-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-medium">No rooms found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search
                  ? "No rooms match your search."
                  : "Add your first room type to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price / night</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <span className="font-medium">{room.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatRoomType(room.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${Number(room.price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Users className="size-3.5" />
                        {room.capacity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-2">
                        <Switch
                          checked={room.isActive}
                          disabled={togglingId === room.id}
                          onCheckedChange={() => onToggleActive(room)}
                          aria-label={`Toggle ${room.name} availability`}
                        />
                        {togglingId === room.id ? (
                          <Spinner className="size-3.5" />
                        ) : room.isActive ? (
                          <DoorOpen className="size-3.5 text-emerald-500" />
                        ) : (
                          <DoorClosed className="size-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Edit ${room.name}`}
                          onClick={() => openEdit(room)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${room.name}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingRoom(room)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
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
            <DialogTitle>
              {editingRoom ? "Edit room" : "Add room"}
            </DialogTitle>
            <DialogDescription>
              {editingRoom
                ? "Update the details of this room type."
                : "Create a new room type for your hotel."}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Field>
              <FieldLabel htmlFor="room-name">Room name</FieldLabel>
              <Input
                id="room-name"
                placeholder="Deluxe Suite"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="room-type">Room type</FieldLabel>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue("type", value ?? "")}
              >
                <SelectTrigger
                  id="room-type"
                  className="w-full"
                  aria-invalid={!!errors.type}
                >
                  <SelectValue placeholder={typeLabel} />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatRoomType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <FieldError>{errors.type.message}</FieldError>}
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="room-price">Price / night</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="room-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    aria-invalid={!!errors.price}
                    {...register("price")}
                  />
                  <InputGroupAddon align="inline-end">USD</InputGroupAddon>
                </InputGroup>
                {errors.price && (
                  <FieldError>{errors.price.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="room-capacity">Capacity</FieldLabel>
                <Input
                  id="room-capacity"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="2"
                  aria-invalid={!!errors.capacity}
                  {...register("capacity")}
                />
                {errors.capacity && (
                  <FieldError>{errors.capacity.message}</FieldError>
                )}
              </Field>
            </div>

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
                {editingRoom ? "Save changes" : "Create room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingRoom}
        onOpenChange={(open) => !open && setDeletingRoom(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">
                &quot;{deletingRoom?.name}&quot;
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
              onClick={onDelete}
            >
              Delete room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
