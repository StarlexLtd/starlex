import { defineConfig } from "tsup";

export function definePackageConfig(pkg: any) {
    const bannerText = `/**
* ${pkg.name} v${pkg.version}
* (c) 2021-PRESENT Chris Liu
* @license MIT
**/`;
    const banner = {
        js: bannerText,
        css: bannerText,
    };

    return {
        banner,
    };
}

export default defineConfig({
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["esm"],
    sourcemap: true,
    // clean: true, // clean `outDir` before build.
    tsconfig: "tsconfig.json", // spec tsconfig
    dts: {
        entry: ["src/index.ts"],
        only: false,
    },
    splitting: false, // 禁用代码分割以避免生成 chunk-xxxx 文件
    // treeshake: true,    // 禁用 tree-shaking 以确保输出文件与输入文件一一对应
});
