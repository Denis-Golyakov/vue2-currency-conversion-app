# Currency Conversion App

A frontend application for managing currency conversion fees and calculating currency conversions with live exchange rates.

## Stack

- Vue 2
- TypeScript
- Vite

## Features

- **Fee Manager** - add, edit, and remove conversion fees per currency pair and direction (e.g. EUR→GBP and GBP→EUR are independent). Fees are persisted to `localStorage`.
- **Converter** - enter an amount, source currency, and target currency to get a converted result. Fetches live exchange rates from the ECB. Supports cross-rate conversion (e.g. GBP→USD derived via EUR). Applies configured fees, falling back to a default 1% fee if none is set.

## Prerequisites

- Node.js >= 18
- pnpm

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173`.

## Running Tests

```bash
pnpm run test:unit
```

> ℹ️ _[Update this section once tests are added]_

## Proxy Configuration

The ECB exchange rate endpoint does not set CORS headers. A proxy is configured in `vite.config.js` to route requests through the dev server:

```js
server: {
  proxy: {
    '/ecb-rates': {
      target: 'https://www.ecb.europa.eu',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/ecb-rates/, '')
    }
  }
}
```

Requests to `/ecb-rates/stats/eurofxref/eurofxref-daily.xml` are proxied to the ECB endpoint.

## Notes

- All data is client-side only - no backend required.
- Fees are stored as decimal fractions (e.g. `0.05` for 5%).
- Conversion formula: `(amount - amount * fee) * rate`