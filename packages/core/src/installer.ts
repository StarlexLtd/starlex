import { log } from "./utils/logger";
import { events } from "./utils/events";
import { installToGlobalObject } from "./utils";

const GlobalContent: Record<string, any> = {
    log,    // MUST BE THE FIRST
    events,
};

export function installGlobal() {
    installToGlobalObject(GlobalContent);
}
