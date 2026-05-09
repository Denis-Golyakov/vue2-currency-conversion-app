import { Rate } from '@/services/ecb';

const defaultCurrency: string = 'EUR';

export function getCurrencyList(rates: Rate[]): string[] {
    return rates.length ? [defaultCurrency, ...rates.map(rate => rate.currency)] : [];
}

/**
 * Calculates the conversion rate between two currencies using EUR as the base.
 *
 * - If target is EUR, returns 1 / source rate
 * - If source is EUR, returns target rate directly
 * - Otherwise derives cross-rate as target rate / source rate
 *
 * @param rates - Array of currency rates relative to EUR
 * @param sourceCurrency - The currency to convert from
 * @param targetCurrency - The currency to convert to
 * @returns The conversion rate, or null if either currency is not in the rates list
 */
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
