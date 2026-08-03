import { Outlet } from "react-router";

import { useAppConfig } from "@/providers/config-provider";

/** Centred, single-column frame shared by every unauthenticated screen. */
export function AuthLayout() {
  const { app } = useAppConfig();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/40 px-4 py-12">
      <span className="text-lg font-semibold tracking-tight">{app.name}</span>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
