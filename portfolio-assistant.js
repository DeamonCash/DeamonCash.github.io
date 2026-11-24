const messages = document.querySelector('#messages')
const form = document.querySelector('#chat-form')
const input = document.querySelector('#question')
const send = document.querySelector('#send')
const dialog = document.querySelector('#source-dialog')
const panel = document.querySelector('#assistant')
const dock = document.querySelector('.chat-dock')
const mascot = document.querySelector('#mascot-toggle')
let previous = null
let busy = false

function bubble(role, paragraphs, sources = []) {
  const article = document.createElement('article')
  article.className = 'bubble ' + role
  article.setAttribute('aria-label', role === 'user' ? 'You' : role === 'status' ? 'Connection status' : 'Portfolio assistant')
  for (const text of paragraphs) {
    const paragraph = document.createElement('p')
    paragraph.textContent = text
    article.append(paragraph)
  }
  if (sources.length) {
    const row = document.createElement('div')
    row.className = 'sources'
    row.setAttribute('aria-label', 'Sources')
    for (const source of sources) {
      const button = document.createElement('button')
      button.textContent = source.title + ' ↗'
      button.addEventListener('click', () => {
        document.querySelector('#source-title').textContent = source.title
        document.querySelector('#source-text').textContent = source.text
        dialog.showModal()
      })
      row.append(button)
    }
    article.append(row)
  }
  messages.append(article)
  messages.scrollTop = messages.scrollHeight
  return article
}

async function revealAnswer(answer, results) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bubble('assistant', [answer], results)
    return
  }

  const draft = bubble('assistant', [''])
  draft.setAttribute('aria-hidden', 'true')
  const paragraph = draft.querySelector('p')
  const words = answer.split(/(?<=\s)(?=\S)/)
  const wordsPerFrame = Math.max(1, Math.ceil(words.length / 80))
  for (let index = 0; index < words.length; index += wordsPerFrame) {
    paragraph.textContent += words.slice(index, index + wordsPerFrame).join('')
    messages.scrollTop = messages.scrollHeight
    await new Promise((done) => setTimeout(done, 24))
  }
  draft.remove()
  bubble('assistant', [answer], results)
}

async function ask(question, lang = 'auto') {
  if (busy || !question.trim()) return
  busy = true
  send.disabled = true
  input.value = ''
  bubble('user', [question])
  const pending = bubble('assistant', [])
  pending.classList.add('typing')
  pending.setAttribute('aria-label', 'Gemini is preparing a reply')
  for (let index = 0; index < 3; index++) pending.append(document.createElement('span'))
  try {
    const response = await fetch(new URL('/api/chat', 'https://mehdi-portfolio-ai.vercel.app'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, previous, lang })
    })
    if (!response.ok) {
      const status = response.status
      const copy = {
        429: ['Le quota Gemini est atteint pour le moment.', 'The Gemini quota has been reached.'],
        503: ['La clé Gemini du portfolio reste à configurer.', 'The portfolio’s Gemini key still needs to be configured.']
      }[status]
      throw new Error(copy?.[lang === 'fr' ? 0 : 1] ??
        (lang === 'fr' ? 'Gemini est momentanément indisponible.' : 'Gemini is temporarily unavailable.'))
    }
    const { answer, results } = await response.json()
    pending.remove()
    if (results.length) previous = results[0].id
    await revealAnswer(answer, results)
  } catch (error) {
    pending.remove()
    bubble('status', [error instanceof TypeError
      ? (lang === 'fr' ? 'La connexion a été interrompue.' : 'The connection was interrupted.')
      : error.message])
  } finally {
    busy = false
    send.disabled = false
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  void ask(input.value)
})

document.querySelectorAll('[data-question]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!button.hasAttribute('data-chat')) {
      setChatOpen(true)
    }
    void ask(button.dataset.question, 'en')
  })
})

function setChatOpen(open, moveFocus = false) {
  dock.toggleAttribute('data-open', open)
  panel.inert = !open
  panel.setAttribute('aria-hidden', String(!open))
  mascot.setAttribute('aria-expanded', String(open))
  mascot.setAttribute('aria-label', open ? 'Minimize portfolio assistant' : 'Open portfolio assistant')
  if (moveFocus) (open ? input : mascot).focus()
}

mascot.addEventListener('click', () => setChatOpen(panel.inert, true))
document.querySelector('#minimize').addEventListener('click', () => setChatOpen(false, true))
dock.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !panel.inert) setChatOpen(false, true)
})
setChatOpen(false)

const mascotColors = {
  '#': '#101422',
  H: '#303553',
  L: '#555d88',
  S: '#e2ad89',
  F: '#ffd1a5',
  E: '#30324d',
  J: '#475a91',
  B: '#748aca',
  A: '#bfcafa',
  P: '#2b365c',
  W: '#e7ebff'
}
const mascotPixels = [
  '                            ',
  '         ########           ',
  '       ##HHLLHHHH##         ',
  '      #HLLHHHHHHHHH#        ',
  '     #HLHHHHHLLHHHHH#       ',
  '     #HHHHHHHLLHHHHH#       ',
  '     #HHHHHHHHHHFHHH#       ',
  '     #HHHFFFFHFFFFHH#       ',
  '     #HHFFFFFHFFFFHH#       ',
  '     #HFFFFFFFFFFFFH#       ',
  '    #SFFFEFFFFEFFFFFS#      ',
  '    #SFFFEFFFFEFFFFFS#      ',
  '     #SFFFFFFFFFFFFS#       ',
  '      #SFFFEFFFFFFS#        ',
  '       #SFFFEEFFFS#         ',
  '        ##SSFFSS##     ##   ',
  '        #J##SS##B#    #FF#  ',
  '      ##BJJ####JBJ#   #SF#  ',
  '     #BJJJJPAAPJBB#  #SB#   ',
  '     #BJJJJPAAPJJBB##BB#    ',
  '     #JJ#JJJPPJJJBBBJJ#     ',
  '     #SJ#JJJJJJJB####       ',
  '     #SS#BJJJJJJB#          ',
  '      ###BBBBBBBB#          ',
  '        #PPP#PPP##          ',
  '        #PPP#PPP#           ',
  '        #PPP#PPP#           ',
  '       #WAA##AAW#           ',
  '       ##### ####           ',
  '                            '
]

for (const canvas of document.querySelectorAll('.mascot-art')) {
  const context = canvas.getContext('2d')
  if (!context) continue
  mascotPixels.forEach((row, y) => {
    Array.from(row).forEach((pixel, x) => {
      if (!mascotColors[pixel]) return
      context.fillStyle = mascotColors[pixel]
      context.fillRect(x, y, 1, 1)
    })
  })
}
