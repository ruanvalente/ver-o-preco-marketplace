"use client"

import { useCallback, useEffect, useRef } from "react"

import type { ChatMessage } from "../types/chat.types"

export type ChatScrollPreservation = {
  captureBeforeLoad: () => void
  preserveAfterLoad: () => void
}

type UseChatScrollOptions = {
  messages: ChatMessage[]
}

export function useChatScroll({ messages }: UseChatScrollOptions) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const previousCountRef = useRef(messages.length)
  const preserveScrollRef = useRef(false)
  const scrollMetricsRef = useRef({ top: 0, height: 0 })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [])

  useEffect(() => {
    if (preserveScrollRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      container.scrollTop =
        scrollMetricsRef.current.top +
        (container.scrollHeight - scrollMetricsRef.current.height)
      preserveScrollRef.current = false
    } else if (messages.length > previousCountRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end" })
    }

    previousCountRef.current = messages.length
  }, [messages])

  const captureBeforeLoad = useCallback(() => {
    const container = scrollContainerRef.current

    if (container) {
      scrollMetricsRef.current = {
        top: container.scrollTop,
        height: container.scrollHeight,
      }
    }
  }, [])

  const preserveAfterLoad = useCallback(() => {
    preserveScrollRef.current = true
  }, [])

  return {
    scrollContainerRef,
    bottomRef,
    captureBeforeLoad,
    preserveAfterLoad,
  }
}
