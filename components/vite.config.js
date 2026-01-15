import { defineConfig } from "vite"

export default defineConfig({
  root: "./src",           // your Lit source folder
  base: "/js/",            // path prefix when served by Go
  build: {
    outDir: "../../web/js/dist", // relative to root, Go can serve this
    emptyOutDir: true,
    lib: {
      entry: "index.js", // your main Lit component
      formats: ["es"],
      fileName: () => "component.js",
    },
  },
});
