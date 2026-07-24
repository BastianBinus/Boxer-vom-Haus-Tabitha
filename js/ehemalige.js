import { supabase } from './supabase-client.js'
import { loadPartials } from './partials.js'

async function loadWuerfe() {
  const { data, error } = await supabase
    .from('wuerfe')
    .select('*, mutter:hunde!wuerfe_mutter_id_fkey(name), vater:hunde!wuerfe_vater_id_fkey(name)')
    .eq('in_galerie', true)
    .is('deleted_at', null)
    .order('datum', { ascending: false })
  if (error) throw error
  return data
}

function formatDatum(dateStr) {
  return new Date(dateStr).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}

function vaterLabel(w) {
  if (w.vater?.name) return w.vater.name
  if (w.vater_extern_name) {
    return w.vater_extern_zwinger
      ? `${w.vater_extern_name} v. ${w.vater_extern_zwinger}`
      : w.vater_extern_name
  }
  return '—'
}

function renderCard(w) {
  const bilder = Array.isArray(w.galerie_bilder) ? w.galerie_bilder : []
  const total = w.anzahl_ruden + w.anzahl_huendinnen

  const slides = bilder.length
    ? bilder.map(src => `<img src="${src}" alt="" class="galerie-slide" loading="lazy">`).join('')
    : `<div class="galerie-slide galerie-slide-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`

  return `
    <article class="galerie-card" data-id="${w.id}" tabindex="0" role="button" aria-label="Wurf ${formatDatum(w.datum)} Details anzeigen">
      <div class="galerie-carousel">${slides}</div>
      <div class="galerie-card-info">
        <span class="galerie-card-title">Wurf ${formatDatum(w.datum)}</span>
        <span class="galerie-card-meta">${total} Welpe${total !== 1 ? 'n' : ''} · ${w.mutter?.name ?? '—'}</span>
      </div>
    </article>
  `
}

function openModal(w) {
  const modal = document.getElementById('galerie-modal')
  const carousel = document.getElementById('galerie-modal-carousel')
  const body = document.getElementById('galerie-modal-body')
  const bilder = Array.isArray(w.galerie_bilder) ? w.galerie_bilder : []
  const total = w.anzahl_ruden + w.anzahl_huendinnen

  carousel.innerHTML = bilder.length
    ? bilder.map(src => `<img src="${src}" alt="" class="galerie-modal-slide" loading="lazy">`).join('')
    : `<div class="galerie-modal-slide galerie-slide-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`

  const rows = [
    ['Datum', formatDatum(w.datum)],
    ['Mutter', w.mutter?.name ?? '—'],
    ['Vater', vaterLabel(w)],
    ['Welpen', `${w.anzahl_ruden} Rüde${w.anzahl_ruden !== 1 ? 'n' : ''} · ${w.anzahl_huendinnen} Hündin${w.anzahl_huendinnen !== 1 ? 'nen' : ''} (${total} gesamt)`],
    w.notiz ? ['Notiz', w.notiz] : null,
  ].filter(Boolean)

  body.innerHTML = `
    <h2 class="galerie-modal-title">Wurf ${formatDatum(w.datum)}</h2>
    <dl class="galerie-modal-dl">
      ${rows.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join('')}
    </dl>
  `

  modal.hidden = false
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  const modal = document.getElementById('galerie-modal')
  modal.hidden = true
  document.body.style.overflow = ''
}

async function init() {
  await loadPartials()

  document.getElementById('galerie-modal-close').addEventListener('click', closeModal)
  document.querySelector('.galerie-modal-backdrop').addEventListener('click', closeModal)
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() })

  const grid = document.getElementById('galerie-grid')
  const empty = document.getElementById('galerie-empty')

  try {
    const wuerfe = await loadWuerfe()
    if (!wuerfe.length) {
      empty.hidden = false
      return
    }
    grid.innerHTML = wuerfe.map(renderCard).join('')
    grid.querySelectorAll('.galerie-card').forEach(card => {
      const id = card.dataset.id
      const w = wuerfe.find(x => x.id === id)
      const open = () => openModal(w)
      card.addEventListener('click', open)
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open() })
    })
  } catch {
    grid.innerHTML = '<p class="error-text">Galerie konnte nicht geladen werden.</p>'
  }
}

init()
