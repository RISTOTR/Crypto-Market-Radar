// server/api/assets/sparkline.get.ts
import { defineEventHandler, getQuery } from 'h3'

type RawHistoricalRow = {
  timestamp: string // ISO
  price: number
}

export type SparkPoint = {
  time: number
  value: number
}

export type Sparkline = {
  id: string
  points: SparkPoint[]
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const idsParam = String(query.ids || '')
  const days = Number(query.days ?? 30)

  const ids = idsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (ids.length === 0) {
    return []
  }

  const now = new Date()
  const start = new Date()
  start.setDate(now.getDate() - days)

  const startStr = start.toISOString().slice(0, 10)
  const endStr = now.toISOString().slice(0, 10)

  const results: Sparkline[] = []

  // En un proyecto real haríamos caching y quizás limitaríamos n_assets.
  await Promise.all(
    ids.map(async (id) => {
      try {
        const historyRaw = await $fetch<RawHistoricalRow[]>(
          `https://api.coinpaprika.com/v1/tickers/${id}/historical`,
          {
            params: {
              start: startStr,
              end: endStr,
              interval: '1d',
              limit: days
            }
          }
        )

        const points: SparkPoint[] = (historyRaw || []).map((row) => ({
          time: Math.floor(new Date(row.timestamp).getTime() / 1000),
          value: row.price
        }))

        results.push({ id, points })
      } catch (e) {
        console.error('Failed to fetch sparkline for', id, e)
      }
    })
  )

  return results
})
