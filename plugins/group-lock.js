import config from '../config.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "lock",
    alias: ["lockgc", "closegc", "mute"],
    desc: "Close the group (Admins only messaging).",
    category: "group",
    react: "🔒",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isOwner, sender, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is restricted to Group Chats.");
        
        // Authorization: Developer or Group Admins only
        if (!isOwner && !isAdmins) {
            return reply("🚫 *ACCESS DENIED:* Only Group Admins or the Developer can lock the group.");
        }

        // 2. BOT ADMIN VALIDATION
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR:* I need Admin rights to modify group settings.");

        // 3. EXECUTION: MUTE GROUP (Announcements Only)
        await conn.groupSettingUpdate(from, 'announcement');

        // 4. STYLIZED OUTPUT (Zero Footprint)
        const successMsg = `🔒 *𝐆𝐑𝐎𝐔𝐏 𝐋𝐎𝐂𝐊𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘*\n\n` +
            `📍 *Group:* ${from.split('@')[0]}\n` +
            `🛡️ *Status:* Admins Only Mode Enabled\n` +
            `👤 *Authorized:* @${sender.split('@')[0]}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, {
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: successMsg,
            mentions: [sender],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Lock Command Error:", e);
        reply("⚠️ *SYSTEM ERROR:* Failed to lock the group. Ensure I am still an admin.");
    }
});
