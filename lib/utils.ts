import { cn as cnUtility } from "cn";

export function cn(...args: Parameters<typeof cnUtility>) {
  return cnUtility(...args);
}

export function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getBookingStatusVariant(
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED",
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "CONFIRMED":
      return "default";
    case "CANCELLED":
      return "destructive";
    case "COMPLETED":
      return "secondary";
    default:
      return "outline";
  }
}

export function getRoleLabel(role: "OWNER" | "ADMIN" | "RECEPTIONIST"): string {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    case "RECEPTIONIST":
      return "Receptionist";
    default:
      return role;
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
