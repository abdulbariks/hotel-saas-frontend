"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Building2,
  LogOut,
  Hotel,
  Menu,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { TenantSwitcher } from "@/components/tenant-switcher";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Rooms", href: "/rooms", icon: BedDouble },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Hotels", href: "/tenants", icon: Building2 },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon as LucideIcon;
        const isActive =
          pathname === item.href ||
          pathname?.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className={cn("w-full justify-start gap-2", isActive && "font-medium")}
            >
              <Icon className="size-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

export function UserNav() {
  const { user, logout } = useAuth();
  const email = user?.email ?? "Guest";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-2 px-2">
            <Avatar className="size-6">
              <AvatarFallback className="text-[10px]">
                {email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-28 truncate text-sm font-medium lg:block">
              {email}
            </span>
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col gap-1 px-2 py-1.5">
          <p className="truncate text-sm font-medium">{email}</p>
          <p className="truncate text-xs text-muted-foreground">
            Account owner
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link
              href="/tenants"
              className="flex w-full cursor-pointer items-center gap-2"
            >
              <Building2 className="size-4" />
              Manage hotels
            </Link>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={logout}
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Hotel className="size-4" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Hotel SaaS</span>
        <ThemeToggle />
      </div>

      <div className="border-b p-3">
        <TenantSwitcher />
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-3">
          <div className="flex flex-col gap-1">
            <p className="px-2 text-xs font-medium text-muted-foreground">
              Management
            </p>
            <NavItems />
          </div>
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <UserNav />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex h-14 items-center gap-2 border-b px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Open menu" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Hotel SaaS</span>
          </div>
          <div className="border-b p-3">
            <TenantSwitcher />
          </div>
          <ScrollArea className="h-[calc(100%-10rem)] p-3">
            <NavItems onNavigate={() => setOpen(false)} />
          </ScrollArea>
          <div className="border-t p-3">
            <UserNav />
          </div>
        </SheetContent>
      </Sheet>
      <span className="text-sm font-semibold tracking-tight">Hotel SaaS</span>
      <div className="ml-auto md:hidden">
        <ThemeToggle />
      </div>
    </div>
  );
}
