const storageKeyPrefix: string = "currency-conversion-app-";

/**
 * Storage service layer that handles localStorage operations.
 */
export default class Storage {
    private addPrefix(key: string): string {
        return `${storageKeyPrefix}${this.removePrefix(key)}`;
    }

    private removePrefix(key: string): string {
        const re = new RegExp(`^${storageKeyPrefix}`);

        return key.replace(re, '');
    }

    get(key: string, fallback: string | null = null): string | null {
        try {
            const val = localStorage.getItem(this.addPrefix(key));

            if (val === null) {
                return fallback;
            }

            return val;
        } catch (e) {
            this.throwError(e as Error);
        }

        return null;
    }

    remove(key: string): void {
        try {
            localStorage.removeItem(this.addPrefix(key));
        } catch (e) {
            this.throwError(e as Error);
        }
    }

    pull(key: string, fallback: string | null = null): string | null {
        const val = this.get(key, fallback);

        if (val !== fallback) {
            this.remove(key);
        }

        return val;
    }

    set(key: string, val: string): void {
        try {
            localStorage.setItem(this.addPrefix(key), val);
        } catch (e) {
            this.throwError(e as Error);
        }
    }

    has(key: string): boolean {
        return (this.addPrefix(key) in localStorage);
    }

    key(index: number): string | null {
        const key = this.keys()[index];

        if (key === undefined) return null;

        return this.get(this.removePrefix(key));
    }

    keys(): string[] {
        return Object.keys(localStorage)
            .filter(key => key.startsWith(storageKeyPrefix));
    }

    private throwError(e: Error): void {
        throw new Error(`[STORAGE]: ${e.message}`);
    }
}