import { defineConfig } from "vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { qrcode } from "vite-plugin-qrcode";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => {
  const common = {
    plugins: [reactRouter(), tailwindcss()], 
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@/shared": path.resolve(__dirname, "src", "shared"),
        "@/store": path.resolve(__dirname, "src", "store"),
        "@/assets": path.resolve(__dirname, "src", "assets"),
      },
    },
  };
  if (command === "serve") {
    return {
      plugins: [...common.plugins, qrcode()],
      resolve: common.resolve,
      server: {
        port: 4173,
        open: true,
        strictPort: true,
      },
    };
  }

  return {
    plugins: [
      ...common.plugins,
      visualizer({ emitFile: false }),
    ],
    resolve: common.resolve,
  };
});
