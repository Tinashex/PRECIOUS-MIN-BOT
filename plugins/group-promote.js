import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "promote",
    alias: ["p", "admin", "makeadmin"],
    desc: "Promotes a member to group admin status.",
    category: "group",
    react: "⬆️",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isAdmins, isOwner, isBotAdmins, botNumber, reply }) => {
    try {
        // 1. SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is for groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED:* Only group admins or bot owner can use this.");

        if (!isBotAdmins) return reply("❌ *PERMISSION:* I need to be an admin to promote members. Please promote me first.");

        // 2. TARGET IDENTIFICATION
        let target;
        if (m.quoted) {
            target = m.quoted.sender;
        } else if (q && q.includes("@")) {
            const num = q.replace(/[^0-9]/g, '');
            target = `${num}@s.whatsapp.net`;
        } else {
            return reply("✍️ *USAGE:*\nReply to a message or mention a user to promote.");
        }

        const number = target.split("@")[0];

        // 3. SAFETY CHECKS
        if (target === botNumber) return reply("❌ I am already an admin.");
        if (target === m.sender) return reply("❌ You cannot promote yourself.");

        // 4. EXECUTION
        try {
            await conn.groupParticipantsUpdate(from, [target], "promote");

            // 5. CONFIRMATION MESSAGE
            await conn.sendMessage(from, { 
                text: `✅ *𝐀𝐃𝐌𝐈𝐍 𝐏𝐑𝐎𝐌𝐎𝐓𝐄𝐃*\n\n📍 *User:* @${number}\n📍 *Status:* Group Administrator\n\n${FOOTER}`,
                mentions: [target]
            }, { quoted: mek });
        } catch (err) {
            console.error("Promote execution error:", err);
            reply("⚠️ *ERROR:* Failed to promote. Make sure I have admin rights and the target is in the group.");
        }

    } catch (e) {
        console.error("Promote command error:", e);
        reply("⚠️ *SYSTEM ERROR:* Something went wrong while executing the promote command.");
    }
});