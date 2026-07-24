import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Tables, TablesInsert, TablesUpdate } from '../types/database.types'

export type Post = Tables<'beitraege'>

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('beitraege')
      .select('*')
      .is('deleted_at', null)
      .order('datum', { ascending: false })
    if (err) setError(err.message)
    else setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const create = async (input: TablesInsert<'beitraege'>) => {
    const { data, error: err } = await supabase
      .from('beitraege')
      .insert(input)
      .select()
      .single()
    if (err) throw err
    await load()
    return data
  }

  const update = async (id: string, input: TablesUpdate<'beitraege'>) => {
    const { error: err } = await supabase.from('beitraege').update(input).eq('id', id)
    if (err) throw err
    await load()
  }

  const softDelete = async (id: string) => {
    const { error: err } = await supabase
      .from('beitraege')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (err) throw err
    await load()
  }

  return { posts, loading, error, reload: load, create, update, softDelete }
}

export function usePost(id: string | undefined) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase.from('beitraege').select('*').eq('id', id).single()
    setPost(data)
    setLoading(false)
  }, [id])

  useEffect(() => { void load() }, [load])

  return { post, loading, reload: load }
}
