import path from "path";
import { fileURLToPath } from "url";
import { mergeConfig, optimizeDeps } from "vite";
import type { StorybookConfig } from "@storybook/react-vite";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs", "@storybook/addon-themes"],
  staticDirs: ["../public"],
  core: {},
  async viteFinal(config, options) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "@storybook/addon-actions": path.resolve(
            dirName,
            "./stubs/addon-actions.ts",
          ),
          "msw/browser": path.resolve(__dirname, "./stubs/msw-browser.ts"),
          "msw/core/http": path.resolve(__dirname, "./stubs/msw-http.ts"),
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
