// composables/useAlerts.ts
import { onMounted, watch } from 'vue'

const STORAGE_KEY = 'cmr:alerts'

export type AlertType =
  | 'price_above'
  | 'price_below'
  | 'change24h_above'
  | 'change24h_below'

export type Alert = {
  id: string
  assetId: string
  assetSymbol: string
  type: AlertType
  threshold: number
  active: boolean
  createdAt: string
  lastTriggeredAt?: string
}

type EvalAsset = {
  id: string
  symbol: string
  price: number
  change24h: number
}

const newId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const useAlerts = () => {
  const alerts = useState<Alert[]>('alerts', () => [])

  // Load from localStorage
  onMounted(() => {
    if (!import.meta.client) return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        alerts.value = parsed
      }
    } catch (e) {
      console.error('Failed to load alerts from localStorage', e)
    }
  })

  // Persist to localStorage
  watch(
    alerts,
    (val) => {
      if (!import.meta.client) return
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch (e) {
        console.error('Failed to save alerts to localStorage', e)
      }
    },
    { deep: true }
  )

  const createAlert = (payload: {
    assetId: string
    assetSymbol: string
    type: AlertType
    threshold: number
  }) => {
    const alert: Alert = {
      id: newId(),
      assetId: payload.assetId,
      assetSymbol: payload.assetSymbol,
      type: payload.type,
      threshold: payload.threshold,
      active: true,
      createdAt: new Date().toISOString()
    }
    alerts.value = [...alerts.value, alert]
    return alert
  }

  const deleteAlert = (id: string) => {
    alerts.value = alerts.value.filter((a) => a.id !== id)
  }

  const toggleAlertActive = (id: string) => {
    alerts.value = alerts.value.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    )
  }

  const evaluateForAsset = (asset: EvalAsset) => {
    const nowIso = new Date().toISOString()
    const triggered: Alert[] = []

    alerts.value = alerts.value.map((a) => {
      if (!a.active || a.assetId !== asset.id) return a

      let conditionMet = false
      switch (a.type) {
        case 'price_above':
          conditionMet = asset.price >= a.threshold
          break
        case 'price_below':
          conditionMet = asset.price <= a.threshold
          break
        case 'change24h_above':
          conditionMet = asset.change24h >= a.threshold
          break
        case 'change24h_below':
          conditionMet = asset.change24h <= a.threshold
          break
      }

      if (conditionMet) {
        triggered.push({ ...a, lastTriggeredAt: nowIso })
        return { ...a, lastTriggeredAt: nowIso }
      }

      return a
    })

    return triggered
  }

  return {
    alerts,
    createAlert,
    deleteAlert,
    toggleAlertActive,
    evaluateForAsset
  }
}
