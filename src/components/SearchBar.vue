<template>
  <div class="search-container">
    <form @submit.prevent="onSubmit" class="searchbar">
      <div class="search-input-container">
        <input
          v-model="q"
          @input="handleInput"
          @focus="showSuggestions = true"
          @blur="onBlur"
          placeholder="Buscar ciudad..."
          autocomplete="off"
        />
        <ul v-if="showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)" class="suggestions">
          <li v-if="searchHistory.length > 0" class="suggestion-header">Búsquedas recientes:</li>
          <li 
            v-for="item in searchHistory" 
            :key="'h-' + item"
            @mousedown="selectSuggestion(item)"
            class="suggestion-item history"
          >
            <span class="history-icon">⏱️</span> {{ item }}
          </li>
          
          <li v-if="suggestions.length > 0" class="suggestion-header">Sugerencias:</li>
          <li 
            v-for="suggestion in suggestions" 
            :key="'s-' + suggestion.name"
            @mousedown="selectSuggestion(suggestion.name)"
            class="suggestion-item"
          >
            📍 {{ suggestion.name }}
          </li>
        </ul>
      </div>
      <button type="submit" class="search-button">
        <span class="search-icon">🔍</span>
      </button>
      <button type="button" @click="toggleUnits" class="unit-toggle">
        {{ units === 'metric' ? '°C' : '°F' }}
      </button>
      <button type="button" @click="useGeo" class="location-button" title="Usar mi ubicación">
        <span class="location-icon">🌐</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import useWeather from '../composables/useWeather'

const weatherAPI = useWeather()
const { searchCities, getSearchHistory } = weatherAPI

const emits = defineEmits(['search', 'units-change'])

const q = ref('')
const suggestions = ref([])
const searchHistory = ref([])
const showSuggestions = ref(false)
const units = ref('metric')
let searchTimeout = null

// Load search history on component mount
onMounted(() => {
  searchHistory.value = getSearchHistory()
})


async function handleInput() {
  showSuggestions.value = true
  if (searchTimeout) clearTimeout(searchTimeout)
  
  if (q.value.length < 2) {
    suggestions.value = []
    return
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const results = await searchCities(q.value)
      suggestions.value = results
    } catch (error) {
      console.error('Error fetching city suggestions:', error)
      suggestions.value = []
    }
  }, 300)
}

function selectSuggestion(city) {
  q.value = city
  showSuggestions.value = false
  onSubmit()
}

function onBlur() {
  // Use setTimeout to allow click events on suggestions to fire first
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function onSubmit() {
  const query = q.value.trim()
  if (!query) return
  
  emits('search', { city: query, units: units.value })
  showSuggestions.value = false
}

function toggleUnits() {
  units.value = units.value === 'metric' ? 'imperial' : 'metric'
  emits('units-change', units.value)
  
  // If there's a current search, refresh it with new units
  if (q.value.trim()) {
    emits('search', { city: q.value.trim(), units: units.value })
  }
}

function useGeo() {
  if (!navigator.geolocation) {
    alert('Geolocalización no disponible')
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY
      const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
      
      try {
        const r = await fetch(url)
        const arr = await r.json()
        if (arr && arr.length) {
          const city = `${arr[0].name}, ${arr[0].country}`
          emits('search', { city, units: units.value })
        } else {
          alert('No se pudo resolver tu ubicación a ciudad')
        }
      } catch (error) {
        console.error('Error getting location:', error)
        alert('Error al obtener ciudad desde coordenadas')
      }
    },
    (error) => {
      console.error('Geolocation error:', error)
      alert('Permite geolocalización en tu navegador')
    },
    { timeout: 10000 }
  )
}
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.searchbar {
  display: flex;
  gap: 8px;
  margin: 16px 0;
  position: relative;
  width: 100%;
}

.search-input-container {
  position: relative;
  flex: 1;
}

input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  font-size: 16px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-radius: 8px;
  border: none;
  background: #42b883;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}

button:hover {
  background: #3aa876;
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

.search-button {
  background: #42b883;
  min-width: 48px;
}

.unit-toggle {
  background: #64748b;
  min-width: 48px;
  font-weight: bold;
}

.location-button {
  background: #8b5cf6;
  min-width: 48px;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
  padding: 8px 0;
  list-style: none;
}

.suggestion-header {
  padding: 8px 16px;
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.05em;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  margin: 4px 0;
}

.suggestion-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.1s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.suggestion-item.history {
  color: #4b5563;
}

.history-icon {
  opacity: 0.7;
  font-size: 14px;
}

.suggestion-item:hover {
  background-color: #f1f5f9;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .searchbar {
    flex-wrap: wrap;
  }
  
  .search-input-container {
    width: 100%;
    margin-bottom: 8px;
  }
  
  input {
    width: 100%;
  }
  
  button {
    flex: 1;
  }
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

.suggestions {
  animation: fadeIn 0.2s ease-out;
}
</style>
