import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// Database to store welcome status
let welcomeDB = {};

cmd({
    pattern: "welcome",
    alias: ["wlcm"],
    desc: "Turn on/off welcome message.",
    category: "group",
    react: "👋",
    filename: __filename
},
async (conn, mek, m, { from, args, isGroup, isAdmins, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* This command is for groups only.");
        if (!isAdmins &&!isOwner) return reply("🚫 *ACCESS DENIED:* Only group admins can use this.");

        const option = args[0]?.toLowerCase();
        if (!option) return reply("✍️ *USAGE:*\n`.welcome on`\n`.welcome off`\n\n*Current:* " + (welcomeDB[from]? "ON ✅" : "OFF ❌"));

        if (option === "on") {
            welcomeDB[from] = true;
            reply(`👋 *WELCOME ENABLED*\n\nI will now welcome new members.\n${FOOTER}`);
        }
        else if (option === "off") {
            welcomeDB[from] = false;
            reply(`❌ *WELCOME DISABLED*\n\nNo more welcome messages.\n${FOOTER}`);
        }
        else {
            reply("❌ *ERROR:* Use `on` or `off`");
        }

    } catch (e) {
        console.error("Welcome toggle error:", e);
        reply("⚠️ *ERROR:* Something went wrong.");
    }
});

// AUTO WELCOME EVENT
cmd({
    on: "group-participants.add"
},
async (conn, update) => {
    try {
        const { id, participants } = update;
        if (!welcomeDB[id]) return;

        const groupMetadata = await conn.groupMetadata(id);
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || "No description";

        for (let user of participants) {
            const number = user.split("@")[0];
            const ppUrl = await conn.profilePictureUrl(user, 'image').catch(() => 'https://i.ibb.co/Zm6YFhW/avatar.png');

            const welcomeMsg = {
                image: { url: ppUrl },
                caption: `👋 *𝐖𝐄𝐋𝐂𝐎𝐌𝐄*\n\n🆕 *New Member:* @${number}\n📍 *Group:* ${groupName}\n👥 *Members:* ${groupMetadata.participants.length}\n\n📜 *Description:*\n${groupDesc}\n\nEnjoy your stay! ${FOOTER}`,
                mentions: [user],
                buttons: [
                    { buttonId: '.menu', buttonText: { displayText: '📜 MENU' }, type: 1 },
                    { buttonId: '.rules', buttonText: { displayText: '📋 RULES' }, type: 1 }
                ],
                headerType: 4
            };

            await conn.sendMessage(id, welcomeMsg);
        }
    } catch (e) {
        console.error("Welcome event error:", e);
    }
});

// AUTO GOODBYE EVENT
cmd({
    on: "group-participants.remove"
},
async (conn, update) => {
    try {
        const { id, participants } = update;
        if (!welcomeDB[id]) return;

        for (let user of participants) {
            const number = user.split("@")[0];
            await conn.sendMessage(id, {
                text: `👋 *𝐆𝐎𝐎𝐃𝐁𝐘𝐄*\n\n@${number} has left the group.\nWe will miss you! ${FOOTER}`,
                mentions: [user]
            });
        }
    } catch (e) {
        console.error("Goodbye event error:", e);
    }
});