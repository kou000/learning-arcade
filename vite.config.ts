import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages のリポジトリ名が learning-arcade なので base を固定
export default defineConfig({
  plugins: [react()],
  base: "/learning-arcade/",
});
