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

        let fileName: string;

        try {
          fileName = decodeURIComponent(url.slice(1));
        } catch {
          next();
          return;
        }

        if (
          fileName.includes("/") ||
          fileName.includes("\\") ||
          fileName.includes("\0")
        ) {
          next();
          return;
        }

        const filePath = path.resolve(process.cwd(), fileName);

        if (
          !fs.existsSync(filePath) ||
          !fs.statSync(filePath).isFile()
        ) {
          next();
          return;
        }

        res.setHeader("Content-Type", "image/jpeg");

        const stream = fs.createReadStream(filePath);
        stream.on("error", () => res.destroy());
        stream.pipe(res);
      });
    },

    closeBundle() {
      const root = process.cwd();
      const dist = path.resolve(root, "dist");

      if (!fs.existsSync(dist)) {
        return;
      }

      for (const file of fs.readdirSync(root)) {
        if (!/\.jpe?g$/i.test(file)) {
          continue;
        }

        const source = path.resolve(root, file);

        if (!fs.statSync(source).isFile()) {
          continue;
        }

        fs.copyFileSync(source, path.resolve(dist, file));
      }
    },
  };
}

export default defineConfig({
  base: "/",

  plugins: [
    react(),
    tailwindcss(),
    rootJpgAssets(),
  ],
});