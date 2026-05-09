import { beforeEach, describe, it, expect, vi } from 'vitest'

import Fees from '../fees'

describe('Fees', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('getFeeList returns empty array when fees are empty', () => {
        const fees = new Fees();

        expect(fees.getFeeList()).toEqual([]);
    });

    it('getFeeList returns fees when fees are set', () => {
        const fees = new Fees();

        fees.setFee('USD', 'EUR', 0.95);
        fees.setFee('EUR', 'USD', 1.15);

        expect(fees.getFeeList()).toContainEqual({ source: 'USD', target: 'EUR', value: 0.95 });
        expect(fees.getFeeList()).toContainEqual({ source: 'EUR', target: 'USD', value: 1.15 });
    });

    it('getFee returns null when fee is not found', () => {
        const fees = new Fees();

        expect(fees.getFee('USD', 'EUR')).toBeNull();
    });

    it('getFee returns correct value when fee exists', () => {
        const fees = new Fees();

        fees.setFee('USD', 'EUR', 0.95);

        expect(fees.getFee('USD', 'EUR')).toBe(0.95);
    });

    it('fees are direction-sensitive', () => {
        const fees = new Fees();

        fees.setFee('USD', 'EUR', 0.95);

        expect(fees.getFee('EUR', 'USD')).toBeNull();
    });

    it('setFee overwrites existing fee for same pair', () => {
        const fees = new Fees();

        fees.setFee('USD', 'EUR', 0.95);
        fees.setFee('USD', 'EUR', 0.05);

        expect(fees.getFee('USD', 'EUR')).toBe(0.05);
        expect(fees.getFeeList().filter(f => f.source === 'USD' && f.target === 'EUR')).toHaveLength(1);
    });

    it('removeFee removes the correct fee', () => {
        const fees = new Fees();

        fees.setFee('USD', 'EUR', 0.95);
        fees.setFee('EUR', 'USD', 1.15);
        fees.removeFee('USD', 'EUR');

        expect(fees.getFee('USD', 'EUR')).toBeNull();
        expect(fees.getFee('EUR', 'USD')).toBe(1.15);
    });

    it('removeFee on non-existent fee does not throw', () => {
        const fees = new Fees();

        expect(() => fees.removeFee('USD', 'EUR')).not.toThrow();
    });

    it('fees persist across instances via localStorage', () => {
        const fees1 = new Fees();

        fees1.setFee('USD', 'EUR', 0.95);

        const fees2 = new Fees();

        expect(fees2.getFee('USD', 'EUR')).toBe(0.95);
    });

    it('getFee returns 0 when fee is set to zero', () => {
        const fees = new Fees();

        fees.setFee('USD', 'EUR', 0);

        expect(fees.getFee('USD', 'EUR')).toBe(0);
    });
});