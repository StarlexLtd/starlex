/**
 * Run from project root path.
 */

import * as fs from "fs";
import * as path from "path";

interface IArgs {
    name: string;
}

// #region Templates
const _npmignore = `.env
`;

const package_json = `{
    "name": "@cyysummer/<%name%>",
    "version": "0.0.1",
    "license": "MIT",
    "type": "module",
    "module": "./dist/index.js",
    "types": "./types",
    "exports": {
        ".": {
            "import": "./dist/index.js",
            "types": "./types/index.d.ts"
        }
    },
    "scripts": {
        "dev": "tsup --watch",
        "build": "rm -rf ./dist && tsup",
        "postbuild": "mv dist/index.d.ts types/lib.d.ts",
        "test": "vitest"
    },
    "dependencies": {
    },
    "peerDependencies": {
    },
    "devDependencies": {
        "tsup": "catalog:",
        "typescript": "catalog:",
        "vite": "catalog:",
        "vitest": "catalog:"
    },
    "publishConfig": {
        "access": "public"
    }
}
`;

const tsconfig_json = `{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "rootDir": ".",
        "baseUrl": ".",
        "paths": {
            "$": ["./src/"],
            "$/*": ["./src/*"],
        },
    },
    "include": [
        "./src/**/*",
        "./types/**/*",
    ],
}
`;

const tsup_config_ts = `import { defineConfig } from "tsup";
import rootConfig from "../../tsup.config.root";

export default defineConfig({
    ...rootConfig,
});
`;

// #endregion

const params: (keyof IArgs)[] = ["name"];

const templates: Record<string, string> = {
    ".npmignore": _npmignore,
    "package.json": package_json,
    "tsconfig.json": tsconfig_json,
    "tsup.config.ts": tsup_config_ts,
};

function extractArgs() {
    const argIndex = process.argv.indexOf(import.meta.filename);
    const args = process.argv.slice(argIndex + 1);
    if (args.length == 0) {
        return undefined;
    }

    const [
        name,
    ] = args;

    return {
        name,
    } as IArgs;
}

function main() {
    const args = extractArgs();
    if (args == null) {
        console.error("Usage: pnpm create:module <MODULE_NAME>");
        return;
    }

    const targetPath = path.join(process.cwd(), "packages/", args.name);
    if (fs.existsSync(targetPath)) {
        console.log(`Error: module "${args.name}" exists.`);
        return;
    }

    try {
        console.log("Creating ", args.name);
        fs.mkdirSync(targetPath, { recursive: true });
        for (const filename in templates) {
            const template = templates[filename];
            const code = params.reduce((result, arg) => result.replaceAll(`<%${arg}%>`, args[arg]), template);
            const fullName = path.join(targetPath, filename);
            console.log("Writing ", fullName);
            fs.writeFileSync(fullName, code, { encoding: "utf-8" });
        }
        console.log("Done.");
    } catch (ex) {
        console.error("Error:", (ex as Error).message);
    }
}

main();
