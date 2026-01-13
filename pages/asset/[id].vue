<template>
  <main class="space-y-6">
    <section class="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div v-if="pending" class="text-sm text-slate-300">
        Loading asset…
      </div>
      <div v-else-if="error" class="text-sm text-red-300">
        {{ errorMessage }}
      </div>
      <div v-else-if="asset" class="space-y-4">
        <div v-if="triggeredAlerts.length"
          class="mb-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-[11px] text-amber-100">
          <div class="font-semibold mb-1">
            Alerts triggered for {{ asset?.symbol }}:
          </div>
          <ul class="list-disc pl-4 space-y-0.5">
            <li v-for="a in triggeredAlerts" :key="a.id">
              <span>
                {{ describeAlert(a) }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Header -->
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Asset
            </p>
            <h1 class="mt-1 text-2xl font-semibold tracking-tight">
              {{ asset.symbol }}
              <span class="text-slate-300 text-base">· {{ asset.name }}</span>
            </h1>
            <p class="mt-2 text-sm text-slate-300">
              Rank #
              <span class="font-semibold text-slate-100">
                {{ asset.rank }}
              </span>
            </p>
          </div>

          <div class="text-right space-y-1">
            <div class="text-sm text-slate-400">Price</div>
            <div class="text-2xl font-semibold">
              {{ formatCurrency(asset.price) }}
            </div>
            <div class="flex justify-end gap-2 text-xs">
              <span :class="['px-2 py-0.5 rounded-full', changeBadge(asset.change1h)]">
                1h: {{ formatPercent(asset.change1h) }}
              </span>
              <span :class="['px-2 py-0.5 rounded-full', changeBadge(asset.change24h)]">
                24h: {{ formatPercent(asset.change24h) }}
              </span>
              <span :class="['px-2 py-0.5 rounded-full', changeBadge(asset.change7d)]">
                7d: {{ formatPercent(asset.change7d) }}
              </span>
            </div>
            <div v-if="signalChips.length" class="mt-3 flex flex-wrap justify-end gap-2 text-[10px]">
              <span v-for="chip in signalChips" :key="chip.key"
                class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
                :class="chipToneClass(chip.tone)">
                <span class="text-[9px] font-semibold tracking-[0.18em] text-slate-400">
                  {{ chip.label }}
                </span>
                <span class="text-[10px]">
                  {{ chip.value }}
                </span>
              </span>
            </div>
            <div v-if="trendScore !== null" class="mt-3 text-[10px] text-slate-300 flex flex-col items-end gap-1">
              <div class="flex items-center gap-2">
                <span class="uppercase tracking-[0.18em] text-slate-500">
                  Trend score
                </span>
                <span class="font-semibold text-emerald-300">
                  {{ trendScore }} / 100
                </span>
              </div>
              <div class="w-40 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-all"
                  :style="{ width: trendScore + '%' }" />
              </div>
            </div>


          </div>
        </div>

        <!-- Main grid -->
        <div class="grid gap-4 md:grid-cols-3">
          <!-- Chart -->
          <div class="md:col-span-2 space-y-2">
            <div class="flex items-center justify-between text-xs text-slate-400">
              <span>
                Price – {{ rangeLabel }}
              </span>
              <div class="inline-flex gap-1 rounded-full border border-white/15 bg-slate-900/70 p-0.5">
                <button v-for="opt in rangeOptions" :key="opt.value" type="button"
                  class="rounded-full px-2 py-0.5 text-[11px] transition" :class="range === opt.value
                    ? 'bg-emerald-500/20 text-emerald-200'
                    : 'text-slate-300 hover:bg-white/5'" @click="range = opt.value">
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <ClientOnly>
              <PriceChart :points="displayPoints" />
            </ClientOnly>
          </div>


          <!-- Metrics -->
          <div class="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs">
            <h2 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Metrics
            </h2>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-slate-400">Market cap</span>
                <span class="font-medium">{{ formatCompact(asset.marketCap) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Volume 24h</span>
                <span class="font-medium">{{ formatCompact(asset.volume24h) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">ATH price</span>
                <span class="font-medium">{{ formatCurrency(asset.athPrice) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">ATH date</span>
                <span class="font-medium">
                  {{ formatDate(asset.athDate) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Circulating supply</span>
                <span class="font-medium">
                  {{ formatCompact(asset.circulatingSupply) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Max supply</span>
                <span class="font-medium">
                  {{ asset.maxSupply ? formatCompact(asset.maxSupply) : '—' }}
                </span>
              </div>
            </div>

            <div class="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-slate-200">
              <div class="mb-1 font-semibold text-emerald-300">
                Simple radar
              </div>

              <div v-if="radarMetrics" class="space-y-0.5">
                <div>
                  •
                  <span class="text-slate-300">
                    Trend regime:
                  </span>
                  <span :class="toneTextClass(radarMetrics.trendTone)">
                    {{ radarMetrics.trendLabel }}
                  </span>
                  <span class="text-slate-400">
                    ({{ radarMetrics.change30d.toFixed(1) }}% / 30d)
                  </span>
                </div>

                <div>
                  •
                  <span class="text-slate-300">
                    Volatility:
                  </span>
                  <span :class="toneTextClass(radarMetrics.volatilityTone)">
                    {{ radarMetrics.volatilityLabel }}
                  </span>
                  <span class="text-slate-400">
                    (σ {{ radarMetrics.volatilityStd.toFixed(1) }}% / day)
                  </span>
                </div>

                <div>
                  •
                  <span class="text-slate-300">
                    Liquidity (vol/mcap):
                  </span>
                  <span :class="toneTextClass(radarMetrics.liquidityTone)">
                    {{ radarMetrics.liquidityLabel }}
                  </span>
                  <span class="text-slate-400">
                    ({{ radarMetrics.liquidityRatio.toFixed(1) }}%)
                  </span>
                </div>

                <div>
                  •
                  <span class="text-slate-300">
                    Drawdown from ATH:
                  </span>
                  <span :class="toneTextClass(radarMetrics.drawdownTone)">
                    {{ radarMetrics.drawdownLabel }}
                  </span>
                  <span class="text-slate-400">
                    ({{ radarMetrics.drawdownPct.toFixed(1) }}%)
                  </span>
                </div>
                <div v-if="trendWindows.length" class="mt-2 text-[10px] text-slate-300">
                  <div class="mb-1 flex items-center justify-between">
                    <span class="uppercase tracking-[0.16em] text-slate-500">
                      Multi-range trend
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <div v-for="w in trendWindows" :key="w.label"
                      class="flex flex-col items-center rounded-lg border px-2 py-1 min-w-[56px]"
                      :class="chipToneClass(w.tone)">
                      <span class="text-[9px] font-semibold tracking-[0.18em] text-slate-400">
                        {{ w.label }}
                      </span>
                      <span class="text-[10px]">
                        {{ formatPercent(w.change) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="volatilityScore !== null" class="mt-2 text-[10px] text-slate-300">
                  <div class="flex items-center justify-between mb-1">
                    <span class="uppercase tracking-[0.16em] text-slate-500">
                      Volatility score
                    </span>
                    <span class="font-semibold">
                      {{ volatilityScore }} / 100
                    </span>
                  </div>
                  <div class="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-emerald-300 via-amber-400 to-red-500 transition-all"
                      :style="{ width: volatilityScore + '%' }" />
                  </div>
                </div>

              </div>

              <div v-else class="text-slate-400">
                Not enough history to compute radar metrics.
              </div>
            </div>

            <!-- Alerts for this asset -->
            <div class="mt-3 space-y-2 rounded-2xl border border-white/10 bg-slate-900/80 p-3">
              <h3 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Price alerts
              </h3>

              <!-- Form -->
              <div class="space-y-2 text-[11px]">
                <div class="flex gap-2 items-center">
                  <select v-model="newAlertType"
                    class="rounded-lg border border-white/15 bg-slate-950/80 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400/70">
                    <option value="price_above">Price ≥ threshold</option>
                    <option value="price_below">Price ≤ threshold</option>
                  </select>
                  <input v-model.number="newAlertThreshold" type="number"
                    class="w-24 rounded-lg border border-white/15 bg-slate-950/80 px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-400/70"
                    placeholder="Price" />
                  <button type="button"
                    class="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/20"
                    @click="handleCreateAlert">
                    Add
                  </button>
                </div>
                <div v-if="alertMessage" class="text-[10px] text-slate-400">
                  {{ alertMessage }}
                </div>
              </div>

              <!-- List -->
              <div class="mt-2 text-[11px] text-slate-200">
                <div v-if="assetAlerts.length === 0" class="text-slate-500">
                  No alerts defined for this asset yet.
                </div>
                <ul v-else class="space-y-1">
                  <li v-for="a in assetAlerts" :key="a.id" class="flex items-center justify-between gap-2">
                    <div class="flex flex-col">
                      <span>
                        {{ describeAlert(a) }}
                      </span>
                      <span class="text-[10px] text-slate-500">
                        Created {{ new Date(a.createdAt).toLocaleString() }}
                        <span v-if="a.lastTriggeredAt">
                          · Last triggered
                          {{ new Date(a.lastTriggeredAt).toLocaleString() }}
                        </span>
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button type="button" class="text-[10px] rounded-full border px-2 py-0.5" :class="a.active
                        ? 'border-emerald-500/60 text-emerald-200'
                        : 'border-slate-500/60 text-slate-300'" @click="toggleAlertActive(a.id)">
                        {{ a.active ? 'On' : 'Off' }}
                      </button>
                      <button type="button"
                        class="text-[10px] rounded-full border border-red-500/60 px-2 py-0.5 text-red-300 hover:bg-red-500/10"
                        @click="deleteAlert(a.id)">
                        ✕
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PriceChart from '~/components/charts/PriceChart.vue'
import type { Alert, AlertType } from '~/composables/useAlerts'


type PricePoint = {
  time: number
  value: number
}

type AssetDetail = {
  id: string
  name: string
  symbol: string
  rank: number
  price: number
  volume24h: number
  marketCap: number
  change1h: number
  change24h: number
  change7d: number
  athPrice: number
  athDate: string
  circulatingSupply: number
  maxSupply: number | null
  history: PricePoint[]
}

type TrendWindow = {
  label: string
  days: number
  change: number
  tone: Tone
}


const route = useRoute()
const id = computed(() => String(route.params.id))

const { data, pending, error } = await useFetch<AssetDetail>(`/api/assets/${id.value}`)

const asset = computed(() => data.value ?? null)

type RangeValue = '7D' | '1M' | '3M' | '6M'

const range = ref<RangeValue>('3M')

const rangeOptions: { value: RangeValue; label: string }[] = [
  { value: '7D', label: '7D' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' }
]

const rangeLabel = computed(() => {
  switch (range.value) {
    case '7D':
      return 'last 7 days'
    case '1M':
      return 'last 30 days'
    case '3M':
      return 'last 90 days'
    case '6M':
      return 'last 180 days'
  }
})

type Tone = 'positive' | 'neutral' | 'negative'

type SignalChip = {
  key: string
  label: string
  value: string
  tone: Tone
}

type RadarMetrics = {
  trendLabel: string
  trendTone: Tone
  change30d: number
  volatilityLabel: string
  volatilityTone: Tone
  volatilityStd: number
  liquidityLabel: string
  liquidityTone: Tone
  liquidityRatio: number
  drawdownLabel: string
  drawdownTone: Tone
  drawdownPct: number
}

const { alerts, createAlert, deleteAlert, toggleAlertActive, evaluateForAsset } = useAlerts()

// Alerts scoped to this asset
const assetAlerts = computed<Alert[]>(() => {
  if (!asset.value) return []
  return alerts.value.filter((a) => a.assetId === asset.value.id)
})

// Simple alert form (por ahora solo price_above / price_below)
const newAlertType = ref<AlertType>('price_above')
const newAlertThreshold = ref<number | null>(null)
const alertMessage = ref<string | null>(null)
const triggeredAlerts = ref<Alert[]>([])

watch(
  asset,
  (a) => {
    if (!a) return
    if (newAlertThreshold.value == null) {
      newAlertThreshold.value = Math.round(a.price)
    }

    // Evaluar alertas para este asset al cargar / cambiar
    triggeredAlerts.value = evaluateForAsset({
      id: a.id,
      symbol: a.symbol,
      price: a.price,
      change24h: a.change24h
    })
  },
  { immediate: true }
)

const handleCreateAlert = () => {
  if (!asset.value || newAlertThreshold.value == null) return

  const threshold = Number(newAlertThreshold.value)
  if (Number.isNaN(threshold) || threshold <= 0) {
    alertMessage.value = 'Please enter a valid threshold.'
    return
  }

  createAlert({
    assetId: asset.value.id,
    assetSymbol: asset.value.symbol,
    type: newAlertType.value,
    threshold
  })

  alertMessage.value = 'Alert created.'
}

const describeAlert = (a: Alert) => {
  const base = `${a.assetSymbol}: `
  switch (a.type) {
    case 'price_above':
      return base + `price ≥ ${formatCurrency(a.threshold)}`
    case 'price_below':
      return base + `price ≤ ${formatCurrency(a.threshold)}`
    case 'change24h_above':
      return base + `24h change ≥ ${a.threshold}%`
    case 'change24h_below':
      return base + `24h change ≤ ${a.threshold}%`
    default:
      return base + 'alert triggered'
  }
}



// --- Radar metrics (trend, volatility, liquidity, drawdown) ---

const radarMetrics = computed<RadarMetrics | null>(() => {
  const a = asset.value
  if (!a || !a.history || !a.history.length) return null

  const history = a.history
  const lastPrice = history[history.length - 1].value

  // helper: cambio porcentual aproximado en N días (1 punto / día)
  const pctChangeOverDays = (days: number) => {
    if (history.length < 2) return 0
    const idx = Math.max(0, history.length - 1 - days)
    const base = history[idx].value
    if (!base) return 0
    return ((lastPrice - base) / base) * 100
  }

  const change30d = pctChangeOverDays(30)

  // Tendencia
  let trendLabel = 'Sideways'
  let trendTone: Tone = 'neutral'
  if (change30d > 20) {
    trendLabel = 'Strong uptrend'
    trendTone = 'positive'
  } else if (change30d > 5) {
    trendLabel = 'Uptrend'
    trendTone = 'positive'
  } else if (change30d < -20) {
    trendLabel = 'Strong downtrend'
    trendTone = 'negative'
  } else if (change30d < -5) {
    trendLabel = 'Downtrend'
    trendTone = 'negative'
  }

  // Volatilidad: desviación estándar de los últimos 30 retornos diarios
  const window = Math.min(30, history.length - 1)
  const returns: number[] = []
  const startIdx = history.length - window
  for (let i = startIdx; i < history.length; i++) {
    const prev = history[i - 1].value
    const cur = history[i].value
    if (prev) {
      const r = ((cur - prev) / prev) * 100
      returns.push(r)
    }
  }

  let volatilityStd = 0
  if (returns.length > 1) {
    const mean = returns.reduce((s, x) => s + x, 0) / returns.length
    const variance =
      returns.reduce((s, x) => s + Math.pow(x - mean, 2), 0) /
      (returns.length - 1)
    volatilityStd = Math.sqrt(variance)
  }

  let volatilityLabel = 'Normal volatility'
  let volatilityTone: Tone = 'neutral'
  if (volatilityStd > 8) {
    volatilityLabel = 'Very high volatility'
    volatilityTone = 'negative'
  } else if (volatilityStd > 4) {
    volatilityLabel = 'High volatility'
    volatilityTone = 'neutral'
  } else if (volatilityStd < 2) {
    volatilityLabel = 'Low volatility'
    volatilityTone = 'neutral'
  }

  // Liquidez: volumen / market cap
  let liquidityRatio = 0
  if (a.marketCap > 0) {
    liquidityRatio = (a.volume24h / a.marketCap) * 100
  }

  let liquidityLabel = 'Normal liquidity'
  let liquidityTone: Tone = 'neutral'
  if (liquidityRatio > 20) {
    liquidityLabel = 'Very high liquidity'
    liquidityTone = 'positive'
  } else if (liquidityRatio > 10) {
    liquidityLabel = 'High liquidity'
    liquidityTone = 'positive'
  } else if (liquidityRatio < 2) {
    liquidityLabel = 'Thin liquidity'
    liquidityTone = 'negative'
  }

  // Drawdown desde ATH
  let drawdownPct = 0
  if (a.athPrice > 0) {
    drawdownPct = ((a.price / a.athPrice) - 1) * 100
  }
  const ddAbs = Math.abs(drawdownPct)

  let drawdownLabel = 'Moderate drawdown'
  let drawdownTone: Tone = 'neutral'
  if (ddAbs < 10) {
    drawdownLabel = 'Near ATH'
    drawdownTone = 'positive'
  } else if (ddAbs > 50) {
    drawdownLabel = 'Deep discount from ATH'
    drawdownTone = 'neutral'
  }

  return {
    trendLabel,
    trendTone,
    change30d,
    volatilityLabel,
    volatilityTone,
    volatilityStd,
    liquidityLabel,
    liquidityTone,
    liquidityRatio,
    drawdownLabel,
    drawdownTone,
    drawdownPct
  }
})

// Chips para debajo del precio
const signalChips = computed<SignalChip[]>(() => {
  const m = radarMetrics.value
  if (!m) return []

  return [
    {
      key: 'trend',
      label: 'TREND',
      value: `${m.trendLabel} (${m.change30d.toFixed(1)}% / 30d)`,
      tone: m.trendTone
    },
    {
      key: 'volatility',
      label: 'VOLATILITY',
      value: `${m.volatilityLabel} (${m.volatilityStd.toFixed(1)}% / day)`,
      tone: m.volatilityTone
    },
    {
      key: 'liquidity',
      label: 'LIQUIDITY',
      value: `${m.liquidityLabel} (${m.liquidityRatio.toFixed(1)}% vol/mcap)`,
      tone: m.liquidityTone
    },
    {
      key: 'drawdown',
      label: 'DRAWDOWN',
      value: `${m.drawdownLabel} (${m.drawdownPct.toFixed(1)}% from ATH)`,
      tone: m.drawdownTone
    }
  ]
})

// Multi-range trend: 7D / 30D / 90D
const trendWindows = computed<TrendWindow[]>(() => {
  const a = asset.value
  if (!a || !a.history || !a.history.length) return []

  const history = a.history
  const last = history[history.length - 1].value
  if (!last) return []

  const computeChange = (days: number) => {
    if (history.length <= 1) return 0

    // si no hay suficientes días, usamos el primer punto como base
    const idx = history.length > days ? history.length - 1 - days : 0
    const base = history[idx].value
    if (!base) return 0
    return ((last - base) / base) * 100
  }

  const raw: { label: string; days: number }[] = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 }
  ]

  return raw.map((w) => {
    const change = computeChange(w.days)

    let tone: Tone = 'neutral'
    if (change > 5) tone = 'positive'
    else if (change < -5) tone = 'negative'

    return {
      label: w.label,
      days: w.days,
      change,
      tone
    }
  })
})


const chipToneClass = (tone: Tone) => {
  if (tone === 'positive') {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
  }
  if (tone === 'negative') {
    return 'border-red-500/40 bg-red-500/10 text-red-200'
  }
  return 'border-slate-500/40 bg-slate-800/60 text-slate-200'
}

const toneTextClass = (tone: Tone) => {
  if (tone === 'positive') return 'text-emerald-300'
  if (tone === 'negative') return 'text-red-300'
  return 'text-slate-200'
}

// --- Trend score 0–100 (basado en 30d, 7d y 1h) ---

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

const trendScoreRaw = computed<number | null>(() => {
  const a = asset.value
  const m = radarMetrics.value
  if (!a || !m) return null

  // 1) Componente principal: cambio 30 días (capado a [-30, 30]) -> 0..70 puntos
  const c30 = clamp(m.change30d, -30, 30)
  let score = ((c30 + 30) / 60) * 70 // -30 => 0, +30 => 70

  // 2) Ajuste por 7 días (capado a [-15, 15]) -> -20..+20 puntos
  const c7 = clamp(a.change7d, -15, 15)
  score += (c7 / 15) * 20

  // 3) Ajuste por 1h (capado a [-3, 3]) -> -10..+10 puntos
  const c1h = clamp(a.change1h, -3, 3)
  score += (c1h / 3) * 10

  // Clamp final a [0, 100]
  return clamp(score, 0, 100)
})

const trendScore = computed<number | null>(() => {
  if (trendScoreRaw.value == null) return null
  return Math.round(trendScoreRaw.value)
})

// Volatility score 0–100 basado en sigma (σ) diaria
// Idea: 0% ⇒ 0, 10% ⇒ 100 (cualquier cosa >10% se clampa a 100)
const volatilityScoreRaw = computed<number | null>(() => {
  const m = radarMetrics.value
  if (!m) return null

  // σ diaria capada a [0, 10]
  const sigma = clamp(m.volatilityStd, 0, 10)
  return (sigma / 10) * 100
})

const volatilityScore = computed<number | null>(() => {
  if (volatilityScoreRaw.value == null) return null
  return Math.round(volatilityScoreRaw.value)
})


const displayPoints = computed<PricePoint[]>(() => {
  if (!asset.value) return []

  const all = asset.value.history ?? []
  if (!all.length) return []

  const daysMap: Record<RangeValue, number> = {
    '7D': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180
  }

  const days = daysMap[range.value]
  if (all.length <= days) {
    return all
  }
  // devolvemos los últimos "days" puntos
  return all.slice(all.length - days)
})

const errorMessage = computed(() => {
  if (!error.value) return ''
  return typeof error.value === 'string' ? error.value : 'Failed to load asset.'
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value)

const formatPercent = (value: number) =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}%`

const formatCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
}

const changeClass = (v: number) => {
  if (v > 0) return 'text-emerald-300'
  if (v < 0) return 'text-red-300'
  return 'text-slate-300'
}

const changeBadge = (v: number) => {
  if (v > 0) return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
  if (v < 0) return 'bg-red-500/10 text-red-300 border border-red-500/30'
  return 'bg-slate-700/60 text-slate-200 border border-slate-600'
}

const volumeToMcRatio = (a: AssetDetail) => {
  if (!a.marketCap) return 0
  return (a.volume24h / a.marketCap) * 100
}
</script>
