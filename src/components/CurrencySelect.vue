<template>
  <select class="currency-selector" :name="name" :value="value" @change="changeEvent">
    <option v-for="entry in currencyRates" :key="entry" :value="entry"
      :disabled="entry === disableCurrency">
      {{ entry }}
    </option>
  </select>
</template>

<script lang="ts">
export default {
  name: 'CurrencySelect',
  props: ['currencyRates', 'disableCurrency', 'name', 'value'],
  methods: {
    changeEvent(event: Event): void {
      this.$emit('input', (event.target as HTMLSelectElement).value);
    }
  }
}
</script>

<style lang="scss" scoped>
.currency-selector {
  border: 1px solid #777;
  border-radius: .5rem;
  padding: .25rem .5rem;
  width: 100%;
}
</style>