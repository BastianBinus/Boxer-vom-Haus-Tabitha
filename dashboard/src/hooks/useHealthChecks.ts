import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types'

export type HealthCheck = Tables<'gesundheitschecks'>

export function useHealthChecks(hundId: string | undefined) {
  const [items, setItems] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!hundId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('gesundheitschecks')
      .select('*')
      .eq('hund_id', hundId)
      .is('deleted_at', null)
      .order('datum', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [hundId])

  useEffect(() => { void load() }, [load])

  const create = async (input: TablesInsert<'gesundheitschecks'>) => {
    const { error } = await supabase.from('gesundheitschecks').insert(input)
    if (error) throw error
    await load()
  }

  const update = async (id: string, input: TablesUpdate<'gesundheitschecks'>) => {
    const { error } = await supabase.from('gesundheitschecks').update(input).eq('id', id)
    if (error) throw error
    await load()
  }

  const softDelete = async (id: string) => {
    const { error } = await supabase
      .from('gesundheitschecks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { items, loading, reload: load, create, update, softDelete }
}
