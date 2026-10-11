"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { cn } from "cn";

function ScrollArea({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    />
  );
}

function ScrollAreaViewport({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>) {
  return (
    <ScrollAreaPrimitive.Viewport
      data-slot="scroll-area-viewport"
      className={cn(
        "size-full rounded-[inherit] outline-none [&>div]:scrollbar-hidden",
        className,
      )}
      {...props}
    />
  );
}

function ScrollAreaScrollbar({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      className={cn(
        "flex select-none touch-none p-px transition-colors",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5",
        "data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-full",
        className,
      )}
      {...props}
    />
  );
}

function ScrollAreaThumb({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Thumb>) {
  return (
    <ScrollAreaPrimitive.Thumb
      data-slot="scroll-area-thumb"
      className={cn(
        "relative flex-1 rounded-full bg-border/80 transition-colors hover:bg-border",
        className,
      )}
      {...props}
    />
  );
}

function ScrollAreaCorner({
  className,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Corner>) {
  return (
    <ScrollAreaPrimitive.Corner
      data-slot="scroll-area-corner"
      className={cn("border-border", className)}
      {...props}
    />
  );
}

export {
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
};