import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  target: "es2022",
  outDir: "dist",
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false
});
