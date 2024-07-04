import { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}"],
  theme: {
    extend: {
      container: {
        center: true,
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('hocus', ['&:hover', '&:focus'])
    }),
  ],
} satisfies Config;
