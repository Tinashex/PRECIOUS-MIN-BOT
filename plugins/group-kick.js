import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "kick",
    alias: ["remove", "out", "k"],
    desc: "Removes a member from the group.",
    category: "group",
    react: "👢",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isAdmins, isOwner, isBotAdmins, botNumber, reply }) => {
    try {
        // 1. SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is for groups only.");
        if (!isAdmins &&!isOwner) return reply("🚫 *ACCESS DENIED:* Only group admins or bot owner can use this.");
        if (!isBotAdmins) return reply("❌ *PERMISSION:* I need to be an admin to kick members. Please promote me first.");

        // 2. TARGET IDENTIFICATION
        let target;
        if (m.quoted) {
            target = m.quoted.sender;
        } else if (q && q.includes("@")) {
            const num = q.replace(/[^0-9]/g, '');
            target = `${num}@s.whatsapp.net`;
        } else {
            return reply("✍️ *USAGE:*\nReply to a message or mention a user to kick.");
        }

        const number = target.split("@")[0];

        // 3. SAFETY CHECKS
        if (target === botNumber) return reply("❌ You cannot kick me.");
        if (target === m.sender) return reply("❌ You cannot kick yourself.");

        // Check if target is admin
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const targetData = participants.find(p => p.id === target);
        if (targetData?.admin) return reply("❌ Cannot kick an admin. Demote them first.");

        // 4. EXECUTION
        try {
            await conn.groupParticipantsUpdate(from, [target], "remove");

            // 5. CONFIRMATION MESSAGE
            await conn.sendMessage(from, {
                text: `👢 *𝐌𝐄𝐌𝐁𝐄𝐑 𝐑𝐄𝐌𝐎𝐕𝐄𝐃*\n\n📍 *User:* @${number}\n📍 *Action:* Kicked from group\n\n${FOOTER}`,
                mentions: [target]
            }, { quoted: mek });
        } catch (err) {
            console.error("Kick execution error:", err);
            reply("⚠️ *ERROR:* Failed to kick. Make sure I have admin rights.");
        }

    } catch (e) {
        console.error("Kick command error:", e);
        reply("⚠️ *SYSTEM ERROR:* Something went wrong while executing the kick command.");
    }
});