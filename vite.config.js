import path from "path";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

// vite.config.js
export default defineConfig({
  base: "https://basisstudio.netlify.app/",
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
    manifest: true,
    rollupOptions: {
      input: "index.html",
      external: ["gsap", "gsap/ScrollTrigger", "gsap/SplitText", "gsap/Flip"],
      output: {
        dir: path.resolve(__dirname, "dist"),
        format: "es",
        chunkFileNames: "[name]-[hash].js",
        entryFileNames: "app.js",
        assetFileNames: "[name].[ext]",
        esModule: true,
        compact: true,
        dynamicImportVars: true,
        makeAbsoluteExternalsRelative: true,
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
    allowedHosts: ["basis-89.localcan.dev"],
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
