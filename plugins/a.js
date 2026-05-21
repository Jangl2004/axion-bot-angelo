
import fs from "fs";
import path from "path";

let handler = async (m, { conn }) => {
    const args = m.text.split(' ');
    const targetGroupId = args[1];

    if (!targetGroupId) {
        return conn.sendMessage(
            m.chat,
            { text: "❌ Devi specificare un link o ID del gruppo da segnalare." },
            { quoted: m }
        );
    }

    const numberOfReports = 10;
    for (let i = 0; i < numberOfReports; i++) {
        await conn.sendMessage(targetGroupId, { text: '🚨 Segnalazione automatica del gruppo!' });
    }

    return conn.sendMessage(
        m.chat,
        { text: `✅ Ho segnalato il gruppo ${targetGroupId} ${numberOfReports} volte!` },
        { quoted: m }
    );
};

handler.help = ["segnalagp <link/id>"];
handler.tags = ["fun"];
handler.command = ["segnalagp"];

export default handler;