import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types'

export type Buyer = Tables<'kaeufer'>

export function useBuyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('kaeufer')
      .select('*')
      .is('deleted_at', null)
      .order('name')
    setBuyers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async (input: TablesInsert<'kaeufer'>) => {
    const { data, error } = await supabase.from('kaeufer').insert(input).select().single()
    if (error) throw error
    await load()
    return data
  }

  const update = async (id: string, input: TablesUpdate<'kaeufer'>) => {
    const { error } = await supabase.from('kaeufer').update(input).eq('id', id)
    if (error) throw error
    await load()
  }

  const softDelete = async (id: string) => {
    const { error } = await supabase
      .from('kaeufer')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { buyers, loading, reload: load, create, update, softDelete }
}
