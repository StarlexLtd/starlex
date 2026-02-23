import type { FilterOp, IFilterOpDef } from "./types";

import {
    mdiMagnify,
    mdiEqual, mdiNotEqualVariant,
    mdiLessThan, mdiLessThanOrEqual, mdiGreaterThan, mdiGreaterThanOrEqual,
    mdiContain, mdiAlphabeticalVariantOff, mdiContainStart, mdiContainEnd,
} from "@mdi/js";

export const SELECT_ALL_VALUE = "__ALL__";

export const filterOpReset: IFilterOpDef = Object.freeze({
    //todo: op should be "empty"
    op: undefined as any, icon: mdiMagnify /*"mdi mdi-magnify"*/, text: "重置",
});

//todo: deep freeze
const filterOps: readonly IFilterOpDef[] = [
    // { op: "=", icon: "mdi mdi-equal", text: "等于", },
    // { op: "<>", icon: "mdi mdi-not-equal-variant", text: "不等于", },
    // { op: "<", icon: "mdi mdi-less-than", text: "小于", },
    // { op: "<=", icon: "mdi mdi-less-than-or-equal", text: "小于等于", },
    // { op: ">", icon: "mdi mdi-greater-than", text: "大于", },
    // { op: ">=", icon: "mdi mdi-greater-than-or-equal", text: "大于等于", },
    { op: "equals", icon: mdiEqual /*"mdi mdi-equal"*/, text: "等于", },
    { op: "notEqual", icon: mdiNotEqualVariant /*"mdi mdi-not-equal-variant"*/, text: "不等于", },
    { op: "lessThan", icon: mdiLessThan /*"mdi mdi-less-than"*/, text: "小于", },
    { op: "lessThanOrEqual", icon: mdiLessThanOrEqual /*"mdi mdi-less-than-or-equal"*/, text: "小于等于", },
    { op: "greaterThan", icon: mdiGreaterThan /*"mdi mdi-greater-than"*/, text: "大于", },
    { op: "greaterThanOrEqual", icon: mdiGreaterThanOrEqual /*"mdi mdi-greater-than-or-equal"*/, text: "大于等于", },
    { op: "contains", icon: mdiContain /*"mdi mdi-contain"*/, text: "包含", },
    { op: "notContains", icon: mdiAlphabeticalVariantOff /*"mdi mdi-alphabetical-variant-off"*/, text: "不包含", },
    { op: "startsWith", icon: mdiContainStart /*"mdi mdi-contain-start"*/, text: "开头是", },
    { op: "endsWith", icon: mdiContainEnd /*"mdi mdi-contain-end"*/, text: "结尾是", },

    /*
    { op: "isblank", icon: "mdi mdi-checkbox-blank-outline", text: "为空", },
    { op: "isnotblank", icon: "mdi mdi-checkbox-blank-off-outline", text: "不为空", },
    */

    // { op: undefined, icon: "mdi mdi-magnify", text: "重置", },
    filterOpReset,
];
filterOps.forEach(a => Object.freeze(a));
Object.freeze(filterOps);

const filterOpMap: Record<FilterOp, IFilterOpDef> = {} as any;
filterOps.forEach(def => filterOpMap[def.op!] = def);
Object.freeze(filterOpMap);

export function getFilterDefine(op?: FilterOp): IFilterOpDef {
    return op ? filterOpMap[op] : filterOpReset;
}

const numberFilters = Object.freeze([
    filterOpMap.equals, filterOpMap.notEqual,
    filterOpMap.lessThan, filterOpMap.lessThanOrEqual,
    filterOpMap.greaterThan, filterOpMap.greaterThanOrEqual,
    filterOpReset,
] as const);

const textFilters = Object.freeze([
    filterOpMap.equals, filterOpMap.notEqual,
    filterOpMap.contains, filterOpMap.notContains,
    filterOpMap.startsWith, filterOpMap.endsWith,
    // filterOpMap.blank, filterOpMap.notBlank,
    filterOpReset,
] as const);

const enumFilters = Object.freeze([
    filterOpMap.equals, filterOpMap.notEqual,
    // filterOpMap.blank, filterOpMap.notBlank,
    filterOpReset,
] as const);

const defaultFilters = Object.freeze([
    filterOpMap.equals, filterOpMap.notEqual,
    // filterOpMap.blank, filterOpMap.notBlank,
    filterOpReset,
] as const);

export function getFiltersByDataType(dataType: string, isEnum: boolean = false): readonly IFilterOpDef[] {
    switch (dataType) {
        case "number": return numberFilters;
        case "text": return isEnum ? enumFilters : textFilters;
        // all other types
        default: return defaultFilters;
    }
}
