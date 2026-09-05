import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// 1. MUTE GROUP
cmd({
    pattern: "mute",
    alias: ["lock", "groupmute"],
    react: "🔇",
    desc: "Mute the group (Admins only can message).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isOwner, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED:* Admin or Developer only.");
        if (!isBotAdmins) return reply("❌ *PERMISSION:* I need to be an Admin.");

        await conn.groupSettingUpdate(from, "announcement");
        reply(`🔇 *𝐆𝐑𝐎𝐔𝐏 𝐋𝐎𝐂𝐊𝐄𝐃*\n\nOnly admins can send messages now.\n\n${FOOTER}`);
    } catch (e) {
        console.error("Mute Error:", e);
        reply("❌ *SYSTEM ERROR:* Failed to mute group.");
    }
});

// 2. UNMUTE GROUP
cmd({
    pattern: "unmute",
    alias: ["unlock", "groupunmute"],
    react: "🔊",
    desc: "Unmute the group (Everyone can message).",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isOwner, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED.*");
        if (!isBotAdmins) return reply("❌ *PERMISSION:* I need to be an Admin.");

        await conn.groupSettingUpdate(from, "not_announcement");
        reply(`🔊 *𝐆𝐑𝐎𝐔𝐏 𝐔𝐍𝐋𝐎𝐂𝐊𝐄𝐃*\n\nEveryone can send messages now.\n\n${FOOTER}`);
    } catch (e) {
        console.error("Unmute Error:", e);
        reply("❌ *SYSTEM ERROR:* Failed to unmute group.");
    }
});
