import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["esm"],
    sourcemap: true,
    clean: true, // clean `outDir` before build.
    tsconfig: "tsconfig.json", // spec tsconfig
    dts: {
        entry: ["src/index.ts"],
        only: false,
    },
    splitting: false,   // 禁用代码分割以避免生成 chunk-xxxx 文件
    // treeshake: true,    // 禁用 tree-shaking 以确保输出文件与输入文件一一对应
});
