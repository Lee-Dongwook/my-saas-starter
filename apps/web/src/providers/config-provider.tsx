import { createContext, useContext, useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";

/** Mirrors `AppConfig` in apps/api/src/routes/config.ts. */
export interface AppConfig {
  app: { name: string };
  auth: {
    emailAndPassword: boolean;
    socialProviders: Array<"github" | "google">;
  };
  billing: { enabled: boolean };
}

/**
 * Used until `/api/config` answers, and as the fallback when it cannot be
 * reached — every optional feature is off, so the UI degrades to email +
 * password only rather than rendering buttons that would fail.
 */
const FALLBACK_CONFIG: AppConfig = {
  app: { name: "SaaS Starter" },
  auth: { emailAndPassword: true, socialProviders: [] },
  billing: { enabled: false },
};

const ConfigContext = createContext<AppConfig>(FALLBACK_CONFIG);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(FALLBACK_CONFIG);

  useEffect(() => {
    let active = true;
    apiFetch<AppConfig>("/api/config")
      .then((next) => {
        if (active) setConfig(next);
      })
      .catch((error) => {
        console.warn("Failed to load /api/config; using defaults.", error);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(ConfigContext);
}
