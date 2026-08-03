import dns from "dns";
import { join } from "path";

import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";
import { UserConfig, defineConfig, loadEnv } from "vite";

dns.setDefaultResultOrder("verbatim");

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd());

  const envWithProcessPrefix = Object.entries(env).reduce(
    (prev, [key, val]) => {
      return {
        ...prev,
        ["process.env." + key]: `"${val}"`,
      };
    },
    {},
  );

  return {
    plugins: [react(), legacy(), viteCommonjs()],
    resolve: {
      // Mirrors the "@/*" -> "./src/*" mapping in tsconfig.json.
      alias: {
        "@": join(import.meta.dirname, "src"),
      },
    },
    server: {
      port: 3000,
      host: "localhost",
      open: true,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          ws: true,
          cookieDomainRewrite: "localhost",
          secure: false,
        },
      },
    },
    preview: {
      port: 4300,
      host: "localhost",
    },
    define: {
      ...envWithProcessPrefix,
      // Always defined, so `process.env.VITE_API_URL` never survives into the
      // bundle as a reference to the (browser-absent) `process` global.
      "process.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL ?? ""),
    },
    css: {
      postcss: {
        plugins: [
          tailwind({ config: join(import.meta.dirname, "tailwind.config.ts") }),
          autoprefixer(),
        ],
      },
    },
    build: {
      outDir: "build",
    },
  };
});
