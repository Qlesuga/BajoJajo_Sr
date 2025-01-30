"use client";

import { HeroUIProvider } from "@heroui/react";
import { TRPCReactProvider } from "~/trpc/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <HeroUIProvider>{children}</HeroUIProvider>
    </TRPCReactProvider>
  );
}
