import { supabase } from './supabase-client.js'
import { loadPartials } from './partials.js'

async function loadPosts() {
  const { data, error } = await supabase
    .from('beitraege')
    .select('id, titel, datum, auszug, inhalt, video_url, images')
    .eq('veroeffentlicht', true)
    .is('deleted_at', null)
    .order('datum', { ascending: false })
  if (error) throw error
  return data.map(p => ({
    id: p.id,
    title: p.titel,
    date: p.datum,
    excerpt: p.auszug,
    body: p.inhalt,
    video_url: p.video_url,
    images: p.images,
  }))
}

function getEmbedUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
      const id = u.searchParams.get('v')
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1)
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
    }
    if (u.hostname === 'vimeo.com' || u.hostname === 'www.vimeo.com') {
      const id = u.pathname.replace(/^\//, '')
      if (id) return `https://player.vimeo.com/video/${id}`
    }
    return null
  } catch {
    return null
  }
}

function renderPost(post) {
  const mediaParts = []

  if (post.images?.length) {
    const imgs = post.images
      .map(src => `<img src="${src}" alt="" class="post-media-img" loading="lazy">`)
      .join('')
    mediaParts.push(`<div class="post-media">${imgs}</div>`)
  }

  if (post.video_url) {
    const embedUrl = getEmbedUrl(post.video_url)
    if (embedUrl) {
      mediaParts.push(
        `<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Video"></iframe></div>`
      )
    }
  }

  return `
    <article class="card card-elevated post-card">
      <time class="post-date">${new Date(post.date).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
      <h2 class="post-title">${post.title}</h2>
      ${post.excerpt ? `<p class="post-excerpt">${post.excerpt}</p>` : ''}
      ${mediaParts.join('')}
    </article>
  `
}

async function init() {
  await loadPartials()
  const feed = document.getElementById('posts-feed')
  if (!feed) return

  try {
    const posts = await loadPosts()
    feed.innerHTML = posts.length
      ? posts.map(renderPost).join('')
      : '<p class="empty-text">Noch keine Beiträge vorhanden.</p>'
  } catch {
    feed.innerHTML = '<p class="error-text">Beiträge konnten nicht geladen werden.</p>'
  }
}

init()
