// plugin by Bonzino (adapted)

import { performance } from 'perf_hooks'

const sleep=ms=>new Promise(r=>setTimeout(r,ms))
const tag=jid=>'@'+String(jid||'').split('@')[0]

async function editMessage(conn,chatId,key,text,mentions=[]){
await conn.relayMessage(chatId,{
protocolMessage:{
key,
type:14,
editedMessage:{
extendedTextMessage:{
text,
contextInfo:mentions.length?{mentionedJid:mentions}:{}
}
}
}
},{})
}

let handler=async(m,{conn})=>{

const chatId=m.chat
if(!chatId)return

let destinatario=
m.quoted?.sender||
(Array.isArray(m.mentionedJid)&&m.mentionedJid[0])||
m?.message?.extendedTextMessage?.contextInfo?.participant||
m?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]||
null

if(!destinatario){
await conn.sendMessage(chatId,{
text:'*⚠️ 𝐓𝐚𝐠𝐠𝐚 𝐪𝐮𝐚𝐥𝐜𝐮𝐧𝐨 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨.*'
},{quoted:m})
return
}

const mittente=
m.sender||
m.key?.participant||
m.participant||
(m.key?.fromMe?conn?.user?.id:m.key?.remoteJid)||
''

const start=performance.now()

const sent=await conn.sendMessage(chatId,{
text:`*𝐒𝐟𝐢𝐥𝐨 𝐥𝐞 𝐦𝐮𝐭𝐚𝐧𝐝𝐢𝐧𝐞 𝐚 ${tag(destinatario)}... 𝐥𝐞 𝐥𝐚𝐛𝐛𝐫𝐚 𝐬𝐨𝐧𝐨 𝐠𝐢𝐚̀ 𝐜𝐚𝐥𝐝𝐞 𝐞 𝐛𝐚𝐠𝐧𝐚𝐭𝐞* 🤤`,
mentions:[destinatario]
},{quoted:m})

const key=sent?.key
if(!key)return

await sleep(1500)

const frames=[
'*  ( { | } )  ✌🏻*   _(*𝐢𝐧𝐢𝐳𝐢𝐨 𝐚 𝐬𝐭𝐢𝐦𝐨𝐥𝐚𝐫𝐞 𝐥𝐚 𝐜𝐥𝐢𝐭𝐨𝐫𝐢𝐝𝐞...*)_',
'*  ( { ✌🏻 } )*   _(*𝐥𝐞 𝐝𝐢𝐭𝐚 𝐬𝐜𝐢𝐯𝐨𝐥𝐚𝐧𝐨 𝐝𝐞𝐧𝐭𝐫𝐨...*)_',
'*  ( { | } )💦 ✌🏻*   _(*𝐞𝐬𝐜𝐨... 𝐜𝐨𝐥𝐚 𝐢𝐥 𝐩𝐫𝐢𝐦𝐨 𝐬𝐮𝐜𝐜𝐨...*)_',
'*  ( { ✌🏻💦 } )*   _(*𝐬𝐩𝐢𝐧𝐠𝐨 𝐩𝐢𝐮̀ 𝐚 𝐟𝐨𝐧𝐝𝐨, 𝐚𝐡𝐡...*)_',
'*  ( { | } )💦💦 ✌🏻*   _(*𝐥𝐚 𝐟𝐢𝐠𝐚 𝐞̀ 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐦𝐞𝐧𝐭𝐞 𝐟𝐫𝐚𝐝𝐢𝐜𝐢𝐚...*)_',
'*  ( { ✌🏻🔥 } )*   _(*𝐫𝐢𝐭𝐦𝐨 𝐬𝐞𝐫𝐫𝐚𝐭𝐨, 𝐥𝐚 𝐬𝐭𝐫𝐢𝐧𝐠𝐨 𝐟𝐨𝐫𝐭𝐞...*)_',
'*🥵 ( { ✌🏻🌊 } )*   _(*𝐀𝐍𝐈𝐌𝐀 𝐈𝐋 𝐁𝐀𝐂𝐈𝐍𝐎, 𝐒𝐓𝐀 𝐕𝐄𝐍𝐄𝐍𝐃𝐎!!*)_',
'*💦 ( { | } ) 🌊🌊 💦*'
]

for(const f of frames){
await editMessage(conn,chatId,key,f,[destinatario])
const randomDelay=Math.floor(Math.random()*(600-200+1))+200
await sleep(randomDelay)
}

const end=performance.now()
const elapsed=((end-start)/1000).toFixed(2)

await editMessage(
conn,
chatId,
key,
`*🤤 𝐒𝐪𝐮𝐢𝐫𝐭𝐚 𝐥'𝐢𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞!! 🌊💦*\n\n${tag(mittente)} *𝐡𝐚 𝐥𝐞𝐭𝐭𝐞𝐫𝐚𝐥𝐦𝐞𝐧𝐭𝐞 𝐚𝐥𝐥𝐚𝐠𝐚𝐭𝐨 𝐥𝐚 𝐟𝐢𝐠𝐚 𝐝𝐢 ${tag(destinatario)} 𝐦𝐮𝐨𝐯𝐞𝐧𝐝𝐨 𝐥𝐞 𝐝𝐢𝐭𝐚 𝐚 𝐭𝐞𝐦𝐩𝐨 𝐫𝐞𝐜𝐨𝐫𝐝, 𝐟𝐚𝐜𝐞𝐧𝐝𝐨𝐥𝐚 𝐠𝐨𝐝𝐞𝐫𝐞 𝐞 𝐬𝐩𝐫𝐮𝐳𝐳𝐚𝐫𝐞 𝐨𝐯𝐮𝐧𝐪𝐮𝐞 𝐢𝐧 𝐬𝐨𝐥𝐢 ${elapsed} 𝐬𝐞𝐜𝐨𝐧𝐝𝐢! 🥵🔥🌊*`,
[mittente,destinatario]
)
}

handler.help=['ditalino @utente']
handler.tags=['fun']
handler.command=['ditalino','dtrd']
handler.group=true

export default handler