import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "tagall",
    alias: ["everyone", "all", "announce"],
    react: "📢",
    desc: "Tags every member in the group with a custom message.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isAdmins, isOwner, participants, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED:* Admin or Developer only.");

        // 2. METADATA PROCESSING
        const groupMetadata = await conn.groupMetadata(from).catch(() => null);
        if (!groupMetadata) return reply("❌ *ERROR:* Could not fetch group details.");

        const groupName = groupMetadata.subject;
        const totalMembers = participants.length;
        const message = q || "Attention Everyone";

        // Random emoji selection for clean aesthetics
        const emojis = ['📢', '🔔', '⚡', '📍', '🔰', '💠', '🔘', '🔊'];
        const tagEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        // 3. CONSTRUCTING THE TAG LIST
        let tagList = `📢 *𝐆𝐑𝐎𝐔𝐏 𝐀𝐍𝐍𝐎𝐔𝐍𝐂𝐄𝐌𝐄𝐍𝐓*\n\n` +
                      `👥 *Group:* ${groupName}\n` +
                      `📝 *Message:* ${message}\n` +
                      `📊 *Members:* ${totalMembers}\n\n` +
                      `┌───⊷ *𝐌𝐄𝐍𝐓𝐈𝐎𝐍𝐒*\n`;

        for (let mem of participants) {
            tagList += `│ ${tagEmoji} @${mem.id.split('@')[0]}\n`;
        }

        tagList += `└──────────────⊷\n\n${FOOTER}`;

        // 4. EXECUTION (Zero Footprint)
        await conn.sendMessage(from, { 
            text: tagList, 
            mentions: participants.map(a => a.id) 
        }, { quoted: mek });

    } catch (e) {
        console.error("TagAll Error:", e);
        reply("⚠️ *SYSTEM ERROR:* Failed to tag all members.");
    }
});
