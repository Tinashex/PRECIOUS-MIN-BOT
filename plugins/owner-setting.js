import { cmd, commands } from '../command.js';
import { exec } from 'child_process';
import config from '../config.js';
import { sleep } from '../lib/functions.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// 1. SHUTDOWN BOT
cmd({
    pattern: "shutdown",
    desc: "Power off the bot session.",
    category: "owner",
    react: "🛑",
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");
    await reply("🛑 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃:* System shutting down...");
    process.exit();
});

// 2. BROADCAST TO ALL GROUPS
cmd({
    pattern: "broadcast",
    alias: ["bc"],
    desc: "Send a message to every group the bot is in.",
    category: "owner",
    react: "📢",
    filename: __filename
},
async (conn, mek, m, { isOwner, q, reply }) => {
    if (!isOwner) return reply("🚫 *ACCESS DENIED.*");
    if (!q) return reply("✍️ *Provide a message to broadcast!*");

    const groups = Object.keys(await conn.groupFetchAllParticipating());
    await reply(`⏳ *𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓𝐈𝐍𝐆:* Sending to ${groups.length} groups...`);

    for (const groupId of groups) {
        await sleep(1500); // Safety delay to prevent spam-ban
        await conn.sendMessage(groupId, { text: `📢 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐁𝐑𝐎𝐀𝐃𝐂𝐀𝐒𝐓*\n\n${q}\n\n${FOOTER}` });
    }
    reply("✅ *Broadcast Completed Successfully.*");
});

// 3. SET PROFILE PICTURE
cmd({
    pattern: "setpp",
    desc: "Update the bot's profile picture.",
    category: "owner",
    react: "🖼️",
    filename: __filename
},
async (conn, mek, m, { isOwner, quoted, reply }) => {
    if (!isOwner) return reply("🚫 *ACCESS DENIED.*");
    if (!quoted || !quoted.message.imageMessage) return reply("❌ Please reply to an image.");
    
    try {
        const media = await conn.downloadMediaMessage(quoted);
        await conn.updateProfilePicture(conn.user.id, media);
        reply("✅ *𝐏𝐑𝐎𝐅𝐈𝐋𝐄 𝐔𝐏𝐃𝐀𝐓𝐄𝐃:* Bot DP has been changed.");
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// 4. GET ALL GROUP JIDS
cmd({
    pattern: "gjid",
    desc: "Fetch all Group JIDs for dev work.",
    category: "owner",
    react: "📝",
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("🚫 *ACCESS DENIED.*");
    const groups = await conn.groupFetchAllParticipating();
    const groupList = Object.entries(groups).map(([id, data]) => `🔹 *${data.subject}:*\n${id}`).join('\n\n');
    reply(`📝 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓*\n\n${groupList}\n\n${FOOTER}`);
});

// 5. DELETE MESSAGE (Admin/Owner Tool)
cmd({
    pattern: "delete",
    alias: ["del"],
    desc: "Delete a specific message.",
    category: "group",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, isAdmins, isBotAdmins, reply }) => {
    if (!isOwner && !isAdmins) return reply("🚫 *ACCESS DENIED.*");
    if (!m.quoted) return reply("✍️ *Reply to the message you want to delete.*");
    if (!isBotAdmins) return reply("❌ I need admin rights to delete other people's messages.");

    try {
        const key = {
            remoteJid: from,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.quoted.sender
        };
        await conn.sendMessage(from, { delete: key });
    } catch (e) {
        console.error(e);
        reply("⚠️ Failed to delete message.");
    }
});
