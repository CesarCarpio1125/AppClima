<template>
  <div class="dashboard">
    <header class="app-header">
      <h1>{{ currentAppTitle }}</h1>
      <div class="app-switcher">
        <button 
          @click="switchApp('app-clima')"
          :class="{ active: currentApp === 'app-clima' }"
        >
          🌤️ {{ $t('weather') }}
        </button>
        <button 
          @click="switchApp('app-list')"
          :class="{ active: currentApp === 'app-list' }"
        >
          📋 {{ $t('list') }}
        </button>
      </div>
    </header>
    
    <main class="main-content">
      <div class="app-container">
        <div v-if="error" class="error-message">
          <h3>¡Ups! Algo salió mal</h3>
          <p>{{ error.message }}</p>
          <button @click="error = null">Reintentar</button>
        </div>
        <template v-else>
          <div v-if="currentApp === 'app-clima'">
            <AppClima v-bind="componentProps" @view-location="handleViewLocation" />
          </div>
          <div v-else>
            <AppList v-bind="componentProps" @view-location="handleViewLocation" />
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'

// Import components
import AppClima from '@/AppClima.vue'
import AppList from '@/AppList.vue'

// Manejo de errores
const error = ref(null)
onErrorCaptured((err) => {
  error.value = err
  console.error('Error en el componente:', err)
  return false
})

const { t } = useI18n()
const currentApp = ref('app-clima')
const currentLocation = ref(null)

const currentAppTitle = computed(() => {
  return currentApp.value === 'app-clima' 
    ? t('appTitle.weather') 
    : t('appTitle.list')
})

const componentProps = computed(() => ({
  currentLocation: currentLocation.value
}))

function switchApp(appName) {
  currentApp.value = appName
}

function handleViewLocation(location) {
  currentLocation.value = location
  switchApp('app-clima')
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.app-switcher {
  display: flex;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #f8fafc;
}

button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.main-content {
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.app-container {
  flex: 1;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.error-message {
  padding: 1rem;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 0.375rem;
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-message button {
  margin-top: 0.5rem;
  background: #dc2626;
  color: white;
  background: var(--card-bg);
  padding: 0.25rem;
  border-radius: 2rem;
  box-shadow: var(--shadow-sm);
}

.app-switcher button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 2rem;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.app-switcher button.active {
  background: var(--primary-color);
  color: white;
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
