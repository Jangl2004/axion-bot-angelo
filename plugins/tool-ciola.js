let handler = async (m, { conn, participants, isBotAdmin }) => {
  // Controlli preliminari sui permessi del bot
  if (!m.isGroup) return
  if (!isBotAdmin) return

  // 1. Mappatura sicura degli Owner del bot
  const ownerJids = (global.owner || [])
    .map(o => (Array.isArray(o) ? o[0] : typeof o === 'object' ? o.id || o[0] : o))
    .map(jid => jid.replace(/[^0-9]/g, '') + '@s.whatsapp.net')

  // 2. ID del Bot e di chi lancia il comando (mittente)
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
  const senderJid = m.sender

  // 3. Recupero della lista admin correggendo la proprietà da .jid a .id
  let admins = participants.filter(
    p => p.admin === 'admin' || p.admin === 'superadmin'
  )

  // 4. Esclude dall'elenco il bot stesso, gli owner e chi ha eseguito il comando
  let toDemote = admins
    .map(p => p.id || p.jid) 
    .filter(jid =>
      jid &&
      jid !== botJid &&
      jid !== senderJid &&
      !ownerJids.includes(jid)
    )

  if (!toDemote.length) {
    return m.reply('Nessun amministratore idoneo da rimuovere.')
  }

  try {
    // Esegue il declassamento sul server
    await conn.groupParticipantsUpdate(m.chat, toDemote, 'demote')

    // 5. Gestione sicura del cambio nome (Max 25 caratteri totali per evitare crash)
    let metadata = await conn.groupMetadata(m.chat)
    let oldName = metadata.subject

    let suffix = ' | RESET'
    // Taglia la combinazione per non superare il limite imposto da WhatsApp
    let newName = (oldName + suffix).slice(0, 25)

    await conn.groupUpdateSubject(m.chat, newName)

    await m.reply('Operazione completata: i ruoli amministrativi sono stati aggiornati.')

  } catch (e) {
    console.error('Errore durante l\'esecuzione del comando:', e)
    await m.reply('Impossibile completare l\'operazione. Verifica i log del server.')
  }
}

handler.help = ['ciola']
handler.tags = ['group']
handler.command = /^(ciola)$/i
handler.group = true
handler.owner = true // Mantiene il comando accessibile solo ai creatori del bot

export default handler
