// @ts-check
import react from "@astrojs/react";
// import deno from "@deno/astro-adapter";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  // output: "server",
  // adapter: deno(),
});
