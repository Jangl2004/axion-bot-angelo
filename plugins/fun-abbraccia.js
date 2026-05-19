// abbraccia by Bonzino

const norm=jid=>String(jid||'').split(':')[0].replace('@c.us','@s.whatsapp.net')
const tag=(jid='')=>'@'+String(jid).split('@')[0].split(':')[0]

function buildContextMsg(title){
return{
key:{participant:'0@s.whatsapp.net',fromMe:false,id:'CTX'},
message:{locationMessage:{name:title}},
participant:'0@s.whatsapp.net'
}
}

function resolveTarget(m,text='',botJid=''){
const ctx=m.message?.extendedTextMessage?.contextInfo||{}
const raw=String(text||'').trim()
const numero=raw.replace(/[^\d]/g,'')
if(numero.length>=5)return`${numero}@s.whatsapp.net`
if(raw.endsWith('@s.whatsapp.net')||raw.endsWith('@c.us'))return norm(raw)
if(Array.isArray(m.mentionedJid)&&m.mentionedJid.length)return norm(m.mentionedJid[0])
if(Array.isArray(ctx.mentionedJid)&&ctx.mentionedJid.length)return norm(ctx.mentionedJid[0])
const quotedSender=m.quoted?.sender||m.quoted?.participant||ctx.participant
if(quotedSender&&norm(quotedSender)!==norm(botJid))return norm(quotedSender)
return null
}

let handler=async(m,{conn,text,usedPrefix,command})=>{
const chat=m.chat||m.key?.remoteJid
if(!chat)return

global.db.data.hug||={}

const sender=norm(m.sender||m.key?.participant||m.participant||(m.key?.fromMe?conn?.user?.id:''))
const botJid=norm(conn.user?.jid||conn.user?.id||'')
const target=resolveTarget(m,text,botJid)
const q=buildContextMsg('🤗 𝐀𝐁𝐁𝐑𝐀𝐂𝐂𝐈𝐎')

if(!target)return conn.sendMessage(chat,{
text:`*⚠️ 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐪𝐮𝐚𝐥𝐜𝐮𝐧𝐨 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐩𝐞𝐫 𝐚𝐛𝐛𝐫𝐚𝐜𝐜𝐢𝐚𝐫𝐥𝐨 🤗*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix}${command} @utente*`,
contextInfo:global.rcanal?.contextInfo||{}
},{quoted:q})

if(target===sender)return conn.sendMessage(chat,{
text:`*🤗 ${tag(sender)} 𝐬𝐢 è 𝐚𝐛𝐛𝐫𝐚𝐜𝐜𝐢𝐚𝐭𝐨 𝐝𝐚 𝐬𝐨𝐥𝐨 🫂*`,
contextInfo:{...(global.rcanal?.contextInfo||{}),mentionedJid:[sender]},
mentions:[sender]
},{quoted:q})

const previousHug=global.db.data.hug[sender]

if(previousHug&&previousHug===target)delete global.db.data.hug[sender]
else global.db.data.hug[target]=sender

const senderNumero=String(sender).split('@')[0].split(':')[0]

await conn.sendMessage(chat,{
text:`*🤗 ${tag(sender)} 𝐡𝐚 𝐚𝐛𝐛𝐫𝐚𝐜𝐜𝐢𝐚𝐭𝐨 ${tag(target)} 🫂*`,
contextInfo:{...(global.rcanal?.contextInfo||{}),mentionedJid:[sender,target]},
mentions:[sender,target],
buttons:[{
buttonId:`${usedPrefix}${command} ${senderNumero}`,
buttonText:{displayText:'🫂 Ricambia l’abbraccio'},
type:1
}],
headerType:1
},{quoted:q})
}

handler.help=['abbraccia @utente']
handler.tags=['fun']
handler.command=['abbraccia','abbraccio','hug']
handler.group=true

export default handler