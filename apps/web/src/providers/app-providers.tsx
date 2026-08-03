import { ToastProvider } from "@/components/ui/toast";

import { ConfigProvider } from "./config-provider";
import { ThemeProvider } from "./theme-provider";

/** Single place to compose every app-wide provider. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <ToastProvider>{children}</ToastProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
