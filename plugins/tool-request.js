import { cmd } from '../command.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "report",
    alias: ["bug", "request", "ask"],
    desc: "Report a bug or request a feature to the developer.",
    category: "utility",
    react: "📩",
    filename: __filename
}, async (conn, mek, m, { from, q, pushName, sender, reply }) => {
    try {
        // 1. Validation: Ensure there is a message to report
        if (!q) {
            return reply(`✍️ *Please provide a message!*\n\nExample: ${config.PREFIX}report The play command is slow.`);
        }

        const devNumber = "263781330745"; // Your WhatsApp Number
        const devJid = `${devNumber}@s.whatsapp.net`;

        // 2. Construct the Report for the Developer
        const reportToDev = `🚀 *【 𝐍𝐄𝐖 𝐑𝐄𝐏𝐎𝐑𝐓 / 𝐁𝐔𝐆 】* 🚀\n\n` +
            `👤 *User:* @${sender.split("@")[0]}\n` +
            `📝 *Message:* ${q}\n` +
            `📍 *Source:* ${from.endsWith('@g.us') ? 'Group Chat' : 'Direct Message'}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        // 3. Send the report to your DM
        await conn.sendMessage(devJid, {
            text: reportToDev,
            mentions: [sender],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

        // 4. Confirmation to the User (Zero Footprint)
        const confirmationMsg = `✅ *𝐇𝐞𝐥𝐥𝐨 ${pushName}!*\n\n` +
            `Your report has been successfully forwarded to my developer, **Watson Xd**. Please wait for a response if necessary.\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, {
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: confirmationMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Report System Error:", error);
        reply("❌ *Error:* Could not send the report. Please try again later.");
    }
});
