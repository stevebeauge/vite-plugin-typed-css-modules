import typedCssModules from "@handnet/vite-plugin-typed-css-modules";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    sourcemap: true,
    rollupOptions: {},
    minify: false,
  },
  plugins: [externalizeDeps(), dts(), libInjectCss(), typedCssModules()],
  css: {
    transformer: "postcss",
  },
});
