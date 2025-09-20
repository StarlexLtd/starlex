export function base64Encode(bytes: Uint8Array<ArrayBufferLike>): string;
export function base64Encode(str: string): string;
export function base64Encode(data: string | Uint8Array<ArrayBufferLike>): string {
    let bytes: Uint8Array<ArrayBufferLike>;
    if (typeof data === "string") {
        bytes = new TextEncoder().encode(data);
    } else {
        bytes = data;
    }
    const bin = String.fromCharCode(...bytes);
    return btoa(bin);
}

export function base64Decode(base64: string): string {
    const bin = atob(base64);
    const bytes = new Uint8Array([...bin].map(char => char.charCodeAt(0)));
    return new TextDecoder().decode(bytes);
}

/**
 * Calculate SHA-256 hash.
 * Using `Crypto.subtle`, so only available in secure contexts.
 * @param message
 * @returns
 */
export async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
