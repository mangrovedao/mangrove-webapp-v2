"use client"

import posthog from "posthog-js"
import { useEffect, useState } from "react"

export function PostHogDebug() {
  const [status, setStatus] = useState<{
    loaded: boolean
    sessionId?: string
    distinctId?: string
    host?: string
  }>({ loaded: false })

  useEffect(() => {
    // Check if PostHog is loaded
    if (posthog.__loaded) {
      setStatus({
        loaded: true,
        sessionId: posthog.get_session_id(),
        distinctId: posthog.get_distinct_id(),
        host: (posthog as any).config?.api_host,
      })

      // Force a capture to test the connection
      posthog.capture("debug_view", { timestamp: new Date().toISOString() })
    }
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4 text-black text-sm">
      <h3 className="font-bold">PostHog Debug</h3>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  )
}
