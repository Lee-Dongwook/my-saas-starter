import dns from "dns";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

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
    define: envWithProcessPrefix,
    css: {
      postcss: {
        plugins: [
          tailwind({ config: join(__dirname, "tailwind.config.ts") }),
          autoprefixer(),
        ],
      },
    },
    build: {
      outDir: "build",
    },
  };
});
