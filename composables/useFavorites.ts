// composables/useFavorites.ts
import { onMounted, watch } from 'vue'

const STORAGE_KEY = 'cmr:favorites'

export const useFavorites = () => {
  // Estado global en Nuxt (compartido entre páginas)
  const favorites = useState<string[]>('favorites', () => [])

  // Cargar desde localStorage en cliente
  onMounted(() => {
    if (!import.meta.client) return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        favorites.value = parsed.filter((x) => typeof x === 'string')
      }
    } catch (e) {
      console.error('Failed to load favorites from localStorage', e)
    }
  })

  // Persistir cambios en localStorage
  watch(
    favorites,
    (val) => {
      if (!import.meta.client) return
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch (e) {
        console.error('Failed to save favorites to localStorage', e)
      }
    },
    { deep: true }
  )

  const isFavorite = (id: string) => favorites.value.includes(id)

  const toggleFavorite = (id: string) => {
    const set = new Set(favorites.value)
    if (set.has(id)) {
      set.delete(id)
    } else {
      set.add(id)
    }
    favorites.value = Array.from(set)
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite
  }
}
