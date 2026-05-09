<script lang="ts">
import { getConversionRate, getCurrencyList } from '../utils/rates';
import CurrencySelect from './CurrencySelect.vue';

export interface ConversionResult {
  conversionRate: number;
  feeAmount: number;
  feePercent: number;
  sourceCurrency: string;
  targetCurrency: string;
  value: number | null;
}

export default {
  name: 'Converter',
  props: [
    'currencyService',
    'feeService'
  ],
  components: { CurrencySelect },
  data() {
    return {
      amount: 0 as number,
      result: {
        conversionRate: 0,
        feeAmount: 0,
        feePercent: 0,
        sourceCurrency: '',
        targetCurrency: '',
        value: null
      } as ConversionResult,
      sourceCurrency: '',
      targetCurrency: ''
    }
  },
  computed: {
    currencyRates(): string[] {
      return getCurrencyList(this.currencyService.ratesData);
    },
    conversionFee(): number {
      if (this.sourceCurrency && this.targetCurrency) {
        const fee = this.feeService.getFee(this.sourceCurrency, this.targetCurrency);
        if (fee !== null) {
          return fee;
        }
      }

      return 0.01;
    },
    conversionFeePercent(): number {
      return Math.round(this.conversionFee * 100);
    },
    canConvert(): boolean {
      return this.sourceCurrency !== '' &&
        this.targetCurrency !== '' &&
        this.targetCurrency !== this.sourceCurrency &&
        this.amount > 0;
    },
    resultValueString(): string {
      if (this.result.value !== null) {
        return (this.result.value).toFixed(2);
      }

      return '-';
    }
  },
  methods: {
    convert() {
      if (this.canConvert) {
        this.result.sourceCurrency = this.sourceCurrency;
        this.result.targetCurrency = this.targetCurrency;
        const conversionRate = getConversionRate(
          this.currencyService.ratesData,
          this.result.sourceCurrency,
          this.result.targetCurrency
        );
        if (conversionRate !== null) {
          this.result.conversionRate = conversionRate;
          const adjustedAmount = (this.amount * (1 - this.conversionFee));
          this.result.feeAmount = this.amount - adjustedAmount;
          this.result.value = adjustedAmount * conversionRate;
          this.result.feePercent = this.conversionFeePercent;
        }
      }
    },
    switchCurrencies() {
      const temp = this.sourceCurrency;
      this.sourceCurrency = this.targetCurrency;
      this.targetCurrency = temp;
    },
  },
}
</script>

<template>
  <div class="converter">
    <div class="amount-row">
      <label for="converterAmount">Amount</label>
      <input type="number" name="converterAmount" id="converterAmount" step="0.01" min="0"
        v-model.number="amount" />
    </div>
    <div class="currencies-row">
      <div class="currency-wrp">
        <label for="converterFrom">From</label>
        <currency-select :currencyRates="currencyRates" name="converterFrom"
          v-model="sourceCurrency" />
      </div>
      <div class="currency-wrp">
        <label for="converterTo">To</label>
        <currency-select :currencyRates="currencyRates" name="converterTo"
          v-model="targetCurrency" />
      </div>
    </div>
    <div class="buttons-row">
      <button class="convert-btn" :disabled="!canConvert" @click="convert()">
        Convert
      </button>
      <button class="switch-currencies-btn" @click="switchCurrencies()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
          <path d="M7 19V5M7 5L3 9M7 5L11 9" stroke="black" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M17 5V19M17 19L13 15M17 19L21 15" stroke="black" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
    <div class="result-row">
      <p class="label">Result</p>
      <div class="result-value-wrp">
        <p class="result-value">
          {{ resultValueString }}
        </p>
        <p class="result-currency" v-show="resultValueString != '-'">
          {{ result.targetCurrency }}
        </p>
      </div>
      <div class="result-fee" v-show="resultValueString != '-'">
        fee {{ result.feePercent }}% ·
        deducted: {{ result.feeAmount.toFixed(2) }} {{ result.sourceCurrency }} ·
        rate: 1 {{ result.sourceCurrency }} =
        {{ result.conversionRate.toFixed(4) }} {{ result.targetCurrency }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.converter {
  display: flex;
  flex-direction: column;
  gap: .75rem;

  label {
    display: block;
    font-size: 0.75rem;
  }

  input,
  select {
    border: 1px solid #777;
    border-radius: .5rem;
    padding: 0.25rem 0.5rem;
    width: 100%;
  }

  .amount-row {
    input {
      font-size: 1.5rem;
    }
  }

  .buttons-row,
  .currencies-row {
    display: flex;
    flex-direction: row;
    gap: .5rem;
  }

  .buttons-row {
    .convert-btn {
      background-color: #353;
      border: 1px solid #333;
      border-radius: .5rem;
      color: white;
      flex: 1;
      padding: .5rem 0;

      &:hover {
        background-color: #ded;
        cursor: pointer;
        color: #353;
      }

      &:disabled {
        background-color: #666;
        cursor: not-allowed;
        color: #999;
      }
    }

    .switch-currencies-btn {
      background-color: #666;
      border: 1px solid #666;
      border-radius: 100%;
      color: white;
      padding: .5rem 0;
      width: 2.25rem;

      &:hover {
        background-color: #ccc;
        cursor: pointer;
        color: #353;
      }
    }
  }

  .currencies-row {
    .currency-wrp {
      flex: 1;
    }
  }

  .result-row {
    background-color: color-mix(in srgb, #343, transparent 70%);
    border: 1px solid #343;
    border-radius: .5rem;
    padding: .5rem .75rem;

    .label {
      font-size: .75rem;
    }

    .result-value-wrp {
      display: flex;
      flex-direction: row;
      font-family: monospace;
      justify-content: start;
      align-items: center;

      .result-value {
        font-size: 2rem;
      }

      .result-currency {
        font-size: 1.25rem;
        padding: .5rem 0 0 1rem;
      }
    }

    .result-fee {
      color: #797;
      font-family: monospace;
      font-size: .75rem;
    }
  }
}
</style>