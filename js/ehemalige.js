import { supabase } from './supabase-client.js'
import { loadPartials } from './partials.js'

async function loadEhemalige() {
  const { data, error } = await supabase
    .from('ehemalige')
    .select('*')
    .eq('veroeffentlicht', true)
    .is('deleted_at', null)
    .order('datum', { ascending: false })
  if (error) throw error
  return data
}

function formatDatum(dateStr) {
  return new Date(dateStr).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
}

function renderCard(e) {
  const bilder = Array.isArray(e.bilder) ? e.bilder : []

  const slides = bilder.length
    ? bilder.map(src => `<img src="${src}" alt="" class="galerie-slide" loading="lazy">`).join('')
    : `<div class="galerie-slide galerie-slide-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`

  const meta = [
    formatDatum(e.datum),
    e.anzahl_welpen ? `${e.anzahl_welpen} Welpen` : null,
    e.mutter_name ?? null,
  ].filter(Boolean).join(' · ')

  return `
    <article class="galerie-card" data-id="${e.id}" tabindex="0" role="button" aria-label="${e.titel} Details anzeigen">
      <div class="galerie-carousel">${slides}</div>
      <div class="galerie-card-info">
        <span class="galerie-card-title">${e.titel}</span>
        <span class="galerie-card-meta">${meta}</span>
      </div>
    </article>
  `
}

function openModal(e) {
  const modal = document.getElementById('galerie-modal')
  const carousel = document.getElementById('galerie-modal-carousel')
  const body = document.getElementById('galerie-modal-body')
  const bilder = Array.isArray(e.bilder) ? e.bilder : []

  carousel.innerHTML = bilder.length
    ? bilder.map(src => `<img src="${src}" alt="" class="galerie-modal-slide" loading="lazy">`).join('')
    : `<div class="galerie-modal-slide galerie-slide-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`

  const rows = [
    ['Datum', formatDatum(e.datum)],
    e.mutter_name ? ['Mutter', e.mutter_name] : null,
    e.vater_name ? ['Vater', e.vater_name] : null,
    e.anzahl_welpen != null ? ['Welpen', String(e.anzahl_welpen)] : null,
    e.beschreibung ? ['Beschreibung', e.beschreibung] : null,
  ].filter(Boolean)

  body.innerHTML = `
    <h2 class="galerie-modal-title">${e.titel}</h2>
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
    const eintraege = await loadEhemalige()
    if (!eintraege.length) {
      empty.hidden = false
      return
    }
    grid.innerHTML = eintraege.map(renderCard).join('')
    grid.querySelectorAll('.galerie-card').forEach(card => {
      const id = card.dataset.id
      const e = eintraege.find(x => x.id === id)
      const open = () => openModal(e)
      card.addEventListener('click', open)
      card.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') open() })
    })
  } catch {
    grid.innerHTML = '<p class="error-text">Galerie konnte nicht geladen werden.</p>'
  }
}

init()
