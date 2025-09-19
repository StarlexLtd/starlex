import { log } from "./utils/logger";
import { events } from "./utils/events";
import { LOG } from "./decorators/log";

const GlobalContent: Record<string, any> = {
    // MUST BE THE FIRST
    log,
    LOG,
    events,
};

function _install(globalObject: any) {
    for (const key in GlobalContent) {
        if (key in globalObject) continue;
        globalObject[key] = GlobalContent[key];
    }
}

export function installGlobal() {
    if (typeof window !== "undefined") _install(window);
    if (typeof globalThis !== "undefined") _install(globalThis);
}
