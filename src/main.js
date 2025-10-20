import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import Dashboard from './views/Dashboard.vue'
import './style.css'

// i18n setup
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('userLang') || 'es',
  fallbackLocale: 'en',
  messages: {
    en: {
      appTitle: {
        weather: 'Weather App',
        list: 'My Locations'
      },
      weather: 'Weather',
      list: {
        title: 'Saved Locations',
        view: 'View',
        empty: 'No saved locations yet. Search for a location in the Weather tab to save it.'
      }
    },
    es: {
      appTitle: {
        weather: 'App del Clima',
        list: 'Mis Ubicaciones'
      },
      weather: 'Clima',
      list: {
        title: 'Ubicaciones Guardadas',
        view: 'Ver',
        empty: 'No hay ubicaciones guardadas. Busca una ubicación en la pestaña de Clima para guardarla.'
      }
    }
  }
})

// Create and mount the app
const app = createApp(Dashboard)
app.use(i18n)
app.mount('#app')
