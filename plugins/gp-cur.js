import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import SpotifyWebApi from 'spotify-web-api-node'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const USERS_FILE = path.join(__dirname, '..', 'lastfm_users.json')
const LIKES_FILE = path.join(__dirname, '..', 'song_likes.json')
const SPOTIFY_FILE = path.join(__dirname, '..', 'spotify_tokens.json')

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '{}')
if (!fs.existsSync(LIKES_FILE)) fs.writeFileSync(LIKES_FILE, '{}')
if (!fs.existsSync(SPOTIFY_FILE)) fs.writeFileSync(SPOTIFY_FILE, '{}')

const LASTFM_API_KEY = 'YOUR_LASTFM_API_KEY'

const spotifyApi = new SpotifyWebApi({
  clientId: 'SPOTIFY_CLIENT_ID',
  clientSecret: 'SPOTIFY_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/callback'
})

const cache = new Map()

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function getLastfmUsername(userId) {
  return loadJSON(USERS_FILE)[userId] || null
}

function setLastfmUsername(userId, username) {
  const users = loadJSON(USERS_FILE)
  users[userId] = username
  saveJSON(USERS_FILE, users)
}

function getSpotifyToken(userId) {
  return loadJSON(SPOTIFY_FILE)[userId] || null
}

function saveSpotifyToken(userId, tokenData) {
  const data = loadJSON(SPOTIFY_FILE)
  data[userId] = tokenData
  saveJSON(SPOTIFY_FILE, data)
}

function loadLikes() {
  return loadJSON(LIKES_FILE)
}

function saveLikes(data) {
  saveJSON(LIKES_FILE, data)
}

function generateSongId(username, artist, track) {
  return `${username}_${artist}_${track}`
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
}

function addSongLike(songId, userId) {
  const likes = loadLikes()

  if (!likes[songId]) {
    likes[songId] = {
      likes: 0,
      likedBy: []
    }
  }

  if (likes[songId].likedBy.includes(userId)) {
    return {
      alreadyLiked: true,
      total: likes[songId].likes
    }
  }

  likes[songId].likes++
  likes[songId].likedBy.push(userId)

  saveLikes(likes)

  return {
    alreadyLiked: false,
    total: likes[songId].likes
  }
}

function getUserLikesReceived(username) {
  const likes = loadLikes()

  let total = 0

  for (const songId in likes) {
    if (songId.startsWith(username.toLowerCase())) {
      total += likes[songId].likes || 0
    }
  }

  return total
}

async function fetchWithCache(url, duration = 30000) {
  const now = Date.now()

  if (cache.has(url)) {
    const cached = cache.get(url)

    if (now - cached.timestamp < duration) {
      return cached.data
    }
  }

  try {
    const res = await fetch(url)
    const json = await res.json()

    cache.set(url, {
      data: json,
      timestamp: now
    })

    return json
  } catch {
    return null
  }
}

async function getRecentTrack(username) {
  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=1`

  const data = await fetchWithCache(url)

  return data?.recenttracks?.track?.[0]
}

async function getRecentTracks(username, limit = 10) {
  const url =
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`

  const data = await fetchWithCache(url)

  return data?.recenttracks?.track || []
}

async function refreshSpotifyToken(userId) {
  const tokenData = getSpotifyToken(userId)

  if (!tokenData) return null

  spotifyApi.setRefreshToken(tokenData.refresh_token)

  try {
    const refreshed = await spotifyApi.refreshAccessToken()

    const access_token = refreshed.body.access_token

    saveSpotifyToken(userId, {
      ...tokenData,
      access_token
    })

    return access_token
  } catch {
    return null
  }
}

async function skipTrack(userId) {
  const accessToken = await refreshSpotifyToken(userId)

  if (!accessToken) return false

  spotifyApi.setAccessToken(accessToken)

  try {
    await spotifyApi.skipToNext()
    return true
  } catch {
    return false
  }
}

function invalidateCache(username) {
  const keys = [...cache.keys()]

  for (const key of keys) {
    if (key.includes(username)) {
      cache.delete(key)
    }
  }
}

const handler = async (m, { conn, command, text, usedPrefix }) => {

  if (command === 'setuser') {
    if (!text) {
      return conn.sendMessage(m.chat, {
        text: `❌ Usa: ${usedPrefix}setuser <username>`
      })
    }

    setLastfmUsername(m.sender, text.trim())

    return conn.sendMessage(m.chat, {
      text: `✅ Username Last.fm salvato!`
    })
  }

  const user = getLastfmUsername(m.sender)

  if (!user) {
    return conn.sendMessage(m.chat, {
      text: `❌ Usa prima ${usedPrefix}setuser <username>`
    })
  }

  if (command === 'cur') {

    invalidateCache(user)

    const track = await getRecentTrack(user)

    if (!track) {
      return conn.sendMessage(m.chat, {
        text: '❌ Nessuna traccia trovata.'
      })
    }

    const artist = track.artist?.['#text'] || 'Sconosciuto'
    const title = track.name || 'Sconosciuto'
    const album = track.album?.['#text'] || 'Sconosciuto'

    const image =
      track.image?.find(x => x.size === 'extralarge')?.['#text']

    const songId = generateSongId(user, artist, title)

    const likes = loadLikes()[songId]?.likes || 0

    const likesReceived = getUserLikesReceived(user)

    const caption =
`🎧 ${user}

🎵 ${title}
🎤 ${artist}
💿 ${album}

🔥 Likes canzone: ${likes}
❤️ Likes ricevuti: ${likesReceived}`

    const buttons = [
      {
        buttonId: `${usedPrefix}like ${user}`,
        buttonText: {
          displayText: '🔥 Like'
        },
        type: 1
      },
      {
        buttonId: `${usedPrefix}cronologia`,
        buttonText: {
          displayText: '📜 Cronologia'
        },
        type: 1
      },
      {
        buttonId: `${usedPrefix}skip`,
        buttonText: {
          displayText: '⏭️ Cambia Canzone'
        },
        type: 1
      }
    ]

    if (image) {
      return conn.sendMessage(m.chat, {
        image: { url: image },
        caption,
        footer: 'Last.fm + Spotify',
        buttons,
        headerType: 4
      }, { quoted: m })
    }

    return conn.sendMessage(m.chat, {
      text: caption,
      buttons,
      headerType: 1
    }, { quoted: m })
  }

  if (command === 'like') {

    const target = text.trim()

    if (!target) {
      return conn.sendMessage(m.chat, {
        text: '❌ Specifica utente.'
      })
    }

    invalidateCache(target)

    const track = await getRecentTrack(target)

    if (!track) {
      return conn.sendMessage(m.chat, {
        text: '❌ Nessuna traccia.'
      })
    }

    const artist = track.artist?.['#text']
    const title = track.name

    const songId = generateSongId(target, artist, title)

    const result = addSongLike(songId, m.sender)

    if (result.alreadyLiked) {
      return conn.sendMessage(m.chat, {
        text: '❌ Hai già messo like.'
      })
    }

    return conn.sendMessage(m.chat, {
      text:
`🔥 Like aggiunto!

🎵 ${title}
🎤 ${artist}

❤️ Totale likes: ${result.total}`
    })
  }

  if (command === 'cronologia') {

    invalidateCache(user)

    const tracks = await getRecentTracks(user, 10)

    if (!tracks.length) {
      return conn.sendMessage(m.chat, {
        text: '❌ Nessuna cronologia.'
      })
    }

    const txt = tracks.map((t, i) => {
      const artist = t.artist?.['#text']
      const name = t.name

      return `${i + 1}. ${name}\n🎤 ${artist}`
    }).join('\n\n')

    return conn.sendMessage(m.chat, {
      text:
`📜 Cronologia di ${user}

${txt}`
    })
  }

  if (command === 'skip') {

    const success = await skipTrack(m.sender)

    if (!success) {
      return conn.sendMessage(m.chat, {
        text:
`❌ Spotify non collegato.

Devi salvare access_token e refresh_token.`
      })
    }

    await conn.sendMessage(m.chat, {
      text: '⏭️ Canzone cambiata!'
    })

    setTimeout(async () => {

      invalidateCache(user)

      const newTrack = await getRecentTrack(user)

      if (!newTrack) return

      const artist = newTrack.artist?.['#text']
      const title = newTrack.name

      conn.sendMessage(m.chat, {
        text:
`🎵 Nuova canzone

${title}
🎤 ${artist}`
      })

    }, 3000)
  }
}

handler.command = [
  'setuser',
  'cur',
  'like',
  'cronologia',
  'skip'
]

handler.group = true
handler.tags = ['lastfm']

export default handler