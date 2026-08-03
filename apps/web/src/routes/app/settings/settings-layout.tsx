import { NavLink, Outlet } from "react-router";

import { cn } from "@/lib/cn";

/** Sections are appended here as their screens land. */
const sections = [
  { to: "/settings/organization", label: "Organization" },
  { to: "/settings/members", label: "Members" },
  { to: "/settings/billing", label: "Billing" },
];

export function SettingsLayout() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization and the people in it.
        </p>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        {sections.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}
