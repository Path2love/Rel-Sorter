"use client"

import React from "react"

import { useState } from "react"

interface TraitPoolProps {
  traits: string[]
  activeTrait: string | null
  onSelect: (trait: string) => void
  onAdd: (trait: string) => void
}

export function TraitPool({ traits, activeTrait, onSelect, onAdd }: TraitPoolProps) {
  const [newTrait, setNewTrait] = useState("")

  function handleAdd() {
    const trimmed = newTrait.trim()
    if (trimmed) {
      onAdd(trimmed)
      setNewTrait("")
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-navy">
        Trait Pool
      </h3>

      <div className="mb-6 flex flex-col gap-2">
        <input
          type="text"
          value={newTrait}
          onChange={(e) => setNewTrait(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/10"
          placeholder="Add custom trait..."
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-xl bg-navy py-3 text-xs font-black uppercase text-primary-foreground transition-colors hover:bg-burgundy"
        >
          Add Trait +
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-2" style={{ maxHeight: 600 }}>
        {traits.map((trait) => (
          <button
            key={trait}
            type="button"
            onClick={() => onSelect(trait)}
            className={`w-full rounded-xl border p-3.5 text-left text-[11px] font-bold uppercase tracking-tight shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              activeTrait === trait
                ? "border-burgundy bg-burgundy/10 text-burgundy"
                : "border-border bg-card text-navy"
            }`}
          >
            {trait}
          </button>
        ))}
        {traits.length === 0 && (
          <p className="py-8 text-center text-xs italic text-muted-foreground">
            All traits have been sorted.
          </p>
        )}
      </div>
    </div>
  )
}
