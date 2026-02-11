import type { Ref } from "vue";

import { ref } from "vue";

export interface IAsyncAction {
    executing: Ref<boolean>;
    run: (...args: any[]) => Promise<void>;
}

export interface IButtonAction {
    readonly disabled: boolean;
    onClick: (...args: any[]) => Promise<void>;
}

export function useAsyncAction(fn: (...args: any[]) => Promise<any>): IAsyncAction {
    const executing = ref(false);

    const run = async (...args: any[]) => {
        if (executing.value) return;
        executing.value = true;
        try {
            return await fn(...args);
        } finally {
            executing.value = false;
        }
    };

    return {
        executing,
        run,
    };
}

export function useButtonAction(fn: (...args: any[]) => Promise<any>): IButtonAction {
    const { executing, run } = useAsyncAction(fn);
    return {
        get disabled() { return executing.value; },
        onClick: run,
    };
}
