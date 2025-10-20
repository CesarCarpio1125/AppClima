<template>
  <div class="app">
    <header>
      <h1 class="app-title">🌤️ Pronóstico del Tiempo</h1>
      <SearchBar 
        @search="handleSearch" 
        @units-change="handleUnitsChange"
      />
    </header>

    <main>
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando datos meteorológicos...</p>
      </div>

      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button @click="error = ''" class="dismiss-btn">Cerrar</button>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="weather" class="weather-container">
          <WeatherCard 
            :data="weather" 
            :forecast-data="forecastList"
            :key="weather.city + units"
          />
          
          <div class="weather-actions">
            <button @click="saveLocation" class="save-location-btn" v-if="weather">
              💾 {{ isLocationSaved ? 'Guardado' : 'Guardar ubicación' }}
            </button>
          </div>
          
          <div v-if="forecastList.length > 0" class="chart-container">
            <h3 class="chart-title">Temperatura pronosticada</h3>
            <div class="chart-wrapper">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </div>
        </div>
      </Transition>

      <div v-if="!weather && !loading && !error" class="welcome-message">
        <div class="welcome-icon">🌍</div>
        <h2>Bienvenido al Pronóstico del Tiempo</h2>
        <p>Busca una ciudad para ver el pronóstico actual y el pronóstico extendido.</p>
        <div class="quick-searches">
          <button 
            v-for="city in popularCities" 
            :key="city"
            @click="handleSearch({ city })"
            class="quick-search-btn"
          >
            {{ city }}
          </button>
        </div>
      </div>
    </main>
    
    <footer class="app-footer">
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import SearchBar from './components/SearchBar.vue'
import WeatherCard from './components/WeatherCard.vue'
import useWeather from './composables/useWeather'

// Inicializar el composable de clima
const weatherAPI = useWeather()
const { getCurrentWeather, getForecast, getSearchHistory } = weatherAPI

// Cargar ubicaciones guardadas al inicio
onMounted(() => {
  const saved = localStorage.getItem('savedLocations')
  if (saved) {
    savedLocations.value = JSON.parse(saved)
    checkIfLocationIsSaved()
  }
})

// Inicializar el estado
const weather = ref(null)
const forecastList = ref([])
const loading = ref(false)
const error = ref('')
const units = ref('metric')
const chartInstance = ref(null)
const chartCanvas = ref(null)
const searchHistory = ref([])
const savedLocations = ref([])
const isLocationSaved = ref(false)

// Cargar historial de búsquedas al iniciar
onMounted(() => {
  searchHistory.value = getSearchHistory()
})

// Ciudades populares para búsqueda rápida
const popularCities = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza',
  'Bilbao', 'Málaga', 'Murcia', 'Palma', 'Las Palmas'
]

// Manejar búsqueda de ciudad
const handleSearch = async ({ city, units: unitsParam = units.value }) => {
  if (!city) return
  
  loading.value = true
  error.value = ''
  
  try {
    // Obtener clima actual
    const currentWeather = await getCurrentWeather(city, unitsParam)
    weather.value = {
      ...currentWeather,
      units: units.value === 'metric' ? '°C' : '°F',
      windUnits: units.value === 'metric' ? 'm/s' : 'mph'
    }
    
    // Obtener pronóstico
    const forecast = await getForecast(city, unitsParam)
    forecastList.value = forecast
    
    // Actualizar unidades si es necesario
    if (unitsParam !== units.value) {
      units.value = unitsParam
    }
    
    // Actualizar el gráfico
    if (forecast.length > 0) {
      await nextTick()
      updateChart()
    }
    
    // Verificar si la ubicación está guardada
    checkIfLocationIsSaved()
  } catch (err) {
    console.error('Error al obtener datos del clima:', err)
    error.value = 'No se pudo obtener la información del clima. Por favor, inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

// Manejar cambio de unidades
const handleUnitsChange = (newUnits) => {
  if (newUnits !== units.value && weather.value) {
    units.value = newUnits
    handleSearch({ city: weather.value.city, units: newUnits })
  }
}

// Verificar si la ubicación actual está guardada
const checkIfLocationIsSaved = () => {
  if (!weather.value) return false
  isLocationSaved.value = savedLocations.value.some(
    loc => loc.name === weather.value.city
  )
  return isLocationSaved.value
}

// Guardar o quitar ubicación de favoritos
const saveLocation = () => {
  if (!weather.value) return
  
  const location = {
    name: weather.value.city,
    country: weather.value.country || '',
    temp: weather.value.temp,
    weather: weather.value.weather,
    icon: weather.value.icon,
    units: units.value,
    timestamp: new Date().toISOString()
  }
  
  if (isLocationSaved.value) {
    // Remover de guardados
    savedLocations.value = savedLocations.value.filter(
      loc => loc.name !== weather.value.city
    )
  } else {
    // Agregar a guardados
    savedLocations.value = [...savedLocations.value, location]
  }
  
  // Actualizar localStorage
  localStorage.setItem('savedLocations', JSON.stringify(savedLocations.value))
  isLocationSaved.value = !isLocationSaved.value
  
  console.log('Ubicaciones guardadas:', savedLocations.value) // Para depuración
}

// Actualizar el gráfico con los datos del pronóstico
const updateChart = () => {
  if (!chartCanvas.value || forecastList.value.length === 0) return
  
  // Destruir instancia anterior si existe
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }
  
  const ctx = chartCanvas.value.getContext('2d')
  
  // Preparar datos para el gráfico
  const labels = forecastList.value.map(day => {
    try {
      // Si day.dt es un timestamp en segundos
      if (day.dt) {
        const date = new Date(day.dt * 1000)
        return date.toLocaleDateString('es-ES', { weekday: 'short' })
      }
      // Si ya viene formateado como '2023-10-17 15:00:00'
      if (day.date) {
        const date = new Date(day.date)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('es-ES', { weekday: 'short' })
        }
      }
      return 'N/D'
    } catch (e) {
      console.error('Error formateando fecha:', e, day)
      return 'N/D'
    }
  })
  
  // Extraer datos de temperatura, manejando diferentes estructuras de datos
  const temps = forecastList.value.map(day => {
    // Si el día tiene un objeto main con las temperaturas
    if (day.main) {
      return Math.round(day.main.temp)
    }
    // Si las temperaturas están en la raíz del objeto
    return Math.round(day.temp || 0)
  })
  
  const minTemps = forecastList.value.map(day => {
    if (day.main?.temp_min !== undefined) {
      return Math.round(day.main.temp_min)
    }
    return Math.round(day.temp_min || 0)
  })
  
  const maxTemps = forecastList.value.map(day => {
    if (day.main?.temp_max !== undefined) {
      return Math.round(day.main.temp_max)
    }
    return Math.round(day.temp_max || 0)
  })
  
  console.log('Datos del gráfico:', { labels, temps, minTemps, maxTemps }) // Para depuración
  
  // Crear el gráfico
  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Máxima',
          data: maxTemps,
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Media',
          data: temps,
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          borderWidth: 3,
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Mínima',
          data: minTemps,
          borderColor: '#60a5fa',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.raw}°${units.value === 'metric' ? 'C' : 'F'}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => `${value}°${units.value === 'metric' ? 'C' : 'F'}`
          }
        }
      }
    }
  })
}

// Observar cambios en la lista de pronósticos
watch(forecastList, () => {
  if (forecastList.value.length > 0) {
    updateChart()
  }
}, { deep: true })

// Inicializar el gráfico cuando el componente se monte
onMounted(() => {
  if (chartCanvas.value && forecastList.value.length > 0) {
    updateChart()
  }
})

// Limpiar el gráfico cuando el componente se desmonte
onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #1f2937;
  display: flex;
  flex-direction: column;
}

header {
  margin-bottom: 24px;
  text-align: center;
}

.app-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #4b5563;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  background-color: #fef2f2;
  color: #b91c1c;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: fadeIn 0.3s ease-out;
}

.error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.error-message p {
  margin: 0;
  flex: 1;
}

.dismiss-btn {
  background: none;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.dismiss-btn:hover {
  background-color: #fecaca;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-message h2 {
  font-size: 1.5rem;
  margin: 0 0 12px;
  color: #111827;
}

.welcome-message p {
  color: #4b5563;
  margin: 0 0 24px;
  line-height: 1.5;
}

.quick-searches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

.quick-search-btn {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-search-btn:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

.weather-container {
  margin: 0 auto;
  width: 100%;
  max-width: 600px;
}

.chart-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-top: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.chart-title {
  font-size: 16px;
  color: #4b5563;
  margin: 0 0 16px;
  font-weight: 600;
  text-align: center;
}

canvas {
  width: 100% !important;
  height: 300px !important;
}

.app-footer {
  margin-top: auto;
  padding: 20px 0;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.app-footer a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.app-footer a:hover {
  text-decoration: underline;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .app {
    padding: 16px;
  }
  
  .app-title {
    font-size: 1.75rem;
  }
  
  .welcome-message {
    padding: 20px 0;
  }
  
  .chart-container {
    padding: 16px;
  }
  
  canvas {
    height: 250px !important;
  }
}
</style>
