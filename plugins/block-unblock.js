import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

// --- Block User Command ---
cmd({
    pattern: "block",
    desc: "Blocks a person",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { reply, q, isOwner, react }) => {
    try {
        // 1. Owner Security Check using standardized isOwner
        if (!isOwner) {
            await react("❌");
            return reply("Only Owner can use this command.");
        }

        let jid;
        if (m.quoted) {
            jid = m.quoted.sender; // Get from reply
        } else if (mek.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            jid = mek.message.extendedTextMessage.contextInfo.mentionedJid[0]; // Get from mention
        } else if (q && q.length > 5) {
            jid = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net"; // Get from raw number
        } else {
            await react("❌");
            return reply("Please mention a user, reply to their message, or type their number.");
        }

        await conn.updateBlockStatus(jid, "block");
        await react("✅");
        reply(`*𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 🚫 User Blocked*\n\nSuccessfully blocked @${jid.split("@")[0]}`, { mentions: [jid] });

    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        reply("Failed to block the user. Check the console for details.");
    }
});

// --- Unblock User Command ---
cmd({
    pattern: "unblock",
    desc: "Unblocks a person",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, mek, m, { reply, q, isOwner, react }) => {
    try {
        // 1. Owner Security Check
        if (!isOwner) {
            await react("❌");
            return reply("Only Owner can use this command.");
        }

        let jid;
        if (m.quoted) {
            jid = m.quoted.sender;
        } else if (mek.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            jid = mek.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (q && q.length > 5) {
            jid = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        } else {
            await react("❌");
            return reply("Please mention a user, reply to their message, or type their number.");
        }

        await conn.updateBlockStatus(jid, "unblock");
        await react("✅");
        reply(`*𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 🔓 User Unblocked*\n\nSuccessfully unblocked @${jid.split("@")[0]}`, { mentions: [jid] });

    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        reply("Failed to unblock the user.");
    }
});
