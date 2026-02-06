/**
 * Persistent Interaction Credit System
 *
 * Tracks per-user AI usage with a configurable max credit limit.
 * Uses Upstash Redis for serverless-compatible persistence.
 */

import { Redis } from "@upstash/redis"

const MAX_CREDITS = 100

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function redisKey(userId: string) {
  return `usage:${userId}`
}

export interface UsageResult {
  allowed: boolean
  remaining: number
  used: number
  limit: number
  resetsAt: number
}

export async function checkUsage(userId: string): Promise<UsageResult> {
  const count = (await redis.get<number>(redisKey(userId))) ?? 0
  return {
    allowed: count < MAX_CREDITS,
    remaining: Math.max(0, MAX_CREDITS - count),
    used: count,
    limit: MAX_CREDITS,
    resetsAt: 0,
  }
}

export async function consumeCredit(userId: string): Promise<UsageResult> {
  const count = await redis.incr(redisKey(userId))
  return {
    allowed: count <= MAX_CREDITS,
    remaining: Math.max(0, MAX_CREDITS - count),
    used: count,
    limit: MAX_CREDITS,
    resetsAt: 0,
  }
}
