<template>
  <div class="locations-container">
    <h1 class="locations-title">{{ t('list.title') }}</h1>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Cargando ubicaciones guardadas...</p>
    </div>

    <div v-else>
      <div v-if="savedLocations.length === 0" class="empty-state">
        <p>{{ t('list.empty') }}</p>
      </div>

      <ul v-else class="locations-list">
        <li v-for="(location, index) in savedLocations" :key="index" class="location-item">
          <div class="location-info">
            <h3>{{ location.name }}</h3>
            <p v-if="location.country">{{ location.country }}</p>
          </div>
          <div class="location-actions">
            <button
              @click="viewLocation(location)"
              class="btn-view"
              :title="t('list.view')"
            >
              {{ t('list.view') }}
            </button>
            <button
              @click="removeLocation(index)"
              class="btn-remove"
              :title="t('list.remove')"
            >
              Eliminar
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const savedLocations = ref([])
const isLoading = ref(true)

// Cargar ubicaciones guardadas
onMounted(() => {
  loadSavedLocations()
})

const loadSavedLocations = () => {
  try {
    const saved = localStorage.getItem('savedLocations')
    if (saved) {
      savedLocations.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Error cargando ubicaciones guardadas:', error)
  } finally {
    isLoading.value = false
  }
}

const saveLocations = () => {
  localStorage.setItem('savedLocations', JSON.stringify(savedLocations.value))
}

const emit = defineEmits(['view-location'])

const viewLocation = (location) => {
  emit('view-location', location)
}

const removeLocation = (index) => {
  savedLocations.value.splice(index, 1)
  saveLocations()
}
</script>

<style scoped>
.locations-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.locations-title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.8rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 20px 0;
}

.locations-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.location-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.location-info h3 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.location-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.location-actions {
  display: flex;
  gap: 8px;
}

.btn-view, .btn-remove {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-view {
  background: #42b883;
  color: white;
}

.btn-view:hover {
  background: #3aa873;
  transform: translateY(-1px);
}

.btn-remove {
  background: #f8f9fa;
  color: #e74c3c;
  border: 1px solid #e0e0e0;
}

.btn-remove:hover {
  background: #f1f1f1;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 600px) {
  .locations-container {
    padding: 15px;
  }

  .location-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .location-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>