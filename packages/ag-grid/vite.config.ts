import "dotenv/config";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json" with { type: "json" };

const peerDeps = Object.keys(pkg.peerDependencies);

export default defineConfig({
    resolve: {
        alias: [
            {
                find: /^\$\/(.+)$/,
                replacement: resolve(__dirname, "./src/$1"),
            },
        ],
    },
    plugins: [
        tailwindcss(),
        svelte(),

        dts({
            entryRoot: "src",
            insertTypesEntry: false,
            rollupTypes: true,
        }),

    ],
    build: {
        cssCodeSplit: true,
        lib: {
            entry: {
                "builder": "src/builder/index.ts",
                "floating-filter": "src/floating-filter/index.ts",
            },
            formats: ["es"],
            fileName: (format, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
            external: (id) => {
                return peerDeps.includes(id);
            },
            treeshake: true,
        },
        minify: false,
    },
    test: {
        include: ["__test__/**/*.{test,spec}.{js,ts}"],
    },
});
