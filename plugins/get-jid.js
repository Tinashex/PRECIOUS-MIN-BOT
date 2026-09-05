import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],  
    desc: "Get full JID of the current chat, user, or quoted person.",
    category: "utility",
    react: "🆔",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, isCreator, reply, sender }) => {
    try {
        // 1. Security Check
        if (!isCreator) {
            return reply("🚫 *Access Denied!* This utility is restricted to my developer.");
        }

        // 2. Logic to handle Quoted, Group, or Direct JID
        let targetJid;
        let typeLabel;

        if (m.quoted) {
            // Get JID of the person you replied to
            targetJid = m.quoted.sender;
            typeLabel = "👤 *Quoted User JID*";
        } else if (isGroup) {
            // Get current Group JID
            targetJid = from;
            typeLabel = "👥 *Group Chat JID*";
        } else {
            // Get your own JID in DMs
            targetJid = sender;
            typeLabel = "👤 *Your User JID*";
        }

        // 3. Formatting Output
        const responseText = `${typeLabel}:\n\n` +
                             `\`\`\`${targetJid}\`\`\`\n\n` +
                             `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        // 4. Send the message (Zero Newsletter/Forward Metadata)
        await conn.sendMessage(from, { text: responseText }, { quoted: mek });

    } catch (e) {
        console.error("JID Command Error:", e);
        reply(`❌ Internal Error: ${e.message}`);
    }
});
