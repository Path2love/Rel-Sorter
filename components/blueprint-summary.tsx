"use client"

import type { Blueprint, BlueprintCategory } from "@/lib/blueprint-data"

const COLUMNS: { key: BlueprintCategory; label: string; borderColor: string; textColor: string }[] = [
  { key: "requirements", label: "Requirements", borderColor: "border-t-red-500", textColor: "text-red-500" },
  { key: "needs", label: "Needs", borderColor: "border-t-blue-500", textColor: "text-blue-500" },
  { key: "wants", label: "Wants", borderColor: "border-t-emerald-500", textColor: "text-emerald-500" },
  { key: "dealbreakers", label: "Dealbreakers", borderColor: "border-t-slate-800", textColor: "text-slate-800" },
]

interface BlueprintSummaryProps {
  blueprint: Blueprint
  onRemove: (trait: string, category: BlueprintCategory) => void
}

export function BlueprintSummary({ blueprint, onRemove }: BlueprintSummaryProps) {
  return (
    <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-4">
      {COLUMNS.map(({ key, label, borderColor, textColor }) => (
        <div
          key={key}
          className={`min-h-[300px] rounded-3xl border border-border border-t-8 bg-card p-6 shadow-sm ${borderColor}`}
        >
          <h4 className={`mb-4 text-xs font-black uppercase tracking-widest ${textColor}`}>
            {label}
          </h4>
          <ul className="space-y-2 text-[11px] font-bold text-foreground">
            {blueprint[key].map((item) => (
              <li
                key={item}
                className="group flex items-center justify-between border-b border-border py-0.5 last:border-0"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item, key)}
                  className="px-1 font-bold text-muted-foreground opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                  aria-label={`Remove ${item} from ${label}`}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
