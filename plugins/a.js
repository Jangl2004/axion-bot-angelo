// Plugin by elixir

import fetch from 'node-fetch';

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*🔍 USO:* ${usedPrefix}${command} <numero>\n*Esempio:* ${usedPrefix}${command} 393471234567`);
  }

  let phoneNumber = args.join(' ').trim().replace(/[\s\-\(\)\+]/g, '');
  if (phoneNumber.startsWith('3') && phoneNumber.length === 10) phoneNumber = '39' + phoneNumber;

  if (!/^\d+$/.test(phoneNumber) || phoneNumber.length < 10) {
    return m.reply('*❌ Numero non valido.* Inserisci un numero con prefisso internazionale (es. 39...).');
  }

  await m.react('⏳');

  try {
    const tokenRes = await fetch('https://baron0.com/api/get-token');
    if (!tokenRes.ok) throw new Error('Token API non disponibile');
    const { token } = await tokenRes.json();

    const response = await fetch('https://baron0.com/check-number', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-page-token': token },
      body: JSON.stringify({ number: `+${phoneNumber}` }),
    });

    if (!response.ok) throw new Error('Endpoint di verifica non raggiungibile');
    const data = await response.json();

    const isBanned = data.banned || false;
    const err = data.error || {};
    
    const hasEmail = err.has_email || err.email_verified || (err.reason === 'show_email_otp') ? '✅ Collegata' : '❌ Assente';
    const hasPasskey = err.has_passkey || err.passkey_exists ? '✅ Attiva' : '❌ Assente';
    const twoFA = err.twostep_secure || err.has_2fa ? '✅ Attiva (2FA)' : '❌ Disattivata';
    
    let replyMsg = `*📱 WHATSAPP STATUS & METADATA*\n\n`;
    replyMsg += `• *Numero:* +${phoneNumber}\n`;
    replyMsg += `• *Stato:* ${isBanned ? '🔴 BANNATO' : '🟢 ATTIVO'}\n`;
    replyMsg += `• *Dettaglio:* ${err.status || 'Verified'}\n\n`;
    replyMsg += `*🔒 SICUREZZA & INFO:*\n`;
    replyMsg += `• *Email:* ${hasEmail}\n`;
    replyMsg += `• *Passkey:* ${hasPasskey}\n`;
    replyMsg += `• *Verifica 2 Passi:* ${twoFA}\n`;
    replyMsg += `• *Metodi Auth:* ${Array.isArray(err.fallback_methods) ? err.fallback_methods.join(', ') : 'sms, voice'}\n`;
    replyMsg += `• *Autoconf:* ${err.autoconf_type || 'n/a'}\n\n`;
    replyMsg += `> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`;

    await m.reply(replyMsg.trim());
    await m.react(isBanned ? '🔴' : '🟢');

  } catch (error) {
    console.error(error);
    await m.react('❌');
    m.reply(`*❌ Errore durante il controllo:* ${error.message}`);
  }
};

handler.help = ['checkban'];
handler.tags = ['tools'];
handler.command = /^(checkban|check-ban|controllabn|wa-check)$/i;

export default handler;
