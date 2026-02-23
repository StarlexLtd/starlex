import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import("@sveltejs/kit").Config} */
const config = {
    compilerOptions: {
        // enable run-time checks when not in production
        dev: process.env.NODE_ENV === "development",
        runes: true,
    },

    // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    onwarn: (warning, handler) => {
        if (warning.code.startsWith("a11y_")) {
            return;
        }
        handler(warning);
    },
};

export default config;
