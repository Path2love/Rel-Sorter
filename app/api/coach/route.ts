import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { checkUsage, consumeCredit } from "@/lib/usage-limiter"

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  // Identify user by IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"

  // Check credits before processing
  const usage = checkUsage(ip)
  if (!usage.allowed) {
    return Response.json({
      text: `You've used all ${usage.limit} interaction credits for today. Credits reset in ${Math.ceil((usage.resetsAt - Date.now()) / 3600000)} hours. Take this time to reflect on what you've learned so far.`,
      usage: { remaining: 0, used: usage.used, limit: usage.limit },
    })
  }

  const { type, payload } = await req.json()

  let prompt = ""

  if (type === "probe") {
    prompt = `
David is sorting: "${payload.trait}".
Initially David says: SOLVABLE: ${payload.work}, RECURRING ISSUE: ${payload.issue}.
Initial Reasoning: "${payload.context}"

Instructions:
- Act as a skeptical Relational Logic Coach.
- PUSH David to consider the grey zone. Do not be black and white.
- If he says Physical Attraction or Sexual Vitality is a Requirement, probe him: "If a partner met every other foundation like Kind Honesty, Intellectual Depth, and Mutual Respect, but the spark was a 7 rather than a 10, would you TRULY walk away, or could those other foundations make the dynamic strong enough?"
- Use David's actual requirement list: Kind Honesty, Growth Mindset, Mutual Respect, Intellectual Depth, Somatic Aliveness, Sexual Vitality, Physical Attraction.
- Ask ONE inquisitive follow-up question. No markdown. 2-3 sentences.
    `
  } else if (type === "final") {
    prompt = `
David's final truth on "${payload.trait}": "${payload.response}"
Categorize as Requirement (walk away), Need (workable), or Want.
Be direct about the pact he is making. No markdown. 2 sentences maximum.
    `
  } else if (type === "vetting") {
    prompt = `
Date Context: David met ${payload.name} for Date ${payload.phase}.
Phase Tests FAILED: ${payload.failedTests || "None"}
Phase Tests PASSED: ${payload.passedTests || "None"}
Dealbreakers Found: ${payload.dealbreakers || "None"}
Missing Requirements: ${payload.missingRequirements || "None"}
Notes: "${payload.notes}"

Instructions:
- If ANY phase test FAILED, this is a red flag. Be very direct that this is concerning.
- If any dealbreaker is present OR any requirement is missing OR any phase test failed, tell David he MUST walk away. Do not sugarcoat this.
- Only recommend continuing if ALL phase tests passed, NO dealbreakers are present, and ALL requirements are met.
- No markdown. Be firm, simple, and direct. 3-4 sentences maximum.
    `
  }

  try {
    const { text } = await generateText({
      model: openrouter("openrouter/auto"),
      prompt,
      maxOutputTokens: 300,
      temperature: 0.7,
    })

    // Consume credit on successful generation
    const updated = consumeCredit(ip)

    return Response.json({
      text,
      usage: { remaining: updated.remaining, used: updated.used, limit: updated.limit },
    })
  } catch (error) {
    return Response.json(
      { text: `AI coaching is temporarily unavailable. Error: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.` },
      { status: 200 }
    )
  }
}
