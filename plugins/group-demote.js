import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃";

cmd({
    pattern: "demote",
    alias: ["d", "removeadmin"],
    desc: "Demotes a group admin to member.",
    category: "group",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isAdmins, isOwner, isBotAdmins, botNumber, reply }) => {
    try {
        // 1. SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is for groups only.");
        if (!isAdmins &&!isOwner) return reply("🚫 *ACCESS DENIED:* Only group admins or bot owner can use this.");
        if (!isBotAdmins) return reply("❌ *PERMISSION:* I need to be an admin to demote members. Please promote me first.");

        // 2. TARGET IDENTIFICATION
        let target;
        if (m.quoted) {
            target = m.quoted.sender;
        } else if (q && q.includes("@")) {
            const num = q.replace(/[^0-9]/g, '');
            target = `${num}@s.whatsapp.net`;
        } else {
            return reply("✍️ *USAGE:*\nReply to a message or mention a user to demote.");
        }

        const number = target.split("@")[0];

        // 3. SAFETY CHECKS
        if (target === botNumber) return reply("❌ You cannot demote me.");
        if (target === m.sender) return reply("❌ You cannot demote yourself.");

        // 4. EXECUTION
        try {
            await conn.groupParticipantsUpdate(from, [target], "demote");

            // 5. CONFIRMATION MESSAGE
            await conn.sendMessage(from, {
                text: `✅ *𝐀𝐃𝐌𝐈𝐍 𝐃𝐄𝐌𝐎𝐓𝐄𝐃*\n\n📍 *User:* @${number}\n📍 *Status:* Group Member\n${FOOTER}`,
                mentions: [target]
            }, { quoted: mek });
        } catch (err) {
            console.error("Demote execution error:", err);
            reply("⚠️ *ERROR:* Failed to demote. Make sure I have admin rights and the target is an admin.");
        }

    } catch (e) {
        console.error("Demote command error:", e);
        reply("⚠️ *SYSTEM ERROR:* Something went wrong while executing the demote command.");
    }
});