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