import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // 作为子模块构建时，不读取宿主的 Tailwind/PostCSS 配置。
  css: { postcss: { plugins: [] } },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "CargoXDesignSystem",
      fileName: "index",
      cssFileName: "styles",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "@dnd-kit/utilities",
      ],
    },
  },
});
