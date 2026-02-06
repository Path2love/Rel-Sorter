"use client"

import { useState } from "react"
import type { Blueprint } from "@/lib/blueprint-data"
import { PHASE_LOGIC } from "@/lib/blueprint-data"
import { LoadingDots } from "./loading-dots"
import { useClientId } from "@/lib/use-client-id"

interface UsageData {
  remaining: number
  used: number
  limit: number
}

interface VettingLabProps {
  blueprint: Blueprint
  onUsageUpdate: (usage: UsageData) => void
}

export function VettingLab({ blueprint, onUsageUpdate }: VettingLabProps) {
  const clientId = useClientId()
  const [name, setName] = useState("")
  const [phase, setPhase] = useState("1")
  const [notes, setNotes] = useState("")
  const [phaseResults, setPhaseResults] = useState<Record<string, "pass" | "fail">>({})
  const [dealChecks, setDealChecks] = useState<Record<string, boolean>>({})
  const [reqChecks, setReqChecks] = useState<Record<string, boolean>>({})
  const [vettingText, setVettingText] = useState("")
  const [showOutput, setShowOutput] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const phaseTests = PHASE_LOGIC[phase] || []
  const phaseLabels: Record<string, string> = {
    "1": "Date 1: The Spark",
    "2": "Date 2: The Connection",
    "3": "Date 3: The Pattern",
  }

  function togglePhaseResult(testId: string, result: "pass" | "fail") {
    setPhaseResults((prev) => ({ ...prev, [testId]: result }))
  }

  async function runVetting() {
    if (!name.trim()) return

    setIsRunning(true)
    setShowOutput(true)
    setVettingText("")

    const checkedDealbreakers = Object.entries(dealChecks)
      .filter(([, v]) => v)
      .map(([k]) => k)
    const missingRequirements = Object.entries(reqChecks)
      .filter(([, v]) => !v)
      .map(([k]) => k)

    const failedTests = phaseTests
      .filter((t) => phaseResults[t.id] === "fail")
      .map((t) => t.label)
    const passedTests = phaseTests
      .filter((t) => phaseResults[t.id] === "pass")
      .map((t) => t.label)

    try {
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (clientId) headers["x-client-id"] = clientId
      const res = await fetch("/api/coach", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "vetting",
          payload: {
            name,
            phase,
            notes,
            dealbreakers: checkedDealbreakers.join(", "),
            missingRequirements: missingRequirements.join(", "),
            failedTests: failedTests.join(", "),
            passedTests: passedTests.join(", "),
          },
        }),
      })
      const data = await res.json()
      setVettingText(data.text)
      if (data.usage) onUsageUpdate(data.usage)
    } catch {
      setVettingText(
        "Error analyzing date. Remember: if your requirements are not met, you must walk away."
      )
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section className="mt-20 rounded-[40px] bg-slate-900 p-10 text-primary-foreground shadow-2xl">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-primary-foreground">
            Date Vetting Lab
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-400">
            Requirements must ALL be met or you must walk away.
          </p>
        </div>
        <button
          type="button"
          onClick={runVetting}
          disabled={isRunning || !name.trim()}
          className="rounded-full bg-burgundy px-12 py-4 text-sm font-black uppercase text-primary-foreground shadow-xl transition-all hover:scale-105 disabled:opacity-50"
        >
          {isRunning ? <LoadingDots text="Auditing" /> : "Run Vetting Audit"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Column 1: Date info */}
        <div className="space-y-6 lg:col-span-1">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border-none bg-slate-800 p-5 text-sm text-primary-foreground focus:ring-2 focus:ring-burgundy"
              placeholder="Who did you meet?"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              Date Phase
            </label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="w-full rounded-2xl border-none bg-slate-800 p-5 text-sm text-primary-foreground focus:ring-2 focus:ring-burgundy"
            >
              {Object.entries(phaseLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
              General Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-40 w-full rounded-2xl border-none bg-slate-800 p-5 text-sm text-primary-foreground focus:ring-2 focus:ring-burgundy"
              placeholder="Additional observations..."
            />
          </div>
        </div>

        {/* Column 2: Phase-Specific Tests */}
        <div className="rounded-[32px] border border-slate-700/50 bg-slate-800/50 p-8 lg:col-span-1">
          <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">
            Phase-Specific Tests
          </h3>
          <div className="space-y-6">
            {phaseTests.map((test) => (
              <div key={test.id} className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-300">
                  {test.label}
                </p>
                <p className="text-[11px] italic text-slate-400">{test.q}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => togglePhaseResult(test.id, "pass")}
                    className={`flex-1 rounded-lg border py-2 text-[10px] font-bold text-primary-foreground ${
                      phaseResults[test.id] === "pass"
                        ? "border-burgundy bg-burgundy"
                        : "border-slate-700 bg-slate-800"
                    }`}
                  >
                    Passed
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePhaseResult(test.id, "fail")}
                    className={`flex-1 rounded-lg border py-2 text-[10px] font-bold text-primary-foreground ${
                      phaseResults[test.id] === "fail"
                        ? "border-red-900 bg-red-900"
                        : "border-slate-700 bg-slate-800"
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Blueprint Match Checklist */}
        <div className="max-h-[500px] overflow-y-auto rounded-[32px] border border-slate-700/50 bg-slate-800/50 p-8 lg:col-span-1">
          <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">
            Blueprint Match
          </h3>
          <div className="space-y-5">
            {blueprint.dealbreakers.length === 0 && blueprint.requirements.length === 0 ? (
              <p className="text-[11px] italic font-medium text-slate-500">
                Build your blueprint to see your walk-away scorecard here.
              </p>
            ) : (
              <>
                {blueprint.dealbreakers.length > 0 && (
                  <>
                    <h4 className="mb-2 mt-4 text-[10px] font-black uppercase tracking-widest text-red-400">
                      Instant Walk-Away
                    </h4>
                    {blueprint.dealbreakers.map((d) => (
                      <div key={d} className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={dealChecks[d] || false}
                          onChange={(e) =>
                            setDealChecks((prev) => ({
                              ...prev,
                              [d]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 h-5 w-5 rounded border-slate-700 bg-slate-800"
                        />
                        <label className="text-[11px] text-slate-300">
                          {"Is \""}{d}{"\" present?"}
                        </label>
                      </div>
                    ))}
                  </>
                )}
                {blueprint.requirements.length > 0 && (
                  <>
                    <h4 className="mb-2 mt-8 text-[10px] font-black uppercase tracking-widest text-blue-400">
                      Absolute Requirements
                    </h4>
                    {blueprint.requirements.map((r) => (
                      <div key={r} className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={reqChecks[r] || false}
                          onChange={(e) =>
                            setReqChecks((prev) => ({
                              ...prev,
                              [r]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 h-5 w-5 rounded border-slate-700 bg-slate-800"
                        />
                        <label className="text-[11px] text-slate-300">
                          {"Was \""}{r}{"\" met?"}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vetting Output */}
      {showOutput && (
        <div className="mt-10 rounded-3xl border-l-8 border-burgundy bg-white/5 p-8">
          <p className="text-sm leading-relaxed text-slate-200">
            {isRunning ? "Auditing your data..." : vettingText}
          </p>
        </div>
      )}
    </section>
  )
}
