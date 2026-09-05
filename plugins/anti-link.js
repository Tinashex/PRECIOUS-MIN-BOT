import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// Database to store antilink status
let antilinkDB = {};

cmd({
    pattern: "antilink",
    alias: ["alink"],
    desc: "Turn on/off anti group link.",
    category: "group",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, args, isGroup, isAdmins, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* This command is for groups only.");
        if (!isAdmins &&!isOwner) return reply("🚫 *ACCESS DENIED:* Only group admins can use this.");

        const option = args[0]?.toLowerCase();
        if (!option) return reply("✍️ *USAGE:*\n`.antilink on`\n`.antilink off`\n\n*Current:* " + (antilinkDB[from]? "ON ✅" : "OFF ❌"));

        if (option === "on") {
            antilinkDB[from] = true;
            reply(`🚫 *ANTILINK ENABLED*\n\nI will now delete all group links.\n${FOOTER}`);
        }
        else if (option === "off") {
            antilinkDB[from] = false;
            reply(`✅ *ANTILINK DISABLED*\n\nGroup links are now allowed.\n${FOOTER}`);
        }
        else {
            reply("❌ *ERROR:* Use `on` or `off`");
        }

    } catch (e) {
        console.error("Antilink toggle error:", e);
        reply("⚠️ *ERROR:* Something went wrong.");
    }
});

// AUTO DELETE EVENT - Put this below or in events.js
cmd({
    on: "body"
},
async (conn, mek, m, { from, body, isGroup, isAdmins, isBotAdmins }) => {
    try {
        if (!isGroup) return;
        if (!antilinkDB[from]) return;
        if (!isBotAdmins) return;
        if (isAdmins) return; // Don't delete admin messages

        const linkRegex = /chat\.whatsapp\.com\/[A-Za-z0-9]{20,24}/i;
        if (linkRegex.test(body)) {
            await conn.sendMessage(from, { delete: mek.key });
            await conn.sendMessage(from, {
                text: `🚫 *LINK DELETED*\n\n@${m.sender.split("@")[0]} Sending group links is not allowed here.\n${FOOTER}`,
                mentions: [m.sender]
            });
        }
    } catch (e) {
        console.error("Antilink event error:", e);
    }
});