// server/api/assets/list.get.ts
import { defineEventHandler, getQuery } from 'h3'

type RawPaprikaTicker = {
  id: string
  name: string
  symbol: string
  rank: number
  quotes: {
    USD: {
      price: number
      volume_24h: number
      market_cap: number
      percent_change_1h: number
      percent_change_24h: number
      percent_change_7d: number
    }
  }
}

export type AssetSummary = {
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
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit ?? 100)

  const tickers = (await $fetch<RawPaprikaTicker[]>(
    'https://api.coinpaprika.com/v1/tickers',
    { params: { limit } }
  )) || []

  const assets: AssetSummary[] = tickers.map((t) => {
    const usd = t.quotes.USD
    return {
      id: t.id,
      name: t.name,
      symbol: t.symbol,
      rank: t.rank,
      price: usd.price,
      volume24h: usd.volume_24h,
      marketCap: usd.market_cap,
      change1h: usd.percent_change_1h,
      change24h: usd.percent_change_24h,
      change7d: usd.percent_change_7d
    }
  })

  // ordenar por market cap desc
  assets.sort((a, b) => b.marketCap - a.marketCap)

  return assets
})
