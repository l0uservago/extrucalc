import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api/dpdf": {
          target: "https://api.dpdf.io",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api\/dpdf/, ""),
          secure: true,
          timeout: 30000,
          proxyTimeout: 30000,
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.error("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, _req, _res) => {
              proxyReq.setHeader("origin", "https://api.dpdf.io");
              proxyReq.removeHeader("referer");
            });
            proxy.on("proxyRes", (proxyRes, req, res) => {
              // Intentionally add CORS headers to the response back to the browser
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader(
                "Access-Control-Allow-Methods",
                "GET, POST, OPTIONS, PUT, PATCH, DELETE",
              );
              res.setHeader(
                "Access-Control-Allow-Headers",
                "X-Requested-With,content-type,Authorization",
              );

              if (req.method === "OPTIONS") {
                res.statusCode = 200;
                res.end();
                return;
              }
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
              );
            });
          },
        },
      },
    },
    plugins: [react(), tailwindcss()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
