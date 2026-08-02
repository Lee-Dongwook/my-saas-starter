import { withThemeByClassName } from "@storybook/addon-themes";
import { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: { layout: "fullscreen" },
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
