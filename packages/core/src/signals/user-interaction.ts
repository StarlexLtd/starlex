interface InteractionSignalOptions {
    /**
     * Default: true
     */
    once?: boolean;
}

export class InteractionSignal extends EventTarget implements ISignal<Event> {
    private readonly _promise = new Promise<Event>(r => (this._resolve = r));
    private _reason?: Event;
    private _resolve!: (e: Event) => void;
    private _triggered = false;
    public readonly then = this._promise.then.bind(this._promise);

    constructor(options: InteractionSignalOptions = {}) {
        super();
        this.once = options.once ?? true;
    }

    /** Trigger the signal. */
    public trigger(reason: Event) {
        if (!reason.isTrusted   // Only accept user interaction.
            || this._triggered) return;

        this._triggered = true;
        this._reason = reason;
        log.trace(`Signal: user interaction detected. Reason: "${reason.type}". Data:`, reason);
        this.dispatchEvent(new Event("interaction"));
        this._resolve(reason);
    }

    public readonly once: boolean;

    get reason() {
        return this._reason;
    }

    get triggered() {
        return this._triggered;
    }

    get [Symbol.toStringTag]() {
        return "InteractionSignal";
    }
}

export class InteractionController implements ISignalController<InteractionSignal> {
    private cleanup: Action;
    public readonly signal: InteractionSignal;

    constructor(
        target: EventTarget,
        events: (keyof GlobalEventHandlersEventMap)[],
        options?: AddEventListenerOptions,
    ) {
        this.signal = new InteractionSignal();
        options = {
            capture: true,
            passive: true,
            ...options,
        };

        const listener = (e: Event) => {
            // if (!e.isTrusted || this.signal.triggered) return;
            if (this.signal.once) this.cleanup();
            // signal.trigger() will check isTrusted + triggered.
            this.signal.trigger(e);
        };

        this.cleanup = () => {
            for (const name of events) {
                target.removeEventListener(name, listener, options);
            }
        };

        for (const name of events) {
            target.addEventListener(name, listener, options);
        }
    }

    /** Manually trigger. */
    public interact(reason: Event = new Event("manual-interaction")) {
        this.signal.trigger(reason);
        this.cleanup();
    }
}
