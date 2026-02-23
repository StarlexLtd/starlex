import type { AgPromise, FilterChangedEvent, IFloatingFilterComp, IFloatingFilterParams } from "@ag-grid-community/core";
import type { IFloatingFilterExtraParams } from "./types";

import { mount, unmount } from "svelte";
import AgColumnFilterImpl from "./ag-column-filter.svelte";
import "./styles.css";

export class AgTextColumnFloatingFilter implements IFloatingFilterComp {
    private _container: HTMLElement;
    private _componentInstance: AgColumnFilterImpl = undefined as any;

    constructor() {
        this._container = document.createElement("div");
    }

    // #region IFloatingFilter

    // 当上级过滤器更新，或者用 api 更新过滤器，则通知到 UI 组件上。
    onParentModelChanged(parentModel: any, filterChangedEvent?: FilterChangedEvent): void {
        // debug("onParentModelChanged", parentModel, filterChangedEvent);
        this._componentInstance?.update(parentModel);
    }

    onParamsUpdated?(params: IFloatingFilterParams<any, any, any> & IFloatingFilterExtraParams): void {
        // debug("onParamsUpdated", params);
        this.updateContainer(params);
        this._componentInstance?.updateParams(params);
    }

    refresh?(params: IFloatingFilterParams<any, any, any>): void {
        // debug("Floating filter refresh", params);
    }

    // #endregion

    // #region BaseFloatingFilter

    afterGuiAttached?(): void {
    }

    // #endregion

    // #region IComponent

    getGui(): HTMLElement {
        return this._container;
    }

    destroy(): void {
        unmount(this._componentInstance);
        this._container = undefined!;
    }

    init(params: IFloatingFilterParams<any, any, any> & IFloatingFilterExtraParams): AgPromise<void> | void {
        this.updateContainer(params);

        this._componentInstance = mount(AgColumnFilterImpl, {
            target: this._container,
            props: {
                params: params as any,
            },
        }) as any;      // `as any` is need for bypassing `vite-plugin-dts` bugs.
    }

    // #endregion

    private updateContainer(params: IFloatingFilterParams<any, any, any> & IFloatingFilterExtraParams) {
        this._container.className = params.className ?? "cyy-floating-filter-container";
    }
}
