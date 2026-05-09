<script lang="ts">
import { Fee } from '../services/fees';
import { getCurrencyList } from '../utils/rates';
import CurrencySelect from './CurrencySelect.vue';

export interface FormData {
  sourceCurrency: string;
  targetCurrency: string;
  value: number;
}

export default {
  name: 'FeeManager',
  props: [
    'currencyService',
    'feeService'
  ],
  components: { CurrencySelect },
  data() {
    return {
      feeList: [] as Fee[],
      newFee: { sourceCurrency: '', targetCurrency: '', value: 0 } as FormData
    };
  },
  computed: {
    feeCount(): number {
      return this.feeList.length;
    },
    currencyRates(): string[] {
      // Empty value for a fallback when form is reset
      return ['', ...getCurrencyList(this.currencyService.ratesData)];
    },
  },
  methods: {
    editFee(sourceCurrency: string, targetCurrency: string): void {
      this.setFormData({
        sourceCurrency: sourceCurrency,
        targetCurrency: targetCurrency,
        value: 0
      });
      this.loadFeeAmount();
    },
    loadFeeAmount(): void {
      if (this.newFee.sourceCurrency !== '' && this.newFee.targetCurrency !== '') {
        const feeValue = this.feeService.getFee(this.newFee.sourceCurrency, this.newFee.targetCurrency);
        this.newFee.value = feeValue !== null ? Math.round(feeValue * 100) : 0;
      }
    },
    reloadFees(): void {
      this.feeList = this.feeService.getFeeList();
    },
    removeFee(sourceCurrency: string, targetCurrency: string): void {
      this.feeService.removeFee(sourceCurrency, targetCurrency);
      this.reloadFees();
    },
    saveFee(): void {
      if (
        this.newFee.sourceCurrency === '' ||
        this.newFee.targetCurrency === '' ||
        this.newFee.sourceCurrency === this.newFee.targetCurrency
      ) {
        return;
      }

      this.feeService.setFee(
        this.newFee.sourceCurrency,
        this.newFee.targetCurrency,
        (this.newFee.value / 100)
      );
      this.setFormData();
      this.reloadFees();
    },
    setFormData(data: FormData | null = null): void {
      if (data === null) {
        data = { sourceCurrency: '', targetCurrency: '', value: 0 };
      }

      this.newFee.sourceCurrency = data.sourceCurrency;
      this.newFee.targetCurrency = data.targetCurrency;
      this.newFee.value = data.value;
    }
  },
  mounted() {
    this.reloadFees();
  }
}
</script>

<template>
  <div class="fee-manager">
    <table class="fees-table" v-show="feeCount > 0">
      <thead>
        <th class="source-field">From</th>
        <th class="target-field">To</th>
        <th class="fee-field">Fee</th>
        <th class="action-field"></th>
      </thead>
      <tbody>
        <tr v-for="(fee) in feeList" :key="`${fee.source}-${fee.target}`"
          @click="editFee(fee.source, fee.target)">
          <td class="source-field">{{ fee.source }}</td>
          <td class="target-field">{{ fee.target }}</td>
          <td class="fee-field">{{ (100 * fee.value).toFixed() }}%</td>
          <td class="action-field">
            <a href="#" @click.stop.prevent="removeFee(fee.source, fee.target)">x</a>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="fee-form">
      <h2>Add new fee</h2>
      <div class="wrapper">
        <div class="source">
          <currency-select :currencyRates="currencyRates" name="sourceCurrency"
            v-model="newFee.sourceCurrency" :disableCurrency="newFee.targetCurrency"
            v-on:input="loadFeeAmount()" />
        </div>
        <div class="direction">-></div>
        <div class="target">
          <currency-select :currencyRates="currencyRates" name="targetCurrency"
            v-model="newFee.targetCurrency" :disableCurrency="newFee.sourceCurrency"
            v-on:input="loadFeeAmount()" />
        </div>
        <div class="fee">
          <div class="prefix">%</div>
          <input type="number" class="fee-value" step="1" min="0" v-model.number="newFee.value" />
        </div>
        <div class="action">
          <button class="fee-button" @click="saveFee()">
            + Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fee-manager {
  .fees-table {
    border-collapse: collapse;
    width: 100%;

    thead {
      border-bottom: 1px solid #777;

      th {
        font-size: .75rem;
        padding: .25rem .5rem;
        text-align: left;
      }
    }

    tbody {
      tr {
        td {
          padding: .25rem .5rem;
        }

        &:hover {
          background-color: color-mix(in srgb, #559, transparent 50%) !important;
          cursor: pointer;
        }
      }

      tr:nth-of-type(even) {
        background-color: color-mix(in srgb, #343, transparent 70%);
      }
    }

    .action-field {
      text-align: right;

      a {
        border: 1px solid #333;
        border-radius: 100%;
        color: #777;
        display: inline-block;
        text-align: center;
        width: 1.75rem;

        &:hover {
          background-color: #933;
          color: #fff;
          cursor: pointer;
        }
      }
    }
  }

  .fee-form {
    border: 1px dashed #777;
    border-radius: .5rem;
    margin-top: 1rem;
    padding: .5rem 1rem;

    h2 {
      font-size: .8rem;
      margin-bottom: .5rem;
    }

    .wrapper {
      display: flex;
      flex-direction: row;
      width: 100%;

      .source,
      .target,
      .fee {
        padding: .25rem;
        width: 25%;
      }

      .fee {
        position: relative;

        .prefix {
          color: #777;
          left: .65rem;
          position: absolute;
          top: .275rem;
          z-index: 1000;
        }
      }

      .direction {
        align-items: center;
        display: flex;
        justify-content: center;
        width: 5%;
      }

      .action {
        padding: .25rem;
        width: 20%;

        .fee-button {
          background-color: #575;
          border: 1px solid #777;
          border-radius: .5rem;
          color: white;
          padding: .25rem .5rem;
          width: 100%;

          &:hover {
            background-color: #fff;
            cursor: pointer;
            color: #333;
          }
        }
      }

      .fee-value {
        border: 1px solid #777;
        border-radius: .5rem;
        padding: .25rem .5rem;
        width: 100%;
      }

      .fee-value {
        padding-left: 1.5rem;
      }
    }
  }
}
</style>
