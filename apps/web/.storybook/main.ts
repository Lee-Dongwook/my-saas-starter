import path from "path";
import { fileURLToPath } from "url";
import { mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/react-vite";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-themes"],
  staticDirs: ["../public"],
  core: {},
  async viteFinal(viteConfig) {
    return mergeConfig(viteConfig, {
      resolve: {
        alias: {
          "@storybook/addon-actions": path.resolve(
            dirName,
            "./stubs/addon-actions.ts",
          ),
          "msw/browser": path.resolve(dirName, "./stubs/msw-browser.ts"),
          "msw/core/http": path.resolve(dirName, "./stubs/msw-http.ts"),
        },
      },
      optimizeDeps: {
        exclude: ["msw", "@vitest/mocker"],
      },
      build: {
        rollupOptions: {
          plugins: [],
        },
      },
    });
  },
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: "./vite.config.mts",
      },
    },
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
