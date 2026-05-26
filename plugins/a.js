import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*🔍 USO:* ${usedPrefix}${command} <username>\n*Esempio:* ${usedPrefix}${command} MarioRossi`);
  }

  const searchQuery = args[0].trim().replace(/[^a-zA-Z0-9_\-\.]/g, '');
  if (!searchQuery) {
    return m.reply('*❌ Errore:* Il nome utente contiene caratteri non validi. Usa solo lettere, numeri, trattini o punti.');
  }

  await m.react('⏳');

  const sherlockDir = 'path/to/sherlock'; 
  const jsonReportPath = path.join(sherlockDir, `${searchQuery}.json`);

  try {
    const sysCommand = `python3 ${path.join(sherlockDir, 'sherlock.py')} "${searchQuery}" --json --folderoutput "${sherlockDir}"`;
    
    try {
      await execPromise(sysCommand);
    } catch (execError) {
      if (!fs.existsSync(jsonReportPath)) {
        console.error(execError);
        await m.react('❌');
        return m.reply(`*❌ Errore durante l'esecuzione di Sherlock:* ${execError.message}`);
      }
    }

    if (!fs.existsSync(jsonReportPath)) {
      await m.react('❌');
      return m.reply(`*📉 Nessun account o report trovato per l'utente "${searchQuery}".*`);
    }

    const rawData = fs.readFileSync(jsonReportPath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    const targetData = jsonData[searchQuery];
    if (!targetData || !targetData.detected_sites) {
      try { fs.unlinkSync(jsonReportPath); } catch {}
      await m.react('❌');
      return m.reply(`*📉 Nessun profilo rilevato sui social network per "${searchQuery}".*`);
    }

    const sites = targetData.detected_sites;
    const totalFound = Object.keys(sites).length;

    if (totalFound === 0) {
      try { fs.unlinkSync(jsonReportPath); } catch {}
      await m.react('❌');
      return m.reply(`*📉 Nessun risultato utile per "${searchQuery}".*`);
    }

    let replyMsg = `*📈 REPORT OSINT: ${searchQuery.toUpperCase()}*\n`;
    replyMsg += `• *Target ricercato:* \`${searchQuery}\`\n`;
    replyMsg += `• *Piattaforme rilevate:* ${totalFound}\n`;
    replyMsg += `• *Data analisi:* ${new Date().toLocaleString('it-IT')}\n`;
    replyMsg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    Object.entries(sites).forEach(([siteName, siteInfo]) => {
      const url = siteInfo.url_user || siteInfo.url || 'URL non disponibile';
      replyMsg += `*🌐 ${siteName.toUpperCase()}*\n🔗 ${url}\n\n`;
    });

    replyMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    replyMsg += `> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 — REPORT COMPLETATO*`;

    try { fs.unlinkSync(jsonReportPath); } catch {}

    await m.reply(replyMsg.trim());
    await m.react('✅');

  } catch (error) {
    console.error(error);
    try { if (fs.existsSync(jsonReportPath)) fs.unlinkSync(jsonReportPath); } catch {}
    await m.react('❌');
    return m.reply(`*❌ Errore imprevisto nel modulo di ricerca:* ${error.message}`);
  }
};

handler.help = ['osint'];
handler.tags = ['tools'];
handler.command = /^(osint|sherlock)$/i;

export default handler;
