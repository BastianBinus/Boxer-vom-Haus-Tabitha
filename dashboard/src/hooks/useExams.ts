import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types'

export type Exam = Tables<'pruefungen'>

export function useExams(hundId: string | undefined) {
  const [items, setItems] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!hundId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('pruefungen')
      .select('*')
      .eq('hund_id', hundId)
      .is('deleted_at', null)
      .order('datum', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }, [hundId])

  useEffect(() => { void load() }, [load])

  const create = async (input: TablesInsert<'pruefungen'>) => {
    const { error } = await supabase.from('pruefungen').insert(input)
    if (error) throw error
    await load()
  }

  const update = async (id: string, input: TablesUpdate<'pruefungen'>) => {
    const { error } = await supabase.from('pruefungen').update(input).eq('id', id)
    if (error) throw error
    await load()
  }

  const softDelete = async (id: string) => {
    const { error } = await supabase
      .from('pruefungen')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await load()
  }

  return { items, loading, reload: load, create, update, softDelete }
}
