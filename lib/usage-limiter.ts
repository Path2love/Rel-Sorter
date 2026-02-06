/**
 * Persistent Interaction Credit System
 *
 * Tracks per-user AI usage with a configurable max credit limit.
 * Uses a local file for persistence across restarts.
 *
 * Architecture for future scaling:
 * - Replace the file store with Upstash Redis (INCR)
 * - Add per-client config via a database lookup
 * - Expose /api/usage endpoint for admin dashboards
 */

import { promises as fs } from "fs"
import path from "path"

const MAX_CREDITS = 100
const STORE_DIR = path.join(process.cwd(), ".data")
const STORE_PATH = path.join(STORE_DIR, "usage.json")

interface UserUsage {
  count: number
}

export interface UsageResult {
  allowed: boolean
  remaining: number
  used: number
  limit: number
  resetsAt: number
}

async function readStore(): Promise<Record<string, UserUsage>> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8")
    const parsed = JSON.parse(raw) as Record<string, UserUsage>
    if (!parsed || typeof parsed !== "object") return {}
    return parsed
  } catch {
    return {}
  }
}

async function writeStore(store: Record<string, UserUsage>) {
  await fs.mkdir(STORE_DIR, { recursive: true })
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8")
}

function getUsage(store: Record<string, UserUsage>, userId: string): UserUsage {
  return store[userId] ?? { count: 0 }
}

export async function checkUsage(userId: string): Promise<UsageResult> {
  const store = await readStore()
  const usage = getUsage(store, userId)
  return {
    allowed: usage.count < MAX_CREDITS,
    remaining: Math.max(0, MAX_CREDITS - usage.count),
    used: usage.count,
    limit: MAX_CREDITS,
    resetsAt: 0,
  }
}

export async function consumeCredit(userId: string): Promise<UsageResult> {
  const store = await readStore()
  const usage = getUsage(store, userId)
  usage.count += 1
  store[userId] = usage
  await writeStore(store)
  return {
    allowed: usage.count <= MAX_CREDITS,
    remaining: Math.max(0, MAX_CREDITS - usage.count),
    used: usage.count,
    limit: MAX_CREDITS,
    resetsAt: 0,
  }
}
