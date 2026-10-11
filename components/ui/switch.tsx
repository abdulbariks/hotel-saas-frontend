"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

const SwitchRoot = SwitchPrimitive.Root;

function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchRoot
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-checked:bg-primary data-unchecked:bg-input aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:data-unchecked:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-300 ease-in-out data-checked:translate-x-4 data-unchecked:translate-x-0 data-starting:transition-none data-ending:transition-none",
          "data-[dragging]:scale-110"
        )}
      />
    </SwitchRoot>
  );
}

export { Switch };
