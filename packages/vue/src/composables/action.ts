import { ref } from "vue";

export type AsyncAction<T extends (...args: any[]) => Promise<any>> = T & {
    executing: boolean;
};

export interface IButtonBindings {
    readonly disabled: boolean;
    onClick: (...args: any[]) => void;
}

export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(fn: T): AsyncAction<T> {
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

    Object.defineProperty(run, "executing", {
        get: () => executing.value,
        enumerable: true,
    });

    return run as any;

}

export function useButtonAction(fn: (...args: any[]) => Promise<any>): IButtonBindings {
    const action = useAsyncAction(fn);
    return {
        get disabled() { return action.executing; },
        onClick: action,
    };
}
