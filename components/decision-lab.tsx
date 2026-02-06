"use client"

import { useCallback, useEffect, useState } from "react"
import { X } from "lucide-react"
import type { Answers, BlueprintCategory } from "@/lib/blueprint-data"
import { LoadingDots } from "./loading-dots"
import { useClientId } from "@/lib/use-client-id"

interface UsageData {
  remaining: number
  used: number
  limit: number
}

interface DecisionLabProps {
  activeTrait: string | null
  onClose: () => void
  onPlace: (trait: string, category: BlueprintCategory) => void
  onUsageUpdate: (usage: UsageData) => void
}

export function DecisionLab({ activeTrait, onClose, onPlace, onUsageUpdate }: DecisionLabProps) {
  const clientId = useClientId()
  const [answers, setAnswers] = useState<Answers>({ work: null, issue: null })
  const [context, setContext] = useState("")
  const [followupAnswer, setFollowupAnswer] = useState("")
  const [probeText, setProbeText] = useState("")
  const [finalText, setFinalText] = useState("")
  const [isProbing, setIsProbing] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [showProbe, setShowProbe] = useState(false)
  const [showFinal, setShowFinal] = useState(false)

  const resetState = useCallback(() => {
    setAnswers({ work: null, issue: null })
    setContext("")
    setFollowupAnswer("")
    setProbeText("")
    setFinalText("")
    setShowProbe(false)
    setShowFinal(false)
    setIsProbing(false)
    setIsFinalizing(false)
  }, [])

  // Reset all local state whenever a new trait is selected
  useEffect(() => {
    resetState()
  }, [activeTrait, resetState])

  function handleClose() {
    resetState()
    onClose()
  }

  function handleAnswer(type: keyof Answers, val: boolean) {
    setAnswers((prev) => ({ ...prev, [type]: val }))
  }

  async function initiateCoaching() {
    if (answers.work === null) {
      return
    }

    setIsProbing(true)
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (clientId) headers["x-client-id"] = clientId
      const res = await fetch("/api/coach", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "probe",
          payload: {
            trait: activeTrait,
            work: answers.work,
            issue: answers.issue,
            context,
          },
        }),
      })
      const data = await res.json()
      setProbeText(data.text)
      if (data.usage) onUsageUpdate(data.usage)
      setShowProbe(true)
    } catch {
      setProbeText(
        "Unable to reach the AI coach right now. Please try again."
      )
      setShowProbe(true)
    } finally {
      setIsProbing(false)
    }
  }

  async function getFinalRecommendation() {
    setIsFinalizing(true)
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" }
      if (clientId) headers["x-client-id"] = clientId
      const res = await fetch("/api/coach", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "final",
          payload: {
            trait: activeTrait,
            response: followupAnswer,
          },
        }),
      })
      const data = await res.json()
      setFinalText(data.text)
      if (data.usage) onUsageUpdate(data.usage)
      setShowFinal(true)
    } catch {
      setFinalText("Unable to reach the AI coach right now. Please try again.")
      setShowFinal(true)
    } finally {
      setIsFinalizing(false)
    }
  }

  function handlePlace(category: BlueprintCategory) {
    if (activeTrait) {
      onPlace(activeTrait, category)
      resetState()
    }
  }

  if (!activeTrait) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card p-12 text-center">
        <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
          Select a trait to analyze
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm italic text-muted-foreground">
          Challenge the logic. Is this truly a non-negotiable?
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-border border-t-8 border-t-burgundy bg-card p-8 shadow-xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-burgundy">
            Decision Lab
          </span>
          <h2 className="mt-1 text-3xl font-black text-navy">{activeTrait}</h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 text-muted-foreground transition-colors hover:text-burgundy"
          aria-label="Close decision lab"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-8">
        {/* Step 1: Solvability Test */}
        <div>
          <p className="mb-1 text-sm font-black text-navy">1. The Solvability Test</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Could a relationship work for you if this trait were missing?
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAnswer("work", true)}
              className={`flex-1 rounded-xl border-2 px-4 py-4 text-xs font-bold transition-all ${
                answers.work === true
                  ? "border-burgundy bg-burgundy/10 font-extrabold text-burgundy shadow-inner"
                  : "border-border bg-muted text-foreground hover:border-burgundy"
              }`}
            >
              Yes, I could stay
            </button>
            <button
              type="button"
              onClick={() => handleAnswer("work", false)}
              className={`flex-1 rounded-xl border-2 px-4 py-4 text-sm font-bold transition-all ${
                answers.work === false
                  ? "border-burgundy bg-burgundy/10 font-extrabold text-burgundy shadow-inner"
                  : "border-border bg-muted text-foreground hover:border-burgundy"
              }`}
            >
              {"No, I'd have to leave"}
            </button>
          </div>
        </div>

        {/* Step 2: Frequency Test */}
        <div
          className={`transition-all duration-300 ${
            answers.work === null ? "pointer-events-none opacity-25" : "opacity-100"
          }`}
        >
          <p className="mb-1 text-sm font-black text-navy">2. The Frequency Test</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Would you experience a painful issue every single time this trait is absent?
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAnswer("issue", true)}
              className={`flex-1 rounded-xl border-2 px-4 py-4 text-sm font-bold transition-all ${
                answers.issue === true
                  ? "border-navy bg-navy/10 font-extrabold text-navy shadow-inner"
                  : "border-border bg-muted text-foreground hover:border-navy"
              }`}
            >
              Yes, every time
            </button>
            <button
              type="button"
              onClick={() => handleAnswer("issue", false)}
              className={`flex-1 rounded-xl border-2 px-4 py-4 text-sm font-bold transition-all ${
                answers.issue === false
                  ? "border-navy bg-navy/10 font-extrabold text-navy shadow-inner"
                  : "border-border bg-muted text-foreground hover:border-navy"
              }`}
            >
              No, I can substitute it
            </button>
          </div>
        </div>

        {/* Reasoning */}
        <div className="pt-4">
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-navy">
            {"Your reasoning (The \"Why\")"}
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="h-28 w-full rounded-2xl border border-border bg-card p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-navy/10"
            placeholder="Explain your thinking here..."
          />
        </div>

        {/* Consult Button */}
        <button
          type="button"
          onClick={initiateCoaching}
          disabled={isProbing || answers.work === null}
          className="w-full rounded-2xl bg-navy py-4 text-sm font-black tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-burgundy disabled:opacity-50"
        >
          {isProbing ? (
            <LoadingDots text="ANALYZING INITIAL LOGIC" />
          ) : showProbe ? (
            "RE-CONSULT ENGINEER"
          ) : (
            "CONSULT RELATIONAL ENGINEER"
          )}
        </button>

        {/* Follow-up Probe */}
        {showProbe && (
          <div className="space-y-4 border-t border-border pt-6">
            <div className="rounded-r-2xl border-l-4 border-burgundy bg-burgundy/5 p-5">
              <p className="text-sm italic leading-relaxed text-foreground">{probeText}</p>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-burgundy">
                Your honest response
              </label>
              <textarea
                value={followupAnswer}
                onChange={(e) => setFollowupAnswer(e.target.value)}
                className="h-24 w-full rounded-2xl border border-burgundy/20 bg-card p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-burgundy/10"
                placeholder="Think deeply... would you actually walk away?"
              />
            </div>
            <button
              type="button"
              onClick={getFinalRecommendation}
              disabled={isFinalizing}
              className="w-full rounded-2xl bg-burgundy py-3 text-sm font-black tracking-widest text-primary-foreground shadow-md transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isFinalizing ? (
                <LoadingDots text="FINALIZING LOGIC" />
              ) : (
                "SUBMIT FINAL TRUTH"
              )}
            </button>
          </div>
        )}

        {/* Final Recommendation */}
        {showFinal && (
          <div className="space-y-4 border-t border-border pt-6">
            <div className="rounded-r-2xl border-l-4 border-navy bg-navy/5 p-5">
              <p className="text-sm leading-relaxed text-foreground">{finalText}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePlace("requirements")}
                className="rounded-xl bg-red-500 px-4 py-2 text-[10px] font-black uppercase text-primary-foreground shadow-md transition-all hover:scale-105"
              >
                Move to Requirements
              </button>
              <button
                type="button"
                onClick={() => handlePlace("needs")}
                className="rounded-xl bg-blue-500 px-4 py-2 text-[10px] font-black uppercase text-primary-foreground shadow-md transition-all hover:scale-105"
              >
                Move to Needs
              </button>
              <button
                type="button"
                onClick={() => handlePlace("wants")}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-[10px] font-black uppercase text-primary-foreground shadow-md transition-all hover:scale-105"
              >
                Move to Wants
              </button>
              <button
                type="button"
                onClick={() => handlePlace("dealbreakers")}
                className="rounded-xl bg-slate-700 px-4 py-2 text-[10px] font-black uppercase text-primary-foreground shadow-md transition-all hover:scale-105"
              >
                Move to Dealbreakers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
