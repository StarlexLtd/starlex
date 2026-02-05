declare global {
    type GlobalDOMEventMap = WindowEventMap & DocumentEventMap & HTMLElementEventMap;
    type DOMEventName = keyof GlobalDOMEventMap;
}

export { };
