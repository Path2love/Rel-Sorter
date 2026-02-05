import { checkUsage } from "@/lib/usage-limiter"

export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"

  const usage = checkUsage(ip)
  return Response.json(usage)
}
