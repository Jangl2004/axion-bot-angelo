let handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  // Mappa gli owner assicurandosi che abbiano il formato corretto
  const ownerJids = (global.owner || [])
    .map(o => (Array.isArray(o) ? o[0] : typeof o === 'object' ? o.id || o[0] : o))
    .map(jid => jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net')

  // ID del bot pulito
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'

  // 🔴 CORREZIONE: Gestito sia p.id che p.jid per compatibilità
  let admins = participants.filter(
    p => p.admin === 'admin' || p.admin === 'superadmin'
  )

  let toDemote = admins
    .map(p => p.id || p.jid) // Prende l'ID corretto
    .filter(jid =>
      jid &&
      jid !== botJid &&
      !ownerJids.includes(jid)
    )

  if (!toDemote.length) {
    return m.reply('Nessun amministratore da rimuovere (o sono tutti owner/bot).')
  }

  try {
    // 🔻 Retrocedi gli admin
    await conn.groupParticipantsUpdate(m.chat, toDemote, 'demote')

    // 🔥 Cambio nome gruppo sicuro (Tagliato a 25 caratteri max)
    let metadata = await conn.groupMetadata(m.chat)
    let oldName = metadata.subject

    let suffix = ' | DANGER' // Accorciato per evitare crash di WhatsApp
    let newName = (oldName + suffix).slice(0, 25) 

    await conn.groupUpdateSubject(m.chat, newName)

    await m.reply('𝙂𝙍𝙐𝙋𝙋𝙊 𝙍𝙐𝘽𝘼𝙏𝙊 𝘽𝙔 𝙏𝙃𝙀 𝘿𝘼𝙉𝙂𝙀𝙍')

  } catch (e) {
    console.error('Errore nel comando:', e)
    await m.reply('Si è verificato un errore durante l\'esecuzione del comando.')
  }
}

handler.help = ['fotti']
handler.tags = ['group']
handler.command = /^(fotti)$/i
handler.group = true
handler.admin = true // Assicurati che solo un admin (o l'owner) possa usarlo
handler.owner = true

export default handler
