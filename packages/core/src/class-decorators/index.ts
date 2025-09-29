import { installToGlobalObject } from "$/utils";
import * as forMethods from "./for-method";

export function useClassDecorators() {
    installToGlobalObject(forMethods);
}

export * from "./for-method";
