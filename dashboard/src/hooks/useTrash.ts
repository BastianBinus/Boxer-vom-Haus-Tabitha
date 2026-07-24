import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface TrashItem {
  id: string
  label: string
  deleted_at: string
  daysLeft: number
  table: string
}

function daysLeft(deleted_at: string): number {
  const purgeAt = new Date(deleted_at).getTime() + 30 * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((purgeAt - Date.now()) / (24 * 60 * 60 * 1000)))
}

export function useTrash() {
  const [items, setItems] = useState<Record<string, TrashItem[]>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [
      { data: hunde },
      { data: checks },
      { data: pruef },
      { data: wuerfe },
      { data: kaeufer },
      { data: verkaeufe },
      { data: beitraege },
    ] = await Promise.all([
      supabase.from('hunde').select('id, name, deleted_at').not('deleted_at', 'is', null),
      supabase.from('gesundheitschecks').select('id, kategorie, datum, deleted_at').not('deleted_at', 'is', null),
      supabase.from('pruefungen').select('id, art, datum, deleted_at').not('deleted_at', 'is', null),
      supabase.from('wuerfe').select('id, datum, deleted_at').not('deleted_at', 'is', null),
      supabase.from('kaeufer').select('id, name, deleted_at').not('deleted_at', 'is', null),
      supabase.from('verkaeufe').select('id, welpe_label, deleted_at').not('deleted_at', 'is', null),
      supabase.from('beitraege').select('id, titel, deleted_at').not('deleted_at', 'is', null),
    ])

    setItems({
      beitraege: (beitraege ?? []).map(b => ({
        id: b.id, label: b.titel, deleted_at: b.deleted_at!,
        daysLeft: daysLeft(b.deleted_at!), table: 'beitraege',
      })),
      hunde: (hunde ?? []).map(h => ({
        id: h.id, label: h.name, deleted_at: h.deleted_at!,
        daysLeft: daysLeft(h.deleted_at!), table: 'hunde',
      })),
      gesundheitschecks: (checks ?? []).map(c => ({
        id: c.id, label: `${c.kategorie} — ${c.datum}`, deleted_at: c.deleted_at!,
        daysLeft: daysLeft(c.deleted_at!), table: 'gesundheitschecks',
      })),
      pruefungen: (pruef ?? []).map(p => ({
        id: p.id, label: `${p.art} — ${p.datum}`, deleted_at: p.deleted_at!,
        daysLeft: daysLeft(p.deleted_at!), table: 'pruefungen',
      })),
      wuerfe: (wuerfe ?? []).map(w => ({
        id: w.id, label: `Wurf ${w.datum}`, deleted_at: w.deleted_at!,
        daysLeft: daysLeft(w.deleted_at!), table: 'wuerfe',
      })),
      kaeufer: (kaeufer ?? []).map(k => ({
        id: k.id, label: k.name, deleted_at: k.deleted_at!,
        daysLeft: daysLeft(k.deleted_at!), table: 'kaeufer',
      })),
      verkaeufe: (verkaeufe ?? []).map(v => ({
        id: v.id, label: v.welpe_label, deleted_at: v.deleted_at!,
        daysLeft: daysLeft(v.deleted_at!), table: 'verkaeufe',
      })),
    })
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  const restore = async (table: string, id: string) => {
    await supabase.from(table as 'hunde').update({ deleted_at: null } as never).eq('id', id)
    await load()
  }

  const permanentDelete = async (table: string, id: string) => {
    await supabase.from(table as 'hunde').delete().eq('id', id)
    await load()
  }

  return { items, loading, reload: load, restore, permanentDelete }
}
