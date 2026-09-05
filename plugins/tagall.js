import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "tagall",
    alias: ["all", "mention", "tall"],
    desc: "Mentions all members in the group.",
    category: "group",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isAdmins, isOwner, reply }) => {
    try {
        // 1. SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is for groups only.");
        if (!isAdmins &&!isOwner) return reply("🚫 *ACCESS DENIED:* Only group admins or bot owner can use this.");

        // 2. GET GROUP DATA
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;

        // 3. BUILD MESSAGE
        let message = `📢 *𝐆𝐑𝐎𝐔𝐏 𝐓𝐀𝐆*\n\n`;
        message += `💬 *Message:* ${q ? q : "Attention Everyone!"}\n\n`;
        message += `👥 *Members:* ${participants.length}\n\n`;
        message += `━━━━━━━━━━━━━━\n\n`;

        let mentions = [];
        for (let mem of participants) {
            message += `➤ @${mem.id.split("@")[0]}\n`;
            mentions.push(mem.id);
        }

        message += `\n━━━━━━━━━━━━━━\n${FOOTER}`;

        // 4. SEND MESSAGE
        await conn.sendMessage(from, {
            text: message,
            mentions: mentions
        }, { quoted: mek });

    } catch (e) {
        console.error("Tagall command error:", e);
        reply("⚠️ *SYSTEM ERROR:* Failed to tag all members.");
    }
});