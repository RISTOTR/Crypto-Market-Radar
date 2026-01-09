// server/api/assets/[id].get.ts
import { defineEventHandler, createError } from 'h3'

type RawPaprikaTicker = {
  id: string
  name: string
  symbol: string
  rank: number
  circulating_supply: number
  max_supply: number | null
  quotes: {
    USD: {
      price: number
      volume_24h: number
      market_cap: number
      percent_change_1h: number
      percent_change_24h: number
      percent_change_7d: number
      ath_price: number
      ath_date: string
    }
  }
}

type RawHistoricalRow = {
  timestamp: string // ISO
  price: number
}

export type PricePoint = {
  time: number // unix seconds
  value: number
}

export type AssetDetail = {
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

export default defineEventHandler<AssetDetail>(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing asset id' })
  }

  // 1) Datos actuales
  const ticker = await $fetch<RawPaprikaTicker>(
    `https://api.coinpaprika.com/v1/tickers/${id}`,
    { params: { quotes: 'USD' } }
  )

  const usd = ticker.quotes.USD

  // 2) Histórico últimos 90 días
  const now = new Date()
  const start = new Date()
  start.setDate(now.getDate() - 90)

  const startStr = start.toISOString().slice(0, 10)
  const endStr = now.toISOString().slice(0, 10)

  const historyRaw = await $fetch<RawHistoricalRow[]>(
    `https://api.coinpaprika.com/v1/tickers/${id}/historical`,
    {
      params: {
        start: startStr,
        end: endStr,
        interval: '1d',
        limit: 90
      }
    }
  )

  const history: PricePoint[] = (historyRaw || []).map((row) => ({
    time: Math.floor(new Date(row.timestamp).getTime() / 1000),
    value: row.price
  }))

  return {
    id: ticker.id,
    name: ticker.name,
    symbol: ticker.symbol,
    rank: ticker.rank,
    price: usd.price,
    volume24h: usd.volume_24h,
    marketCap: usd.market_cap,
    change1h: usd.percent_change_1h,
    change24h: usd.percent_change_24h,
    change7d: usd.percent_change_7d,
    athPrice: usd.ath_price,
    athDate: usd.ath_date,
    circulatingSupply: ticker.circulating_supply,
    maxSupply: ticker.max_supply,
    history
  }
})
