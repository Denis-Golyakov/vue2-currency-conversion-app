import Storage from './storage';

export interface Fee {
    source: string;
    target: string;
    value: number;
}

export default class Fees {
    private fees: Record<string, Fee> = {};

    private storage: Storage = new Storage();
    private storageKey: string = 'fees';

    constructor() {
        this.loadFees();
    }

    private loadFees(): void {
        const storedData = this.storage.get(this.storageKey, "{}") as string;

        this.fees = JSON.parse(storedData);
    }

    private saveFees(): void {
        this.storage.set(this.storageKey, JSON.stringify(this.fees));
    }

    private getFeeKey(sourceCurrency: string, targetCurrency: string): string {
        return `${sourceCurrency}-${targetCurrency}`;
    }

    public getFee(sourceCurrency: string, targetCurrency: string): number | null {
        const feeKey = this.getFeeKey(sourceCurrency, targetCurrency);

        return (feeKey in this.fees) ? this.fees[feeKey].value : null;
    }

    public getFeeList(): Fee[] {
        return Object.values(this.fees);
    }

    public setFee(sourceCurrency: string, targetCurrency: string, fee: number): void {
        const feeKey = this.getFeeKey(sourceCurrency, targetCurrency);
        this.fees[feeKey] = {
            source: sourceCurrency,
            target: targetCurrency,
            value: fee
        };
        this.saveFees();
    }

    public removeFee(sourceCurrency: string, targetCurrency: string): void {
        const feeKey = this.getFeeKey(sourceCurrency, targetCurrency);
        delete this.fees[feeKey];
        this.saveFees();
    }
}
