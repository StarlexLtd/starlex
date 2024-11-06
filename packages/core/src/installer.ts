import { log } from "./utils/logger";
import { LOG } from "./decorators/log";

const GlobalContent: Record<string, any> = {
    // MUST BE THE FIRST
    log,
    LOG,
};

export function installGlobal(globalObject: any) {
    for (const key in GlobalContent) {
        if (key in globalObject) continue;
        globalObject[key] = GlobalContent[key];
    }
}
