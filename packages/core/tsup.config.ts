import { defineConfig } from "tsup";
import { default as rootConfig, definePackageConfig } from "../../tsup.config.root";
import pkg from "./package.json";

const localConfig = definePackageConfig(pkg);

export default defineConfig({
    ...rootConfig,
    ...localConfig,
    entry: {
        index: "src/index.ts",
        global: "src/globals/index.ts",
        polyfill: "src/polyfills/index.ts",
    },
    splitting: true,
});
