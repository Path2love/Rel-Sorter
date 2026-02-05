"use client"

import { useState } from "react"
import { useBlueprintStore } from "@/lib/use-blueprint-store"
import { LogicDefinitions } from "@/components/logic-definitions"
import { TraitPool } from "@/components/trait-pool"
import { DecisionLab } from "@/components/decision-lab"
import { BlueprintSummary } from "@/components/blueprint-summary"
import { VettingLab } from "@/components/vetting-lab"
import { CreditCounter } from "@/components/credit-counter"

export default function Page() {
  const {
    unsortedTraits,
    blueprint,
    activeTrait,
    setActiveTrait,
    addTrait,
    placeTrait,
    removeTrait,
  } = useBlueprintStore()

  const [lastUsage, setLastUsage] = useState<{
    remaining: number
    used: number
    limit: number
  } | null>(null)

  return (
    <main className="p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-balance text-4xl font-black uppercase tracking-tight text-burgundy">
            Relational Blueprint Architect
          </h1>
          <p className="mt-2 font-medium text-muted-foreground">
            Engineer your non-negotiables before you date.
          </p>
          <div className="mt-4 flex justify-center">
            <CreditCounter lastUsage={lastUsage} />
          </div>
        </header>

        <LogicDefinitions />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <TraitPool
              traits={unsortedTraits}
              activeTrait={activeTrait}
              onSelect={setActiveTrait}
              onAdd={addTrait}
            />
          </div>

          <div className="lg:col-span-9">
            <DecisionLab
              activeTrait={activeTrait}
              onClose={() => setActiveTrait(null)}
              onPlace={placeTrait}
              onUsageUpdate={setLastUsage}
            />
          </div>
        </div>

        <BlueprintSummary blueprint={blueprint} onRemove={removeTrait} />

        <VettingLab blueprint={blueprint} onUsageUpdate={setLastUsage} />
      </div>
    </main>
  )
}
