"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "~/shadcn/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <HeroUIProvider>{children}</HeroUIProvider>
      </ThemeProvider>
    </TRPCReactProvider>
  );
}
