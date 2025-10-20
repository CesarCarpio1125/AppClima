// src/composables/useWeather.js
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY
const BASE = 'https://api.openweathermap.org/data/2.5'
const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct'

function handleResp(res) {
    if (!res.ok) throw new Error(`API error ${res.status}`)
    return res.json()
}

// Save search history to localStorage
function saveToHistory(city) {
    const history = JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]')
    if (!history.includes(city)) {
        history.unshift(city)
        localStorage.setItem('weatherSearchHistory', JSON.stringify(history.slice(0, 5)))
    }
}

// Get search history from localStorage
function getSearchHistory() {
    return JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]')
}

export default function useWeather() {
    async function getCurrentWeather(city, units = 'metric', lang = 'es') {
        const url = `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=${lang}`
        const res = await fetch(url)
        const data = await handleResp(res)
        
        // Save to search history
        saveToHistory(city)
        
        return {
            city: `${data.name}, ${data.sys?.country || ''}`,
            temp: data.main.temp,
            feels_like: data.main.feels_like,
            humidity: data.main.humidity,
            wind: data.wind.speed,
            weather: data.weather?.[0]?.description,
            icon: data.weather?.[0]?.icon,
            units: units === 'metric' ? '°C' : '°F',
            windUnits: units === 'metric' ? 'm/s' : 'mph'
        }
    }

    // Forecast 5 días / cada 3h -> convertimos a un resumen diario simple
    async function getForecast(city, units = 'metric', lang = 'es') {
        const url = `${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${units}&lang=${lang}`
        const res = await fetch(url)
        const data = await handleResp(res)
        
        // Agrupar por fecha (día) y tomar 1 registro por día (por ejemplo mediodía)
        const map = {}
        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0]
            if (!map[date]) map[date] = item
        })
        
        return Object.keys(map).slice(0, 5).map(d => {
            const it = map[d]
            return {
                date: d,
                temp: it.main.temp,
                weather: it.weather[0].description,
                icon: it.weather[0].icon,
                temp_min: it.main.temp_min,
                temp_max: it.main.temp_max
            }
        })
    }
    
    // City autocomplete using OpenWeatherMap Geocoding API
    async function searchCities(query, limit = 5) {
        if (!query.trim()) return []
        const url = `${GEOCODING_URL}?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
        try {
            const response = await fetch(url)
            const data = await handleResp(response)
            return data.map(city => ({
                name: `${city.name}, ${city.country}`,
                lat: city.lat,
                lon: city.lon
            }))
        } catch (error) {
            console.error('Error fetching cities:', error)
            return []
        }
    }

    return { 
        getCurrentWeather, 
        getForecast, 
        searchCities,
        getSearchHistory 
    }
}
