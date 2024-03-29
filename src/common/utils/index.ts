import { RedisClient } from "src/typings"

export async function useRedisCache<T = any>(
  redisClient: RedisClient,
  cacheKey: string,
  getData: (...rest: any[]) => Promise<T>
) {
  const hasCache = await redisClient.exists(cacheKey)
  if (hasCache) {
    const cache = await redisClient.get(cacheKey)
    try {
      const res = JSON.parse(cache) as T
      return res
    } catch (error) {
      return cache as T
    }
  }

  const data = await getData()
  if (data !== null || data !== undefined) {
    const cacheValue = (typeof data === 'object' ? JSON.stringify(data) : data) as any
    redisClient.SET(cacheKey, cacheValue)
    return data
  }
  return null
}