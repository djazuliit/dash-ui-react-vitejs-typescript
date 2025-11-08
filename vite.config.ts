import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path"; // ✅ penting: gunakan "node:path" bukan "path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      layouts: path.resolve(__dirname, "src/layouts"),
      components: path.resolve(__dirname, "src/components"),
      pages: path.resolve(__dirname, "src/pages"),
      utils: path.resolve(__dirname, "src/utils"),
      assets: path.resolve(__dirname, "src/assets"),
      widgets: path.resolve(__dirname, "src/widgets"),
      routes: path.resolve(__dirname, "src/routes"),
      data: path.resolve(__dirname, "src/data"),
      hooks: path.resolve(__dirname, "src/hooks"),
      styles: path.resolve(__dirname, "src/styles"),
      "sub-components": path.resolve(__dirname, "src/sub-components"),
      "bootstrap-components": path.resolve(__dirname, "src/bootstrap-components"),
    },
  },
});
