import { describe, it, expect } from 'vitest'
import { getCurrencyList, getConversionRate } from '@/utils/rates'
import type { Rate } from '@/services/ecb'

const mockRates: Rate[] = [
    { currency: 'USD', rate: 1.1770 },
    { currency: 'GBP', rate: 0.8620 },
    { currency: 'JPY', rate: 162.50 },
]

describe('getCurrencyList', () => {
    it('includes EUR as first entry', () => {
        const list = getCurrencyList(mockRates)
        expect(list[0]).toBe('EUR')
    })

    it('includes all currencies from rates', () => {
        const list = getCurrencyList(mockRates)
        expect(list).toContain('USD')
        expect(list).toContain('GBP')
        expect(list).toContain('JPY')
    })

    it('returns empty array when rates are empty', () => {
        expect(getCurrencyList([])).toEqual([])
    })
})

describe('getConversionRate', () => {
    it('returns 1 for same currency', () => {
        expect(getConversionRate(mockRates, 'EUR', 'EUR')).toBe(1)
        expect(getConversionRate(mockRates, 'USD', 'USD')).toBe(1)
    })

    it('EUR to X returns target rate directly', () => {
        expect(getConversionRate(mockRates, 'EUR', 'USD')).toBe(1.1770)
        expect(getConversionRate(mockRates, 'EUR', 'GBP')).toBe(0.8620)
    })

    // toBeCloseTo is used to account for floating point inaccuracy
    it('X to EUR returns inverse of source rate', () => {
        expect(getConversionRate(mockRates, 'USD', 'EUR')).toBeCloseTo(1 / 1.1770)
        expect(getConversionRate(mockRates, 'GBP', 'EUR')).toBeCloseTo(1 / 0.8620)
    })

    it('X to Y derives cross rate via EUR', () => {
        expect(getConversionRate(mockRates, 'GBP', 'USD')).toBeCloseTo(1.1770 / 0.8620)
        expect(getConversionRate(mockRates, 'USD', 'GBP')).toBeCloseTo(0.8620 / 1.1770)
    })

    it('returns null for unknown source currency', () => {
        expect(getConversionRate(mockRates, 'XYZ', 'USD')).toBeNull()
    })

    it('returns null for unknown target currency', () => {
        expect(getConversionRate(mockRates, 'USD', 'XYZ')).toBeNull()
    })
})