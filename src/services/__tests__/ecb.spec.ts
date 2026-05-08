import { beforeEach, describe, it, expect, vi } from 'vitest'

import ECB from '../ecb'


describe('ECB', () => {
    const mockXml = `
        <gesmes:Envelope xmlns:gesmes="http://gesmes.org" xmlns="http://ecb.int">
            <Cube>
                <Cube time="2026-05-08">
                    <Cube currency="USD" rate="1.0850"/>
                    <Cube currency="GBP" rate="0.8620"/>
                </Cube>
            </Cube>
        </gesmes:Envelope>
        `;

    beforeEach(() => {
        global.fetch = vi.fn();
        localStorage.clear();
    });

    it('successfully executes fetchRates and updates rates', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(mockXml),
        });

        const ecb = new ECB(false);

        expect(ecb.lastUpdateDate).toBeNull();

        await ecb.fetchRates();

        expect(ecb.lastUpdateDate).not.toBeNull();
        expect(ecb.ratesData.length).toBe(2);
        expect(ecb.ratesData[0].currency).toBe('USD');
        expect(ecb.ratesData[0].rate).toBe(1.0850);
        expect(ecb.ratesData[1].currency).toBe('GBP');
        expect(ecb.ratesData[1].rate).toBe(0.8620);
    });

    it('ratesData falls back to localStorage when in-memory rates are empty', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(mockXml),
        });

        const ecb1 = new ECB(false);
        await ecb1.fetchRates();

        // New instance — in-memory rates are empty, should load from storage
        const ecb2 = new ECB(false);
        expect(ecb2.ratesData.length).toBe(2);
        expect(ecb2.ratesData[0].currency).toBe('USD');
    });

    it('lastUpdateDate persists across instances via localStorage', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(mockXml),
        });

        const ecb1 = new ECB(false);
        await ecb1.fetchRates();
        const savedDate = ecb1.lastUpdateDate;

        const ecb2 = new ECB(false);
        expect(ecb2.lastUpdateDate).not.toBeNull();
        expect(ecb2.lastUpdateDate?.toISOString()).toBe(savedDate?.toISOString());
    });

    it('parseXmlData ignores wrapper Cube elements without currency/rate', async () => {
        const xmlWithExtras = `
            <gesmes:Envelope xmlns:gesmes="http://gesmes.org" xmlns="http://ecb.int">
                <Cube>
                    <Cube time="2026-05-08">
                        <Cube currency="USD" rate="1.0850"/>
                    </Cube>
                </Cube>
            </gesmes:Envelope>
        `;

        (global.fetch as any).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(xmlWithExtras),
        });

        const ecb = new ECB(false);
        await ecb.fetchRates();

        expect(ecb.ratesData.length).toBe(1);
    });

    it('ratesData returns empty array when storage is also empty', () => {
        const ecb = new ECB(false);
        expect(ecb.ratesData).toEqual([]);
    });

    it('handles fetch failure gracefully', async () => {
        (global.fetch as any).mockRejectedValue(new Error('Network error'));

        const ecb = new ECB(false);
        await expect(ecb.fetchRates()).rejects.toThrow('Network error');
    });
})