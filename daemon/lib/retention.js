import { logger } from './logger.js'

export function retentionDays(name, fallback) {
  const raw = process.env[name]
  if (raw === undefined) return fallback

  const days = Number(raw)
  if (!raw.trim() || !Number.isFinite(days) || days < 0) {
    logger.warn({ name, value: raw, fallback }, 'retention: invalid TTL, using default')
    return fallback
  }
  return days
}
