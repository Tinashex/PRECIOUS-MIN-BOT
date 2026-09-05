import config from '../config.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "tagadmins",
    alias: ["theadmins", "adminlist"],
    desc: "Mention all group admins with a custom message.",
    category: "group",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, participants, isGroup, isAdmins, isOwner, groupMetadata, q, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        
        // Authorization: Only Admins or Developer can summon other admins
        if (!isAdmins && !isOwner) {
            return reply("🚫 *ACCESS DENIED:* Only Admins or the Developer can use this.");
        }

        // 2. DATA EXTRACTION
        const groupAdmins = participants.filter(p => p.admin);
        if (groupAdmins.length === 0) return reply("❌ No admins detected.");

        const groupName = groupMetadata.subject;
        const adminJids = groupAdmins.map(v => v.id);
        const customMessage = q || "Urgent attention required!";
        
        const emojis = ['🛡️', '⚡', '👑', '✨', '🔱', '💎'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // 3. STYLIZED TEXT UI (Zero Footprint)
        let teks = `👑 *𝐀𝐃𝐌𝐈𝐍 𝐒𝐔𝐌𝐌𝐎𝐍𝐒* 👑\n\n` +
                   `📍 *Group:* ${groupName}\n` +
                   `📝 *Message:* ${customMessage}\n` +
                   `👥 *Total Admins:* ${groupAdmins.length}\n\n` +
                   `┌───⊷ *𝐋𝐈𝐒𝐓*\n`;

        for (let admin of groupAdmins) {
            teks += `│ ${randomEmoji} @${admin.id.split('@')[0]}\n`;
        }

        teks += `└──⊷\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        // 4. EXECUTION
        await conn.sendMessage(from, { 
            text: teks, 
            mentions: adminJids,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("TagAdmins Error:", e);
        reply("⚠️ *SYSTEM ERROR:* Failed to mention admins.");
    }
});
