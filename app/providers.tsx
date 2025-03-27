"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { store } from "@/lib/store/store";
import { ThemeProvider } from "next-themes";
import { Provider } from "react-redux";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <TooltipProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TooltipProvider>
    </Provider>
  );
}
