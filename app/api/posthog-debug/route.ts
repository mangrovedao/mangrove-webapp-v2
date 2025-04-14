import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    posthog_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    posthog_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  })
}
