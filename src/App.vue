<script lang="ts">
import ECB from './services/ecb';
import FeeManager from './components/FeeManager.vue';

export default {
  components: {
    FeeManager
  },
  data() {
    return {
      activeTab: 'fees',
      currencyService: new ECB()
    }
  }
}
</script>

<template>
  <div id="app">
    <header>
      <h1>Currency Conversion App</h1>
    </header>

    <main>
      <div class="tabs">
        <div class="tabs-button-wrp">
          <div class="tab-button" @click="activeTab = 'convert'"
            :class="activeTab === 'convert' ? 'active' : ''">Convert</div>
          <div class="tab-button" @click="activeTab = 'fees'"
            :class="activeTab === 'fees' ? 'active' : ''">Fees</div>
        </div>
        <div class="tabs-content-wrp">
          <div class="tab-content-ctn" v-show="activeTab === 'convert'">Convert
          </div>
          <div class="tab-content-ctn" v-show="activeTab === 'fees'">
            <fee-manager :currencyService="currencyService" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
header {
  margin-bottom: 1rem;
}

.tabs {
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
