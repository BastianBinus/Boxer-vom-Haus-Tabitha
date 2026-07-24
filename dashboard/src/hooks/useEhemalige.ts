import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types'

export type Ehemaliger = Tables<'ehemalige'>

export function useEhemalige() {
  const [items, setItems] = useState<Ehemaliger[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('ehemalige')
      .select('*')
      .is('deleted_at', null)
      .order('datum', { ascending: false })
    if (err) setError(err.message)
    else setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async (input: TablesInsert<'ehemalige'>) => {
    const { data, error: err } = await supabase
      .from('ehemalige')
      .insert(input)
      .select()
      .single()
    if (err) throw err
    await load()
    return data
  }

  const update = async (id: string, input: TablesUpdate<'ehemalige'>) => {
    const { error: err } = await supabase.from('ehemalige').update(input).eq('id', id)
    if (err) throw err
    await load()
  }

  const softDelete = async (id: string) => {
    const { error: err } = await supabase
      .from('ehemalige')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw err
    await load()
  }

  return { items, loading, error, reload: load, create, update, softDelete }
}

export function useEhemaliger(id: string | undefined) {
  const [item, setItem] = useState<Ehemaliger | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('ehemalige').select('*').eq('id', id).single()
    setItem(data)
    setLoading(false)
  }, [id])

  useEffect(() => { void load() }, [load])

  return { item, loading, reload: load }
}
