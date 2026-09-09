import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";

function rootJpgAssets(): Plugin {
  return {
    name: "root-jpg-assets",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";

        if (!/^\/[^/]+\.jpe?g$/i.test(url)) {
          next();
          return;
        }

        const fileName = decodeURIComponent(url.slice(1));
        const filePath = path.resolve(process.cwd(), fileName);

        if (!fs.existsSync(filePath)) {
          next();
          return;
        }

        res.setHeader("Content-Type", "image/jpeg");
        fs.createReadStream(filePath).pipe(res);
      });
    },

    closeBundle() {
      const root = process.cwd();
      const dist = path.resolve(root, "dist");

      if (!fs.existsSync(dist)) {
        return;
      }

      const files = fs.readdirSync(root);

      for (const file of files) {
        if (!/^.+\.jpe?g$/i.test(file)) {
          continue;
        }

        const source = path.resolve(root, file);
        const destination = path.resolve(dist, file);

        fs.copyFileSync(source, destination);
      }
    },
  };
}

export default defineConfig({
  base: "/ASBESOC-NEW/",

  plugins: [
    react(),
    tailwindcss(),
    rootJpgAssets(),
  ],
});