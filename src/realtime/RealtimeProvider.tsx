import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import type { Notification } from '@/api/types'
import { playChime } from './sound'

const TOPIC_KEYS: Record<string, string[]> = {
  production: ['batches', 'items', 'queue', 'board', 'orders', 'stock', 'rolls'],
  orders: ['orders', 'board'],
  stock: ['rolls', 'stock', 'items', 'sales', 'waste'],
}

const COLORS: Record<Notification['level'], string> = {
  info: 'blue',
  success: 'teal',
  warning: 'yellow',
  danger: 'red',
}

const RealtimeContext = createContext<{ connected: boolean }>({ connected: false })

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!user) return
    let stopped = false
    let retry = 0
    let ping: number | undefined

    const connect = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${proto}://${location.host}/ws/events`)
      socketRef.current = ws
      ws.onopen = () => {
        retry = 0
        setConnected(true)
        ping = window.setInterval(() => ws.readyState === 1 && ws.send(JSON.stringify({ type: 'ping' })), 25000)
        void queryClient.invalidateQueries()
      }
      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data)
        if (data.event === 'changed') {
          for (const key of TOPIC_KEYS[data.topic] ?? [data.topic]) {
            void queryClient.invalidateQueries({ queryKey: [key] })
          }
        } else if (data.event === 'notification') {
          const n = data.payload as Notification
          void queryClient.invalidateQueries({ queryKey: ['notifications'] })
          playChime(n.level)
          notifications.show({
            title: n.title,
            message: n.body,
            color: COLORS[n.level],
            autoClose: n.level === 'danger' ? false : 8000,
            onClick: () => n.link && navigate(n.link),
            style: { cursor: n.link ? 'pointer' : undefined },
          })
        }
      }
      ws.onclose = () => {
        setConnected(false)
        window.clearInterval(ping)
        if (!stopped) {
          retry = Math.min(retry + 1, 6)
          window.setTimeout(connect, 1000 * 2 ** retry)
        }
      }
    }
    connect()
    return () => {
      stopped = true
      window.clearInterval(ping)
      socketRef.current?.close()
    }
  }, [user, queryClient, navigate])

  return <RealtimeContext.Provider value={{ connected }}>{children}</RealtimeContext.Provider>
}

export const useRealtime = () => useContext(RealtimeContext)
