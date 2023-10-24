'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export function useSupabase() {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check initial connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('tenants').select('id').limit(1)
        if (error) throw error
        setIsConnected(true)
      } catch (err: any) {
        setError(err.message)
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [])

  const subscribe = useCallback(
    <T,>(table: string, callback: (payload: T) => void) => {
      const subscription = supabase
        .channel(`public:${table}`)
        .on('*', (payload: any) => {
          callback(payload.new || payload.old)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    },
    []
  )

  return {
    client: supabase,
    isConnected,
    error,
    subscribe,
  }
}
