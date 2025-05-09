"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PrototypePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/game")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Redirecting to the game page...</p>
    </div>
  )
}
