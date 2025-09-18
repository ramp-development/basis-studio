import path from "path";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

// vite.config.js
export default defineConfig({
  // Use relative base for better CDN compatibility
  base: "./",
  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "src"),
      "@comp": path.resolve(__dirname, "src/components"),
      "@modules": path.resolve(__dirname, "src/modules"),
      "@gl": path.resolve(__dirname, "src/gl"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@styles": path.resolve(__dirname, "src/css"),
      "@transitions": path.resolve(__dirname, "src/transitions"),
    },
  },
  build: {
    minify: true,
    cssCodeSplit: false, // Bundle all CSS into one file
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, "src/app.js"),
      },
      output: {
        dir: path.resolve(__dirname, "dist"),
        format: "iife", // IIFE format for browser compatibility
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          // Keep CSS as index.css
          const fileName = assetInfo.names?.[0] || assetInfo.name;
          if (fileName && fileName.endsWith(".css")) {
            return "index.css";
          }
          return "[name].[ext]";
        },
        compact: true,
        inlineDynamicImports: true, // Bundle everything together
        // Map external GSAP modules to global variables
        globals: {
          gsap: "gsap",
          "gsap/ScrollTrigger": "ScrollTrigger",
          "gsap/SplitText": "SplitText",
          "gsap/Flip": "Flip",
        },
      },
    },
  },
  plugins: [
    glsl(),
    // mkcert(
    // {

    // })
  ],
  server: {
    port: 4321, // server port
    host: "0.0.0.0",
    // open: true, // open in browser automatically
    hot: true, // enable hot module replacement
    cors: {
      origin: "*", // Allow all origins
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },

    // allowedHosts: ["stabondar.ngrok.app"],
  },
  preview: {
    port: 8080, // specify the port to run the preview server on
    strictPort: true, // if true, the server will fail if the port is already in use
    host: "localhost", // define the host, use '0.0.0.0' to expose server to network
    https: false, // set to true if you need to test with HTTPS
    open: true,
  },
});
