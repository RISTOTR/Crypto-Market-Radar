<template>
  <div class="h-64 w-full rounded-xl border border-white/10 bg-slate-900/60">
    <div ref="chartEl" class="h-full w-full" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

type PricePoint = {
  time: number
  value: number
}

const props = defineProps<{
  points: PricePoint[]
}>()

const chartEl = ref<HTMLDivElement | null>(null)
let chart: any = null
let series: any = null

const buildData = (points: PricePoint[]) =>
  points.map((p) => ({ time: p.time, value: p.value }))

onMounted(async () => {
  if (!chartEl.value) return

  const mod = await import('lightweight-charts')
  const createChart = (mod as any).createChart || (mod as any).default?.createChart
  const AreaSeries = (mod as any).AreaSeries || (mod as any).default?.AreaSeries
  const LineSeries = (mod as any).LineSeries || (mod as any).default?.LineSeries

  if (!createChart) {
    console.error('Could not find createChart export in lightweight-charts', mod)
    return
  }

  chart = createChart(chartEl.value, {
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: '#e5e7eb'
    },
    grid: {
      vertLines: { color: 'rgba(148, 163, 184, 0.12)' },
      horzLines: { color: 'rgba(148, 163, 184, 0.12)' }
    },
    timeScale: {
      borderColor: 'rgba(148, 163, 184, 0.4)'
    },
    rightPriceScale: {
      borderColor: 'rgba(148, 163, 184, 0.4)'
    }
  })

  // Use new API for v5+
  try {
    if (AreaSeries) {
      series = chart.addSeries(AreaSeries, {
        lineWidth: 2,
        topColor: 'rgba(45, 212, 191, 0.35)',
        bottomColor: 'rgba(15, 23, 42, 0.1)'
      })
    } else {
      throw new Error('AreaSeries not found')
    }
  } catch (e) {
    console.warn('addSeries(AreaSeries) failed, falling back to LineSeries', e)
  }

  if (!series) {
    try {
      if (LineSeries) {
        series = chart.addSeries(LineSeries, {
          lineWidth: 2,
          color: 'rgba(45, 212, 191, 1)'
        })
      } else {
        console.error('LineSeries not found in exports')
      }
    } catch (e) {
      console.error('addSeries(LineSeries) also failed, aborting chart', e)
      return
    }
  }

  if (props.points?.length) {
    series.setData(buildData(props.points))
    chart.timeScale().fitContent()
  }
})

watch(
  () => props.points,
  (newPoints) => {
    if (!chart || !series) return
    if (!newPoints || !newPoints.length) return
    series.setData(buildData(newPoints))
    chart.timeScale().fitContent()
  }
)

onBeforeUnmount(() => {
  if (chart) {
    chart.remove()
    chart = null
    series = null
  }
})
</script>
