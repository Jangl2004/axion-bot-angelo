const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) {
    return m.reply(`*⚠️ Rispondi a un'immagine usando il comando ${usedPrefix}${command}*`)
  }

  await m.react('⏳')

  try {
    const imgBuffer = await q.download()
    if (!imgBuffer) throw new Error('Impossibile scaricare l\'immagine.')

    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    
    await conn.updateProfilePicture(botJid, imgBuffer)

    await m.reply('*📸 Foto profilo del bot aggiornata con successo!*')
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('*❌ Si è verificato un errore durante l\'aggiornamento della foto profilo.*')
  }
}

handler.help = ['setpfpbot']
handler.tags = ['owner', 'admin']
handler.command = /^(setpfpbot|setbotpp|setbotpfp)$/i
handler.owner = true

export default handler
