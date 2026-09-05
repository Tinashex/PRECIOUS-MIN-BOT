import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "join",
    alias: ["joinme", "addbot"],
    desc: "Join a group via invite link.",
    category: "owner",
    react: "📬",
    filename: __filename
}, async (conn, mek, m, { from, q, isOwner, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isOwner) return reply("🚫 *ACCESS DENIED:* Only the Developer can use this command.");

        // 2. PARSE LINK
        if (!q) return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐥𝐢𝐧𝐤!*\nExample: .join https://chat.whatsapp.com/invitelink");

        if (!q.includes('chat.whatsapp.com/')) return reply("❌ *INVALID LINK:* Please provide a valid WhatsApp group invite link.");

        const inviteCode = q.split('chat.whatsapp.com/')[1];

        // 3. EXECUTION
        await conn.groupAcceptInvite(inviteCode);

        // 4. STYLIZED TEXT CONFIRMATION (Zero Footprint)
        const successMsg = `✔️ *𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐉𝐎𝐈𝐍𝐄𝐃* ✔️\n\n` +
            `📍 *Status:* Bot added to new group.\n` +
            `👤 *Action By:* Developer\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, { 
            text: successMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Join Command Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`⚠️ *SYSTEM ERROR:* Failed to join. The link might be expired or the bot is banned from that group.`);
    }
});
