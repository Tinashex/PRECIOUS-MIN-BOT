import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

export default (conn, ownerNumber) => {
    let statusSeen = true;
    let statusReact = true;

    cmd({
        pattern: "status-seen",
        desc: "Toggle auto-status seen",
        category: "misc",
        filename: __filename
    }, async (conn, mek, m, { from, text }) => {
        const senderNumber = (mek.key.participant || mek.key.remoteJid || '').split('@')[0];
        const isOwner = ownerNumber.includes(senderNumber) || mek.key.fromMe;
        if (!isOwner) return m.reply('❌ Only bot owner can use this');

        if (text?.toLowerCase() === 'on') statusSeen = true;
        if (text?.toLowerCase() === 'off') statusSeen = false;

        m.reply(`✅ Status Seen is now: ${statusSeen ? 'ON' : 'OFF'}`);
    });

    cmd({
        pattern: "status-react",
        desc: "Toggle auto-status react",
        category: "misc",
        filename: __filename
    }, async (conn, mek, m, { from, text }) => {
        const senderNumber = (mek.key.participant || mek.key.remoteJid || '').split('@')[0];
        const isOwner = ownerNumber.includes(senderNumber) || mek.key.fromMe;
        if (!isOwner) return m.reply('❌ Only bot owner can use this');

        if (text?.toLowerCase() === 'on') statusReact = true;
        if (text?.toLowerCase() === 'off') statusReact = false;

        m.reply(`✅ Status React is now: ${statusReact ? 'ON' : 'OFF'}`);
    });
};