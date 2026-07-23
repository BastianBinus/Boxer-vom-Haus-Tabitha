import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types'

export type Litter = Tables<'wuerfe'>

export function useLitters() {
  const [litters, setLitters] = useState<Litter[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('wuerfe')
      .select('*')
      .is('deleted_at', null)
      .order('datum', { ascending: false })
    setLitters(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async (input: TablesInsert<'wuerfe'>) => {
    const { data, error } = await supabase.from('wuerfe').insert(input).select().single()
    if (error) throw error
    await load()
    return data
  }

  const update = async (id: string, input: TablesUpdate<'wuerfe'>) => {
    const { error } = await supabase.from('wuerfe').update(input).eq('id', id)
    if (error) throw error
    await load()
  }

  const softDelete = async (id: string) => {
    const { error } = await supabase
      .from('wuerfe')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { litters, loading, reload: load, create, update, softDelete }
}

export function useLitter(id: string | undefined) {
  const [litter, setLitter] = useState<Litter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    supabase.from('wuerfe').select('*').eq('id', id).single().then(({ data }) => {
      setLitter(data)
      setLoading(false)
    })
  }, [id])

  return { litter, loading }
}
