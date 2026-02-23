export type FilterOp = "empty" | "equals" | "notEqual" | "lessThan" | "lessThanOrEqual" | "greaterThan" | "greaterThanOrEqual" | "contains" | "notContains" | "startsWith" | "endsWith" | "blank" | "notBlank";

export interface IFilterOpDef {
    op: FilterOp;
    icon: string;
    text: string;
}

export interface IFilterCondition {
    op: FilterOp;
    value: any;
}

export interface AgFilterItem {
    filter: any;
    filterType: string;
    type: FilterOp;
}

export interface IFloatingFilterExtraParams {
    className?: string;
    showOperator?: boolean;
}
