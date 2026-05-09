<script lang="ts">
import ECB from './services/ecb';
import Fees from './services/fees';
import Converter from './components/Converter.vue';
import FeeManager from './components/FeeManager.vue';

export default {
  components: {
    Converter,
    FeeManager
  },
  data() {
    return {
      activeTab: 'convert', // 'convert' | 'fees'
      currencyService: new ECB(),
      feeService: new Fees()
    }
  },
  computed: {
    isReady(): boolean {
      return this.currencyService.loading === false;
    },
    lastUpdateString(): string {
      return this.currencyService.lastUpdateDate
        ? this.currencyService.lastUpdateDate.toLocaleString('lv-LV') : '-';
    }
  },
}
</script>

<template>
  <div id="app">
    <header>
      <h1>Currency Conversion App</h1>
      <p class="last-updated-at">Rates updated on {{ lastUpdateString }}</p>
    </header>

    <main>
      <div class="tabs" v-if="isReady">
        <div class="tabs-button-wrp">
          <div class="tab-button" @click="activeTab = 'convert'"
            :class="activeTab === 'convert' ? 'active' : ''">Convert</div>
          <div class="tab-button" @click="activeTab = 'fees'"
            :class="activeTab === 'fees' ? 'active' : ''">Fees</div>
        </div>
        <div class="tabs-content-wrp">
          <div class="tab-content-ctn" v-show="activeTab === 'convert'">
            <converter :currencyService="currencyService" :feeService="feeService" />
          </div>
          <div class="tab-content-ctn" v-show="activeTab === 'fees'">
            <fee-manager :currencyService="currencyService" :feeService="feeService" />
          </div>
        </div>
      </div>
      <div v-else>
        Loading...
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
header {
  margin-bottom: 1rem;

  .last-updated-at {
    color: #777;
    font-family: monospace;
    font-size: .8rem;
  }
}

.tabs {
  min-width: 500px;

  .tabs-button-wrp {
    display: flex;
    border-bottom: 1px solid #777;

    .tab-button {
      border: 1px solid transparent;
      border-radius: .5rem .5rem 0 0;
      cursor: pointer;
      padding: 0.25rem 1rem;

      &.active {
        background-color: #575;
        border: 1px solid #777;
        border-bottom: 1px solid transparent;
      }

      &:hover {
        background-color: #fff;
        color: #333;
      }
    }
  }

  .tabs-content-wrp {
    padding: 1rem .5rem;
  }
}
</style>
