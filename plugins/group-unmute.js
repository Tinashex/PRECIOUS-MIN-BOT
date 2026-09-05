import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "unmute",
    alias: ["open", "groupunmute"],
    react: "🔊",
    desc: "Open the group so everyone can send messages.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isOwner, isBotAdmins, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED:* Admin or Developer only.");
        if (!isBotAdmins) return reply("❌ *PERMISSION:* I need to be an Admin to manage group settings.");

        // 2. EXECUTION
        await conn.groupSettingUpdate(from, "not_announcement");

        // 3. STYLIZED ANNOUNCEMENT
        const message = `🔊 *𝐆𝐑𝐎𝐔𝐏 𝐔𝐍𝐌𝐔𝐓𝐄𝐃*\n\n` +
                        `📍 *Status:* Everyone can now send messages.\n` +
                        `📍 *Action by:* @${mek.sender.split('@')[0]}\n\n` +
                        `${FOOTER}`;

        await conn.sendMessage(from, { 
            text: message, 
            mentions: [mek.sender] 
        }, { quoted: mek });

    } catch (e) {
        console.error("Unmute Error:", e);
        reply("⚠️ *SYSTEM ERROR:* Failed to unmute. Please try manually.");
    }
});
