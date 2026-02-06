"use client"

import { useCallback, useEffect, useState } from "react"
import { DEFAULT_TRAITS, type Blueprint, type BlueprintCategory } from "./blueprint-data"

const STORAGE_KEY = "relational-blueprint-store-v1"

export function useBlueprintStore() {
  const [traits, setTraits] = useState<string[]>(DEFAULT_TRAITS)
  const [blueprint, setBlueprint] = useState<Blueprint>({
    requirements: [],
    needs: [],
    wants: [],
    dealbreakers: [],
  })
  const [activeTrait, setActiveTrait] = useState<string | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setHasLoaded(true)
        return
      }
      const parsed = JSON.parse(raw) as {
        traits?: string[]
        blueprint?: Blueprint
      }
      if (parsed?.traits && Array.isArray(parsed.traits)) {
        setTraits(parsed.traits)
      }
      if (parsed?.blueprint) {
        setBlueprint({
          requirements: parsed.blueprint.requirements ?? [],
          needs: parsed.blueprint.needs ?? [],
          wants: parsed.blueprint.wants ?? [],
          dealbreakers: parsed.blueprint.dealbreakers ?? [],
        })
      }
    } catch {
      // Ignore invalid storage
    } finally {
      setHasLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!hasLoaded) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ traits, blueprint })
      )
    } catch {
      // Ignore storage failures
    }
  }, [traits, blueprint, hasLoaded])

  const sortedTraits = Object.values(blueprint).flat()
  const unsortedTraits = traits.filter((t) => !sortedTraits.includes(t))

  const addTrait = useCallback((trait: string) => {
    setTraits((prev) => {
      if (prev.includes(trait)) return prev
      return [trait, ...prev]
    })
  }, [])

  const placeTrait = useCallback((trait: string, category: BlueprintCategory) => {
    setBlueprint((prev) => {
      // Remove from all categories first
      const cleaned: Blueprint = {
        requirements: prev.requirements.filter((t) => t !== trait),
        needs: prev.needs.filter((t) => t !== trait),
        wants: prev.wants.filter((t) => t !== trait),
        dealbreakers: prev.dealbreakers.filter((t) => t !== trait),
      }
      return { ...cleaned, [category]: [...cleaned[category], trait] }
    })
    setActiveTrait(null)
  }, [])

  const removeTrait = useCallback((trait: string, category: BlueprintCategory) => {
    setBlueprint((prev) => ({
      ...prev,
      [category]: prev[category].filter((t) => t !== trait),
    }))
  }, [])

  return {
    traits,
    unsortedTraits,
    blueprint,
    activeTrait,
    setActiveTrait,
    addTrait,
    placeTrait,
    removeTrait,
  }
}
