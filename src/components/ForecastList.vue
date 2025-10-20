<template>
  <div class="forecast">
    <h3>Pronóstico (5 días)</h3>
    <div class="list">
      <div class="item" v-for="f in list" :key="f.date">
        <div>{{ formatDate(f.date) }}</div>
        <img :src="`https://openweathermap.org/img/wn/${f.icon}.png`" />
        <div>{{ Math.round(f.temp) }}°C</div>
        <div class="small">{{ f.weather }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({ list: Array })
function formatDate(d) {
  const dt = new Date(d)
  return dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
}
</script>

<style scoped>
.forecast { margin-top:18px; }
.list{ display:flex; gap:10px; overflow:auto; padding-bottom:10px;}
.item{ min-width:100px; text-align:center; background:#fff; padding:10px; border-radius:8px; box-shadow:0 3px 10px rgba(0,0,0,0.06);}
.small{ font-size:12px; color:#666; text-transform:capitalize;}
</style>
