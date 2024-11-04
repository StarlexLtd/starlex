import "dotenv/config";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

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
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "index",
        },
        rollupOptions: {
            external: ["moment"],
        },
    },
    plugins: [],
    test: {
        include: ["__test__/**/*.{test,spec}.{js,ts}"],
    },
});
