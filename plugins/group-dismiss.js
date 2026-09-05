import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "demote",
    alias: ["d", "unadmin"],
    desc: "Demote an admin to a normal member.",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isBotAdmins, isAdmins, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isOwner && !isAdmins) return reply("🚫 *ACCESS DENIED.*");
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR.*");

        let target = m.quoted ? m.quoted.sender : (m.mentionedJid ? m.mentionedJid[0] : null);
        if (!target && q) target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

        if (!target) return reply("✍️ *Tag or reply* to the admin.");

        await conn.groupParticipantsUpdate(from, [target], "demote");

        const successMsg = `⬇️ *𝐀𝐃𝐌𝐈𝐍 𝐃𝐄𝐌𝐎𝐓𝐄𝐃*\n\n` +
            `👤 *User:* @${target.split('@')[0]}\n` +
            `✅ *Status:* Member\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, { text: successMsg, mentions: [target] }, { quoted: mek });
    } catch (e) {
        reply("⚠️ *SYSTEM ERROR:* Failed to demote.");
    }
});
