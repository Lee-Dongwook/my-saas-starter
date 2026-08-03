import { withThemeByClassName } from "@storybook/addon-themes";
import { Preview } from "@storybook/react";

// Pulls in Tailwind plus the design tokens the components read from.
import "../src/index.css";

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
