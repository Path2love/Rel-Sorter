"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "rba-client-id"

export function useClientId() {
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    try {
      let stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        stored = crypto.randomUUID()
        localStorage.setItem(STORAGE_KEY, stored)
      }
      setClientId(stored)
    } catch {
      setClientId(null)
    }
  }, [])

  return clientId
}
