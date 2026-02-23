<script lang="ts">
/**
 * 几种可能的操作：
 * 文本：
 * 1. 点击菜单，输入值，按回车
 * 2. 点击“重置”
 * 3. 清空值，按回车
 * 下拉：
 * 1. 点击菜单，选择值，按回车
 * 2. 点击“重置”
 * 3. 点击“全部”，按回车
 *
 * 按回车才提交过滤条件变更。
 *
 * TODO:
 * - 支持外部传入可用的过滤模式，或者限定为某一个过滤模式，关闭 filterMenu。
 * - 支持外部传入下拉选项，与 metadata.EnumType 解绑。
 */
import type { IFloatingFilterParams, ValueFormatterParams } from "@ag-grid-community/core";
import type { AgFilterItem, FilterOp, IFilterOpDef, IFloatingFilterExtraParams } from "./types";

import { onMount, onDestroy } from "svelte";
import { eventMod } from "@cyysummer/core";
import { getFilterDefine, getFiltersByDataType, filterOpReset, SELECT_ALL_VALUE } from "./utils";
import "./styles.css";

interface IProps {
    params: IFloatingFilterParams<any, any, any> & IFloatingFilterExtraParams;
}
let { params }: IProps = $props();

// todo: pass grid api, with event system.
let api: any;
// svelte-ignore state_referenced_locally
const { column, parentFilterInstance } = params;
const colDef = column.getColDef();
const isEnum = colDef.context?.metadata?.EnumType != null;
const dataType = String(colDef.cellDataType); // builder 会将元数据中的 DataType 转为对应的 AgColumn 数据类型
const filterOps = getFiltersByDataType(dataType, isEnum);
const showSelectBox = colDef.cellEditor === "agSelectCellEditor";

let filterIconRef: HTMLElement = $state() as any;
let filterMenuRef: HTMLElement = $state() as any;
let inputComp: HTMLInputElement | HTMLSelectElement = $state() as any;
let showOperator = $derived(params.showOperator ?? true);
let selectedFilter = $state<IFilterOpDef>(filterOpReset);
let value = $state();
let modified = $state(false);
const selectOptions = colDef.cellEditorParams?.values;
const selectOptionFormatter = typeof colDef.valueFormatter === "function" ? colDef.valueFormatter : (params: { value: any }) => String(params.value);

onMount(() => {
    reset(true); // set initial value
    // api?.On("applyFilters", applyFilter);
});
onDestroy(() => {
    // api?.Off("applyFilters", applyFilter);
});

function applyFilter() {
    queueMicrotask(applyFilterCore);
}

function applyFilterCore() {
    let { op } = selectedFilter;
    // 如果是枚举，而且选了“全部”，重置过滤器
    if ((isEnum && value === SELECT_ALL_VALUE) || value == null || value === "") {
        reset();
    } else {
        // op 正常化
        op = normalizeOp();
    }

    // 更新到上级过滤器（表格）
    const v = value === SELECT_ALL_VALUE ? undefined : value;
    parentFilterInstance(inst => inst.onFloatingFilterChanged(op, v));

    modified = false;
}

// OP 正常化。如果为空，设定默认 OP
function normalizeOp(): FilterOp {
    let { op } = selectedFilter;

    if (op == null) {
        // 根据字段类型，设置对应 OP
        if (isEnum) {
            // 如果值是“全选”，保持 op 为重置
            op = value === SELECT_ALL_VALUE ? (undefined as any) : "equals";
        } else if (dataType === "text") {
            op = "contains";
        } else {
            op = "equals";
        }
        selectedFilter = getFilterDefine(op);
    }

    return op;
}

function reset(force: boolean = false) {
    value = isEnum ? SELECT_ALL_VALUE : undefined;
    selectedFilter = filterOpReset;
    if (force) {
        modified = false;
    }
}

function updateMenuPosition(e: MouseEvent) {
    // 计算所有用 transform 产生的偏移量。这些偏移量会导致菜单位置不正确。
    let offsetX = window.scrollX;
    let offsetY = window.scrollY;
    let parent = filterIconRef.offsetParent as HTMLElement;
    while (parent) {
        if (parent.style.transform !== "" && parent.style.transform !== "none") {
            const pRect = parent.getBoundingClientRect();
            offsetX += pRect.left;
            offsetY += pRect.top;
        }
        parent = parent.offsetParent as HTMLElement;
    }

    const rect = filterIconRef.getBoundingClientRect();
    // DO NOT `+1` to style.top. It will cause 1px gap between button and menu, mouse move over the gap will hide menu.
    filterMenuRef.style.top = `${rect.bottom - offsetY}px`;
    filterMenuRef.style.left = `${rect.left - offsetX - 1}px`;
}

function btnFilterOp_Click(op: FilterOp) {
    // op 为空表示“重置”
    if (!op) {
        reset();
        // applyFilter(); // ???
    } else {
        // 设置选择的过滤模式
        selectedFilter = getFilterDefine(op);
    }

    // 隐藏菜单
    filterMenuRef.style.visibility = "hidden";
    setTimeout(() => filterMenuRef.style.removeProperty("visibility"), 50);
    inputComp.focus({ preventScroll: true });
}

async function txtValue_KeyDown(e: KeyboardEvent) {
    // 按下回车键表示最终提交过滤器
    if (e.key === "Enter") {
        if (api) {
            // 使用事件是为了跨多个过滤器，统一提交。
            api.Emit("applyFilters", void 0);
        } else {
            applyFilter();
        }
    } else if (e.key.length === 1) {
        // 文本输入，标记为修改
        modified = true;
    } // 其他情况：按下了功能键或修饰键
}

export function update(filter: AgFilterItem) {
    // debug("updating filter", filter);
    if (!filter || filter.type == "empty") {
        reset(true);
    } else {
        selectedFilter = getFilterDefine(filter.type);
        value = filter.filter;
        modified = false;
    }
}

export function updateParams(params: IFloatingFilterParams<any, any, any> & IFloatingFilterExtraParams) {
    showOperator = params.showOperator ?? true;
}
</script>

<label class="cyy-floating-filter input z-20 focus-within:z-20">
    {#if showOperator}
        <div class="cyy-floating-filter-operator dropdown dropdown-hover">
            <div tabindex="0" bind:this={filterIconRef} role="button" class="cyy-floating-filter-operator-selected btn btn-sm" onmouseenter={updateMenuPosition}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4">
                    <path d={selectedFilter.icon} />
                </svg>
            </div>
            <ul tabindex="-1" class="cyy-floating-filter-operator-menu dropdown-content menu z-20 flex-nowrap" style="position: fixed;" bind:this={filterMenuRef}>
                {#each filterOps as def}
                    <li class="cyy-floating-filter-operator-item">
                        <a href={void 0} class="rounded-none p-1" onclick={e => btnFilterOp_Click(def.op)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 p-0.5">
                                <path d={def.icon} />
                            </svg>
                            {def.text}
                        </a>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    {#if showSelectBox}
        <select bind:this={inputComp} class={["cyy-floating-filter-select select appearance-none ", modified && "cyy-floating-filter-modified"]} bind:value onchange={() => (modified = true)} onkeydown={eventMod(txtValue_KeyDown).prevent}>
            <option value={SELECT_ALL_VALUE} selected>(全部)</option>
            {#each selectOptions as v}
                <option value={v}>{selectOptionFormatter({ value: v } as any)}</option>
            {/each}
        </select>
    {:else}
        <input bind:this={inputComp} type="text" class={["cyy-floating-filter-input input", modified && "cyy-floating-filter-modified"]} bind:value autocomplete="off" tabindex="0" onkeydown={txtValue_KeyDown} />
    {/if}
</label>
