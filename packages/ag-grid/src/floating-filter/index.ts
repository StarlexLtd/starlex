/**
 * AgEnhancedFloatingFilter
 */
import type { Module } from "@ag-grid-community/core";

// import { ModuleRegistry } from "@ag-grid-community/core";
// import pkg from "../../package.json" with { type: "json" };
import { AgTextColumnFloatingFilter } from "./for-text-column";

export const FloatingFilterModule: Module = {
    moduleName: "FloatingFilterModule",
    version: "0.0.1",   // pkg.version,

    userComponents: [
        {
            name: "agReadOnlyFloatingFilter",
            classImp: AgTextColumnFloatingFilter,
        },
        {
            name: "agTextColumnFloatingFilter",
            classImp: AgTextColumnFloatingFilter,
        },
        {
            name: "agNumberColumnFloatingFilter",
            classImp: AgTextColumnFloatingFilter,
        },
        {
            name: "agDateColumnFloatingFilter",
            classImp: AgTextColumnFloatingFilter,
        },
        {
            name: "agSetColumnFloatingFilter",
            classImp: AgTextColumnFloatingFilter,
        },
    ],

    dependantModules: [
        // ClientSideRowModelModule,
    ],

};

// ModuleRegistry.register(FloatingFilterModule);

export {
    AgTextColumnFloatingFilter,
};
