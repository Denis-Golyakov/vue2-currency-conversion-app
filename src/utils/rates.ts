import { Rate } from '@/services/ecb';

const defaultCurrency: string = 'EUR';

export function getCurrencyList(rates: Rate[]): string[] {
    return rates.length ? [defaultCurrency, ...rates.map(rate => rate.currency)] : [];
}

export function getConversionRate(rates: Rate[], sourceCurrency: string, targetCurrency: string): number | null {
    if (sourceCurrency === targetCurrency) {
        return 1;
    }

    const sourceRate = rates.find(rate => rate.currency === sourceCurrency);
    const targetRate = rates.find(rate => rate.currency === targetCurrency);

    if (targetCurrency === defaultCurrency) {
        return sourceRate ? 1 / sourceRate.rate : null;
    }

    if (sourceCurrency === defaultCurrency) {
        return targetRate ? targetRate.rate : null;
    }

    // If the target currency is not the default currency, derive the conversion rate
    if (targetRate && sourceRate) {
        return targetRate.rate / sourceRate.rate;
    }

    return null;
}
