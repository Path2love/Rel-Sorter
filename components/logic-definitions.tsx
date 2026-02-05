import { CATEGORY_CONFIG } from "@/lib/blueprint-data"

const categories = ["requirements", "needs", "wants", "dealbreakers"] as const

export function LogicDefinitions() {
  return (
    <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-4">
      {categories.map((cat) => {
        const config = CATEGORY_CONFIG[cat]
        const isDark = cat === "dealbreakers"
        return (
          <div
            key={cat}
            className={`rounded-2xl border p-5 shadow-sm ${
              isDark
                ? "border-slate-700 bg-slate-800 text-center"
                : `${config.bgLight} ${config.borderColor}`
            }`}
          >
            <h4
              className={`mb-2 text-xs font-black uppercase ${
                isDark ? "text-primary-foreground" : config.textColor
              }`}
            >
              {config.label}
            </h4>
            <p
              className={`text-[11px] font-medium leading-tight ${
                isDark ? "text-slate-300" : config.textColor.replace("700", "800")
              }`}
            >
              {config.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
