import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*🔍 USO:* ${usedPrefix}${command} <num/username/email>\n*Esempio:* ${usedPrefix}${command} nomeutente`);
  }

  const searchQuery = args.join(' ').trim();
  await m.react('⏳');

  try {
    const sysCommand = `python3 path/to/sherlock/sherlock.py ${searchQuery}`;
    
    const { stdout, stderr } = await execPromise(sysCommand);

    if (stderr) {
      console.error(stderr);
      await m.react('❌');
      return m.reply(`*❌ Errore durante la ricerca di "${searchQuery}":* ${stderr}`);
    }

    const results = stdout.split('\n').filter(line => line.trim() !== '');

    if (results.length === 0) {
      await m.react('❌');
      return m.reply(`*📉 Nessun risultato trovato per "${searchQuery}".*`);
    }

    let replyMsg = `*📈 RISULTATI PER "${searchQuery}":*\n\n`;

    results.forEach(result => {
      replyMsg += `• ${result}\n`;
    });

    replyMsg += `\n🔍 *Analisi Completa:* Questa ricerca ha controverificato vari servizi online.\n`;
    replyMsg += `Se hai bisogno di ulteriore assistenza o se desideri controllare altri nomi utente, non esitare a chiedere!`;

    await m.reply(replyMsg.trim());
    await m.react('✅');

  } catch (error) {
    console.error(error);
    await m.react('❌');
    return m.reply(`*❌ Errore imprevisto durante il controllo di "${searchQuery}":* ${error.message}`);
  }
};

handler.help = ['osint'];
handler.tags = ['tools'];
handler.command = /^(osint)$/i;

export default handler;
