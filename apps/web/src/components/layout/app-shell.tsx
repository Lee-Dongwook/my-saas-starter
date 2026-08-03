import { LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";

import { cn } from "@/lib/cn";
import { useAppConfig } from "@/providers/config-provider";

import { OrgSwitcher } from "./org-switcher";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

/**
 * Sidebar entries. Sections are added as their screens land, so every item
 * here always points at a route that exists.
 */
const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/settings", label: "Settings", icon: Settings, end: false },
];

function SidebarContent() {
  const { app } = useAppConfig();

  return (
    <div className="flex h-full flex-col gap-4 p-3">
      <span className="px-2 pt-1 text-sm font-semibold tracking-tight">
        {app.name}
      </span>

      <OrgSwitcher />

      <nav className="flex flex-1 flex-col gap-1">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",
              )
            }
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

/** Sidebar + top bar frame for every signed-in screen. */
export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Navigating on mobile should dismiss the drawer.
  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-background lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 animate-fade-in bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border bg-background">
            <SidebarContent />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
          >
            {mobileOpen ? (
              <X aria-hidden className="size-4" />
            ) : (
              <Menu aria-hidden className="size-4" />
            )}
            <span className="sr-only">Open navigation</span>
          </button>

          <div className="flex-1" />
          <ThemeToggle />
          <UserMenu />
        </header>

        <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
