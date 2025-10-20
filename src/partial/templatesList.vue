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
