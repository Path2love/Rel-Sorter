export const DEFAULT_TRAITS = [
  "Kind Honesty",
  "Growth Mindset",
  "Mutual Respect",
  "Intellectual Depth",
  "Somatic Aliveness",
  "Sexual Vitality",
  "Physical Attraction",
  "Shared Interests",
  "Commitment",
  "Attentive Presence",
  "Quality Time",
  "Deep Communication",
  "Physical Touch",
  "Attentive Presence & Deeds",
  "Expressive Love",
  "Avoidance",
  "Traumatic Retreat",
  "Projection",
  "Unreliability",
  "Somatic Flatness",
]

export type BlueprintCategory = "requirements" | "needs" | "wants" | "dealbreakers"

export interface Blueprint {
  requirements: string[]
  needs: string[]
  wants: string[]
  dealbreakers: string[]
}

export interface Answers {
  work: boolean | null
  issue: boolean | null
}

export interface PhaseTest {
  id: string
  label: string
  q: string
}

export const PHASE_LOGIC: Record<string, PhaseTest[]> = {
  "1": [
    {
      id: "spark",
      label: "Physical Attraction",
      q: "The 'Gut' Check: Do I feel a real physical pull toward her? (Am I talking myself into it just because she seems 'nice' or 'safe'?)",
    },
    {
      id: "effort",
      label: "Equal Effort",
      q: "The Silence Test: If I stop planning the conversation for 5 minutes, does she ask me a question?",
    },
  ],
  "2": [
    {
      id: "attention",
      label: "Real Attention",
      q: "The Focus Test: When I talk about something important, does she stay focused and ask questions?",
    },
    {
      id: "talk",
      label: "Real Talk",
      q: "The Honesty Test: Can we talk about actual feelings? If I share something small and real, does she handle it well?",
    },
  ],
  "3": [
    {
      id: "speakup",
      label: "The 'Speak Up' Rule",
      q: "The Confusion Check: Have I felt confused or 'off' twice? (I will not just wait and hope it gets better.)",
    },
    {
      id: "reality",
      label: "The Reality Check",
      q: "The Pedestal Check: Am I seeing her clearly? Or am I just excited an attractive woman is giving me attention?",
    },
  ],
}

export const CATEGORY_CONFIG: Record<
  BlueprintCategory,
  { label: string; color: string; bgLight: string; borderColor: string; textColor: string; description: string }
> = {
  requirements: {
    label: "Requirement",
    color: "bg-red-500",
    bgLight: "bg-red-50",
    borderColor: "border-red-100",
    textColor: "text-red-700",
    description:
      "Price of Admission. If even ONE is missing, you must walk away. They must all be there or you leave the relationship.",
  },
  needs: {
    label: "Need",
    color: "bg-blue-500",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-100",
    textColor: "text-blue-700",
    description:
      "Very important. If all requirements are met, you stay and work on this to keep the relationship at its best.",
  },
  wants: {
    label: "Want",
    color: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-100",
    textColor: "text-emerald-700",
    description:
      "Just icing on the cake. Nice to have, but missing it doesn't affect the viability of the partnership.",
  },
  dealbreakers: {
    label: "Dealbreaker",
    color: "bg-slate-800",
    bgLight: "bg-slate-800",
    borderColor: "border-slate-700",
    textColor: "text-white",
    description:
      "Instant exit. If you see this in a profile or conversation, you walk away immediately.",
  },
}
