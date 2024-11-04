import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const externalPackageRules = [/^moment$/];

/**
 * 决定一个组件是否为外部组件。外部组件不会被打包。
 * @param id 组件名
 * @returns 
 */
function isExternalPackage(id: string): boolean {
    for (const rex of externalPackageRules) {
        if (rex.test(id)) return true;
    }

    return false;
}

export default defineConfig({
    resolve: {
        alias: {
            // "@ag-grid-enterprise/core": resolve(__dirname, "./static/js/ag-enterprise-core.esm.mjs"),
        },
    },
    server: {
        host: "0.0.0.0",
        port: 3000,
    },
    build: {
        rollupOptions: {
            external: isExternalPackage,
        },
    },
    plugins: [],
    test: {
        include: ["packages/*/__test__/*.{test,spec}.{js,ts}"],
    },
});
