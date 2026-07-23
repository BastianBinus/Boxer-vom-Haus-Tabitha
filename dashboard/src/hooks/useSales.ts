import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types'

export type Sale = Tables<'verkaeufe'>

export function useSales(wurfId: string | undefined) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!wurfId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('verkaeufe')
      .select('*')
      .eq('wurf_id', wurfId)
      .is('deleted_at', null)
      .order('datum')
    setSales(data ?? [])
    setLoading(false)
  }, [wurfId])

  useEffect(() => { void load() }, [load])

  const create = async (input: TablesInsert<'verkaeufe'>) => {
    const { error } = await supabase.from('verkaeufe').insert(input)
    if (error) throw error
    await load()
  }

  const update = async (id: string, input: TablesUpdate<'verkaeufe'>) => {
    const { error } = await supabase.from('verkaeufe').update(input).eq('id', id)
    if (error) throw error
    await load()
  }

  const softDelete = async (id: string) => {
    const { error } = await supabase
      .from('verkaeufe')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { sales, loading, reload: load, create, update, softDelete }
}
