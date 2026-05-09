import Storage from './storage';

export interface Rate {
    currency: string;
    rate: number;
}

export default class ECB {
    public error: string | null = null;

    private lastUpdate: Date | null = null;
    private lastUpdateStorageKey = "last-updated-at";

    public loading: boolean = false;

    private parser: DOMParser = new DOMParser();

    private rates: Rate[] = [];

    private storage: Storage = new Storage();
    private storagePrefix: string = "ECB-";

    constructor(fetchRates: boolean = true) {
        if (fetchRates && this.isUpdateRequired) {
            this.fetchRates();
        }
    }

    get lastUpdateDate(): Date | null {
        if (this.lastUpdate === null) {
            const lastUpdate = this.loadData(this.lastUpdateStorageKey, null);
            this.lastUpdate = lastUpdate ? new Date(lastUpdate) : null;
        }

        return this.lastUpdate;
    }

    get isUpdateRequired(): boolean {
        if (!this.lastUpdateDate) return true;

        const now = new Date();

        // YYYY-MM-DD CET/CEST
        const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
        const lastUpdateDateStr = this.lastUpdateDate
            .toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

        // en-GB gives 24h format
        const cetHour = parseInt(now.toLocaleTimeString('en-GB', {
            timeZone: 'Europe/Berlin',
            hour: '2-digit',
            hour12: false,
        }).split(':')[0]);

        // Get current weekday in Berlin (CET) time (0=Sun, 6=Sat)
        const cetDay = new Date(todayStr).getDay();

        const isWeekday = cetDay >= 1 && cetDay <= 5;
        const isAfterPublish = cetHour >= 16;

        // If today is a weekday and after 16h CET, return true
        if (lastUpdateDateStr === todayStr && isAfterPublish) return false;
        if (isWeekday && isAfterPublish && lastUpdateDateStr < todayStr) return true;

        return false;
    }

    get ratesData(): Rate[] {
        return this.rates.length
            ? this.rates
            : this.loadData('rates', "[]", true) as Rate[];
    }

    private async getRates(): Promise<Response> {
        const rates = await fetch('/ecb-api/stats/eurofxref/eurofxref-daily.xml');

        return rates;
    }

    private saveData(key: string, data: any): void {
        this.storage.set(
            `${this.storagePrefix}${key}`,
            (typeof data === 'string') ? data : JSON.stringify(data)
        );
    }

    private loadData(key: string, fallback: string | null = null, isJson: boolean = false): any {
        const data = this.storage.get(`${this.storagePrefix}${key}`, fallback);

        return (isJson && data !== null) ? JSON.parse(data as string) : data;
    }

    /**
     * Parses the given XML data and returns an array of Rate objects.
     * 
     * @param {string} xmlData - The XML data to parse.
     * @returns {Rate[]} - An array of Rate objects.
     */
    private parseXmlData(xmlData: string): Rate[] {
        const xmlDoc = this.parser.parseFromString(xmlData, "text/xml");
        const elements = xmlDoc.querySelectorAll('Cube');
        let results: Rate[] = [];

        elements.forEach(element => {
            if (element.getAttribute('currency') && element.getAttribute('rate')) {
                results.push({
                    currency: element.getAttribute('currency') as string,
                    rate: parseFloat(element.getAttribute('rate') as string),
                });
            }
        });

        return results;
    }

    private setRates(rates: Rate[]): void {
        this.rates = rates;
        this.saveData('rates', rates);
    }

    public fetchRates(): Promise<void> {
        this.loading = true;
        return this.getRates()
            .then(async response => {
                this.error = null;
                const xmlData = await response.text();
                this.setRates(this.parseXmlData(xmlData));
                this.saveData(this.lastUpdateStorageKey, new Date().toISOString());
            })
            .catch((error: Error) => {
                this.error = `Failed to load exchange rates: ${error.message}`;
            })
            .finally(() => {
                this.loading = false;
            });
    }
}