<template>
  <div class="card" :class="{ 'fade-in': showCard }">
    <div class="weather-header">
      <h2 class="city">{{ data.city }}</h2>
      <div class="weather-icon-container">
        <img 
          :src="iconUrl" 
          :alt="data.weather" 
          class="weather-icon"
          :class="{ 'rotate-in': showIcon }"
        />
      </div>
    </div>
    
    <div class="weather-main">
      <div class="temperature">
        <span class="temp-value" :class="{ 'bounce-in': showTemp }">
          {{ Math.round(data.temp) }}<span class="unit">{{ data.units || '°C' }}</span>
        </span>
        <div class="weather-desc">{{ data.weather }}</div>
      </div>
    </div>
    
    <div class="weather-details" :class="{ 'slide-up': showDetails }">
      <div class="detail-item">
        <span class="detail-label">Sensación</span>
        <span class="detail-value">{{ Math.round(data.feels_like) }}{{ data.units || '°C' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Humedad</span>
        <span class="detail-value">{{ data.humidity }}%</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Viento</span>
        <span class="detail-value">{{ data.wind }} {{ data.windUnits || 'm/s' }}</span>
      </div>
    </div>
    
    <div v-if="forecastData" class="forecast-container">
      <h3 class="forecast-title">Pronóstico</h3>
      <div class="forecast-scroll">
        <div v-for="(day, index) in forecastData" :key="index" class="forecast-item">
          <div class="forecast-day">{{ formatDay(day.date) }}</div>
          <img 
            :src="`https://openweathermap.org/img/wn/${day.icon}.png`" 
            :alt="day.weather"
            class="forecast-icon"
          />
          <div class="forecast-temp">
            <span class="temp-max">{{ Math.round(day.temp_max) }}°</span>
            <span class="temp-min">{{ Math.round(day.temp_min) }}°</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({ 
  data: Object,
  forecastData: Array
})

const showCard = ref(false)
const showIcon = ref(false)
const showTemp = ref(false)
const showDetails = ref(false)

const iconUrl = `https://openweathermap.org/img/wn/${props.data?.icon}@2x.png`

// Animation sequence
onMounted(() => {
  showCard.value = true
  
  setTimeout(() => {
    showIcon.value = true
  }, 200)
  
  setTimeout(() => {
    showTemp.value = true
  }, 400)
  
  setTimeout(() => {
    showDetails.value = true
  }, 600)
})

// Format day for forecast
function formatDay(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { weekday: 'short' })
}
</script>

<style scoped>
.card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
              0 8px 10px -6px rgba(0, 0, 0, 0.1);
  margin: 16px 0;
  max-width: 500px;
  width: 100%;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.city {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.weather-icon-container {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.weather-icon {
  width: 60px;
  height: 60px;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s ease-out;
}

.rotate-in {
  opacity: 1;
  transform: scale(1) rotate(0deg);
  animation: rotateIn 0.8s ease-out forwards;
}

.weather-main {
  text-align: center;
  margin: 20px 0 30px;
}

.temperature {
  margin-bottom: 8px;
}

.temp-value {
  font-size: 64px;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-out;
}

.bounce-in {
  opacity: 1;
  transform: translateY(0);
  animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.unit {
  font-size: 0.6em;
  vertical-align: super;
  margin-left: 2px;
  opacity: 0.8;
}

.weather-desc {
  font-size: 18px;
  color: #64748b;
  text-transform: capitalize;
  margin-top: 4px;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-out 0.3s;
}

.slide-up {
  opacity: 1;
  transform: translateY(0);
}

.detail-item {
  text-align: center;
  background: rgba(241, 245, 249, 0.6);
  padding: 12px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.detail-item:hover {
  background: rgba(226, 232, 240, 0.8);
  transform: translateY(-2px);
}

.detail-label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-weight: 600;
  color: #1e293b;
  font-size: 16px;
}

.forecast-container {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.forecast-title {
  font-size: 16px;
  color: #64748b;
  margin-bottom: 12px;
  font-weight: 600;
}

.forecast-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.forecast-scroll::-webkit-scrollbar {
  height: 6px;
}

.forecast-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.forecast-scroll::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.forecast-item {
  flex: 0 0 auto;
  text-align: center;
  padding: 12px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 10px;
  min-width: 80px;
  transition: all 0.2s ease;
}

.forecast-item:hover {
  background: rgba(226, 232, 240, 0.8);
  transform: translateY(-2px);
}

.forecast-day {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  text-transform: capitalize;
}

.forecast-icon {
  width: 40px;
  height: 40px;
  margin: 4px 0;
}

.forecast-temp {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.temp-max {
  font-weight: 600;
  color: #1e293b;
}

.temp-min {
  color: #64748b;
  opacity: 0.8;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes rotateIn {
  from { transform: rotate(-30deg) scale(0.8); opacity: 0; }
  to { transform: rotate(0) scale(1); opacity: 1; }
}

@keyframes bounceIn {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .card {
    padding: 16px;
  }
  
  .city {
    font-size: 20px;
  }
  
  .temp-value {
    font-size: 48px;
  }
  
  .weather-details {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .forecast-item {
    min-width: 70px;
    padding: 10px 8px;
  }
}
</style>
