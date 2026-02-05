import { log } from "./logger";
import { events } from "./events";
import { installToGlobalObject } from "../utils";

const GlobalContent: Record<string, any> = {
    log,    // MUST BE THE FIRST
    events,
};

installToGlobalObject(GlobalContent);

//todo: global.js 和 index.js 有重复的咋办
