import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Para GitHub Pages: defina a variável VITE_BASE_PATH no repositório
// Ex: VITE_BASE_PATH=/escola-zoe  (nome do seu repositório)
// Se for um domínio customizado (ex: escolazoe.com), deixe em branco ou "/"
const base = process.env.BASE_PATH || "/";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
