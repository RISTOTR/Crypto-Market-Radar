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
      <button
        v-for="opt in rangeOptions"
        :key="opt.value"
        type="button"
        class="rounded-full px-2 py-0.5 text-[11px] transition"
        :class="range === opt.value
          ? 'bg-emerald-500/20 text-emerald-200'
          : 'text-slate-300 hover:bg-white/5'"
        @click="range = opt.value"
      >
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
              <ul class="space-y-0.5">
                <li>
                  •
                  <span class="text-slate-300">
                    Short-term momentum:
                  </span>
                  <span :class="changeClass(asset.change24h)">
                    {{ formatPercent(asset.change24h) }} (24h)
                  </span>
                </li>
                <li>
                  •
                  <span class="text-slate-300">
                    Weekly momentum:
                  </span>
                  <span :class="changeClass(asset.change7d)">
                    {{ formatPercent(asset.change7d) }} (7d)
                  </span>
                </li>
                <li>
                  •
                  <span class="text-slate-300">
                    Volume vs market cap:
                  </span>
                  <span class="text-slate-100">
                    {{ volumeToMcRatio(asset).toFixed(2) }}%
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import PriceChart from '~/components/charts/PriceChart.vue'

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
