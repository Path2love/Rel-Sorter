/**
 * In-memory Interaction Credit System
 *
 * Tracks per-user AI usage with a configurable max credit limit.
 * Uses IP-based identification. Designed to be swapped for
 * Redis/Upstash for persistent, multi-instance tracking.
 *
 * Architecture for future scaling:
 * - Replace the in-memory Map with Upstash Redis (INCR + EXPIRE)
 * - Add per-client config via a database lookup
 * - Expose /api/usage endpoint for admin dashboards
 */

const MAX_CREDITS = 50
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

interface UserUsage {
  count: number
  windowStart: number
}

const usageMap = new Map<string, UserUsage>()

export interface UsageResult {
  allowed: boolean
  remaining: number
  used: number
  limit: number
  resetsAt: number
}

function getOrCreate(userId: string): UserUsage {
  const now = Date.now()
  const existing = usageMap.get(userId)

  if (existing && now - existing.windowStart < WINDOW_MS) {
    return existing
  }

  // New window
  const fresh: UserUsage = { count: 0, windowStart: now }
  usageMap.set(userId, fresh)
  return fresh
}

export function checkUsage(userId: string): UsageResult {
  const usage = getOrCreate(userId)
  return {
    allowed: usage.count < MAX_CREDITS,
    remaining: Math.max(0, MAX_CREDITS - usage.count),
    used: usage.count,
    limit: MAX_CREDITS,
    resetsAt: usage.windowStart + WINDOW_MS,
  }
}

export function consumeCredit(userId: string): UsageResult {
  const usage = getOrCreate(userId)
  usage.count += 1
  usageMap.set(userId, usage)
  return {
    allowed: usage.count <= MAX_CREDITS,
    remaining: Math.max(0, MAX_CREDITS - usage.count),
    used: usage.count,
    limit: MAX_CREDITS,
    resetsAt: usage.windowStart + WINDOW_MS,
  }
}
