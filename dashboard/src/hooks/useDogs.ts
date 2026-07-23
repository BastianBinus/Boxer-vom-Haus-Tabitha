import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types'

export type Dog = Tables<'hunde'>

export function useDogs() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('hunde')
      .select('*')
      .is('deleted_at', null)
      .order('name')
    if (err) setError(err.message)
    else setDogs(data)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async (input: TablesInsert<'hunde'>) => {
    const { data, error: err } = await supabase
      .from('hunde')
      .insert(input)
      .select()
      .single()
    if (err) throw err
    await load()
    return data
  }

  const update = async (id: string, input: TablesUpdate<'hunde'>) => {
    const { error: err } = await supabase.from('hunde').update(input).eq('id', id)
    if (err) throw err
    await load()
  }

  const softDelete = async (id: string) => {
    const { error: err } = await supabase
      .from('hunde')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw err
    await load()
  }

  return { dogs, loading, error, reload: load, create, update, softDelete }
}

export function useDog(id: string | undefined) {
  const [dog, setDog] = useState<Dog | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('hunde').select('*').eq('id', id).single()
    setDog(data)
    setLoading(false)
  }, [id])

  useEffect(() => { void load() }, [load])

  return { dog, loading, reload: load }
}
