import "dotenv/config";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";

export default defineConfig({
    resolve: {
        alias: [
            {
                find: /^\$\/(.+)$/,
                replacement: resolve(__dirname, "./src/$1"),
            },
        ],
    },
    build: {
        emptyOutDir: true,
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: ["moment"],
        },
    },
    plugins: [
        dts({
            include: ["src", "types"],
        }),
    ],
    test: {
        include: ["__test__/**/*.{test,spec}.{js,ts}"],
    },
});
