import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "unlockgc",
    alias: ["unlock", "open"],
    react: "🔓",
    desc: "Open the group so everyone can send messages.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isOwner, isAdmins, isBotAdmins, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED:* Admin or Developer only.");
        if (!isBotAdmins) return reply("❌ *PERMISSION:* I need to be an Admin to change settings.");

        // 2. EXECUTION (Standard Baileys setting for "Everyone can message")
        await conn.groupSettingUpdate(from, "not_announcement");

        // 3. STYLIZED CONFIRMATION
        const msg = `🔓 *𝐆𝐑𝐎𝐔𝐏 𝐔𝐍𝐋𝐎𝐂𝐊𝐄𝐃*\n\n` +
                    `All members can now send messages.\n\n` +
                    `${FOOTER}`;

        reply(msg);
    } catch (e) {
        console.error("Unlock Error:", e);
        reply("❌ *SYSTEM ERROR:* Failed to unlock the group.");
    }
});
