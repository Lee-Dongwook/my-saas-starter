import { Check, Monitor, Moon, Sun } from "lucide-react";

import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/cn";
import { useTheme, type Theme } from "@/providers/theme-provider";

const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu
      align="end"
      trigger={(props) => (
        <button
          {...props}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {resolvedTheme === "dark" ? (
            <Moon aria-hidden className="size-4" />
          ) : (
            <Sun aria-hidden className="size-4" />
          )}
          <span className="sr-only">Change theme</span>
        </button>
      )}
    >
      {options.map(({ value, label, icon: Icon }) => (
        <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
          <Icon />
          <span className="flex-1">{label}</span>
          <Check
            className={cn(
              "size-4",
              theme === value ? "opacity-100" : "opacity-0",
            )}
          />
        </DropdownMenuItem>
      ))}
    </DropdownMenu>
  );
}
