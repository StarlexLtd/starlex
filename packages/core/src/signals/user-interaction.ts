export function createUserInteractionSignal<T extends readonly DOMEventName[]>(events: T): ISignal<void> {
    let triggered = false;
    let resolveFn!: Action;

    const promise = new Promise<void>(resolve => {
        resolveFn = resolve;
    });

    function handler(e: Event) {
        // filter programmatic triggered events.
        if (!e.isTrusted) return;
        if (triggered) return;

        log.trace("Signal: user interaction detected. Related events:", events);
        triggered = true;
        cleanup();
        resolveFn();
    }

    function cleanup() {
        for (const event of events) {
            window.removeEventListener(event, handler, true);
        }
    }

    // capture phase, make sure listen events early.
    for (const event of events) {
        window.addEventListener(event, handler, { capture: true, passive: true });
    }

    return {
        promise,
        cancel: cleanup,
    };
}
