import { checkUsage } from "@/lib/usage-limiter"

export async function GET(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anonymous"

  const clientId = req.headers.get("x-client-id")?.trim() || ip
  const usage = await checkUsage(clientId)
  return Response.json(usage)
}
