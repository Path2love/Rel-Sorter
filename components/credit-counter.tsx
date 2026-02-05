"use client"

import { useCallback, useEffect, useState } from "react"

interface UsageData {
  remaining: number
  used: number
  limit: number
}

export function CreditCounter({
  lastUsage,
}: {
  lastUsage: UsageData | null
}) {
  const [usage, setUsage] = useState<UsageData | null>(null)

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage")
      const data = await res.json()
      setUsage({ remaining: data.remaining, used: data.used, limit: data.limit })
    } catch {
      // Silently fail -- counter just won't update
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  // Update from API response data passed from parent
  useEffect(() => {
    if (lastUsage) {
      setUsage(lastUsage)
    }
  }, [lastUsage])

  if (!usage) return null

  const pct = (usage.remaining / usage.limit) * 100
  const isLow = usage.remaining <= 10
  const isDepleted = usage.remaining <= 0

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
        <div className="relative h-2 w-20 overflow-hidden rounded-full bg-muted">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
              isDepleted
                ? "bg-destructive"
                : isLow
                  ? "bg-amber-500"
                  : "bg-navy"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`text-xs font-bold tabular-nums ${
            isDepleted
              ? "text-destructive"
              : isLow
                ? "text-amber-600"
                : "text-muted-foreground"
          }`}
        >
          {usage.remaining}/{usage.limit}
        </span>
        <span className="text-[10px] text-muted-foreground">credits</span>
      </div>
    </div>
  )
}
