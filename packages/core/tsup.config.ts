import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: true,
  target: "esnext",
  outDir: "build",
  external: ["@aws-sdk/client-s3"],
});
