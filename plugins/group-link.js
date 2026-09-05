import config from '../config.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "invite",
    alias: ["glink", "grouplink", "link"],
    desc: "Fetch the group invite link securely.",
    category: "group",
    react: "🔗",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, sender, isBotAdmins, isAdmins, isOwner, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is restricted to Group Chats.");
        
        // Authorization: Only the Bot Owner, Sudo users, or Group Admins can pull the link
        if (!isOwner && !isAdmins) {
            return reply("🚫 *ACCESS DENIED:* Only Group Admins or the Developer can retrieve the link.");
        }

        // 2. BOT ADMIN VALIDATION
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR:* I need Admin rights to generate an invite link.");

        // 3. EXECUTION: FETCH LINK
        const inviteCode = await conn.groupInviteCode(from);
        if (!inviteCode) return reply("⚠️ *SYSTEM ERROR:* Could not retrieve invite code from WhatsApp servers.");

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

        // 4. STYLIZED OUTPUT (Zero Footprint)
        const responseText = `🔗 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐍𝐊* 🔗\n\n` +
            `📍 *Group:* ${from.split('@')[0]}\n` +
            `📎 *Link:* ${inviteLink}\n\n` +
            `🛡️ *Security:* Authorized by @${sender.split('@')[0]}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, {
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: responseText,
            mentions: [sender],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
                // Newsletter strictly removed
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Invite Command Error:", error);
        reply(`⚠️ *SYSTEM CRASH:* ${error.message || "Unknown internal error"}`);
    }
});
