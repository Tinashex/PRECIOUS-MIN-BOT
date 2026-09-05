import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "add",
    alias: ["invite"],
    desc: "Adds a member to the group.",
    category: "group",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isAdmins, isOwner, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* This command is for groups only.");
        if (!isAdmins &&!isOwner) return reply("🚫 *ACCESS DENIED:* Only group admins can use this.");
        if (!isBotAdmins) return reply("❌ *PERMISSION:* I need to be an admin to add members.");

        if (!q) return reply("✍️ *USAGE:* `.add 263xxxxxxxxx`");

        const number = q.replace(/[^0-9]/g, '');
        const user = `${number}@s.whatsapp.net`;

        if (number.length < 10) return reply("❌ *ERROR:* Invalid phone number.");

        await conn.groupParticipantsUpdate(from, [user], "add");
        await conn.sendMessage(from, {
            text: `✅ *𝐌𝐄𝐌𝐁𝐄𝐑 𝐀𝐃𝐃𝐄𝐃*\n\n📍 *Number:* @${number}\n📍 *Status:* Added to group\n${FOOTER}`,
            mentions: [user]
        }, { quoted: mek });

    } catch (e) {
        console.error("Add error:", e);
        reply("⚠️ *ERROR:* Failed to add. User might have privacy or already in group.");
    }
});