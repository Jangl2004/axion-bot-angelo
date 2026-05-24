import Jimp from 'jimp'
import jsQR from 'jsqr'

const handler = async (m, { conn, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) {
    return m.reply(`*⚠️ Rispondi a un codice QR (immagine) usando il comando ${usedPrefix}${command}*`)
  }

  await m.react('⏳')

  try {
    const imgBuffer = await q.download()
    if (!imgBuffer) throw new Error('Impossibile scaricare l\'immagine.')

    const image = await Jimp.read(imgBuffer)
    const { data, width, height } = image.bitmap

    const qrCode = jsQR(new Uint8ClampedArray(data), width, height)

    if (!qrCode) {
      await m.react('❌')
      return m.reply('*❌ Nessun codice QR valido rilevato in questa immagine. Assicurati che sia ben visibile e a fuoco.*')
    }

    const risultato = qrCode.data

    let risposta = `*🔍 QR CODE DECODIFICATO!*\n\n`
    if (/^https?:\/\//i.test(risultato)) {
      risposta += `*🔗 Link trovato:* ${risultato}`
    } else {
      risposta += `*📝 Contenuto del QR:* \`\`\`${risultato}\`\`\``
    }

    risposta += `\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

    await m.reply(risposta)
    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('*❌ Si è verificato un errore durante la lettura del codice QR.*')
  }
}

handler.help = ['prendilink']
handler.tags = ['utility']
handler.command = /^(prendilink|readqr|qrlink)$/i
handler.rowner = false

export default handler
