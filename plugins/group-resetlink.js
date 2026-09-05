import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "revoke",
    alias: ["revokelink", "resetlink", "resetglink", "newlink"],
    desc: "Reset the group invite link instantly.",
    category: "group",
    react: "🖇️",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isOwner, sender, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is restricted to Group Chats.");
        
        // Authorization: Developer or Group Admins only
        if (!isOwner && !isAdmins) {
            return reply("🚫 *ACCESS DENIED:* Only Group Admins or the Developer can reset the link.");
        }

        // 2. BOT ADMIN VALIDATION
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR:* I need Admin rights to revoke the group link.");

        // 3. EXECUTION: REVOKE LINK
        await conn.groupRevokeInvite(from);

        // 4. STYLIZED TEXT CONFIRMATION (Zero Footprint)
        const successMsg = `🖇️ *𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐍𝐊 𝐑𝐄𝐕𝐎𝐊𝐄𝐃* 🖇️\n\n` +
            `📍 *Group:* ${from.split('@')[0]}\n` +
            `✅ *Status:* Old link expired, new link generated.\n` +
            `👤 *Action By:* @${sender.split('@')[0]}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, { 
            text: successMsg, 
            mentions: [sender],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
                // Newsletter metadata strictly removed
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Revoke Link Error:", e);
        reply("⚠️ *SYSTEM ERROR:* Failed to reset group link. Ensure I am still an admin.");
    }
});
