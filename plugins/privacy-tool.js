import { cmd } from '../command.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// 1. PRIVACY SETTINGS MENU
cmd({
    pattern: "privacy",
    alias: ["privacymenu"],
    desc: "Access account privacy & profile configuration.",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, mek, m, { from, reply }) => {
    try {
        let privacyMenu = `╭━━〔 *𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐏𝐑𝐈𝐕𝐀𝐂𝐘* 〕━━┈⊷
┃
┃ 🛡️ *𝐂𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐭𝐢𝐨𝐧𝐬:*
┃ • .blocklist - View blocked users
┃ • .getbio - Get user's about info
┃ • .setppall - Profile pic visibility
┃ • .setonline - Online status privacy
┃ • • .groupsprivacy - Group add privacy
┃ • .getprivacy - View current settings
┃
┃ 👤 *𝐏𝐫𝐨𝐟𝐢𝐥𝐞 𝐌𝐚𝐧𝐚𝐠𝐞𝐦𝐞𝐧𝐭:*
┃ • .setpp - Update bot profile picture
┃ • .setmyname - Update bot display name
┃ • .updatebio - Update bot status/bio
┃ • .getpp - Fetch a user's profile pic
┃
┃ ⚙️ *𝐏𝐚𝐫𝐚𝐦𝐞𝐭𝐞𝐫𝐬:*
┃ [all, contacts, none, match_last_seen]
┃
╰──────────────┈⊷
*Note:* These commands require Owner access.`;

        await conn.sendMessage(from, {
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: privacyMenu,
            contextInfo: {
                externalAdReply: {
                    title: "𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘",
                    body: "𝐀𝐜𝐜𝐨𝐮𝐧𝐭 & 𝐏𝐫𝐢𝐯𝐚𝐜𝐲 𝐂𝐨𝐧𝐭𝐫𝐨𝐥",
                    mediaType: 1,
                    sourceUrl: "https://github.com/watson-dev1"
                }
            }
        }, { quoted: mek });
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// 2. BLOCKLIST VIEWER
cmd({
    pattern: "blocklist",
    desc: "View blocked users.",
    category: "privacy",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("❌ *𝐎𝐰𝐧𝐞𝐫 𝐎𝐧𝐥𝐲 𝐂𝐨𝐦𝐦𝐚𝐧𝐝*");
    try {
        const blocked = await conn.fetchBlocklist();
        if (!blocked.length) return reply("✅ *𝐘𝐨𝐮𝐫 𝐛𝐥𝐨𝐜𝐤 𝐥𝐢𝐬𝐭 𝐢𝐬 𝐜𝐥𝐞𝐚𝐧.*");
        
        let list = `📋 *𝐁𝐋𝐎𝐂𝐊𝐄𝐃 𝐔𝐒𝐄𝐑𝐒 (${blocked.length})*\n\n`;
        blocked.forEach((user, i) => {
            list += `${i + 1}. @${user.split('@')[0]}\n`;
        });
        reply(list);
    } catch (err) {
        reply(`❌ Error: ${err.message}`);
    }
});

// 3. PROFILE VISIBILITY (PP)
cmd({
    pattern: "setppall",
    desc: "Update Profile Picture Privacy.",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    const value = args[0] || 'all';
    if (!['all', 'contacts', 'contact_blacklist', 'none'].includes(value)) return reply("❌ Invalid value.");
    await conn.updateProfilePicturePrivacy(value);
    reply(`✅ Profile Privacy set to: *${value}*`);
});

// 4. ONLINE STATUS PRIVACY
cmd({
    pattern: "setonline",
    desc: "Update Online Privacy.",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    const value = args[0] || 'all';
    if (!['all', 'match_last_seen'].includes(value)) return reply("❌ Use 'all' or 'match_last_seen'.");
    await conn.updateOnlinePrivacy(value);
    reply(`✅ Online Privacy set to: *${value}*`);
});

// 5. UPDATE BOT PROFILE PICTURE
cmd({
    pattern: "setpp",
    desc: "Change bot profile picture.",
    category: "privacy",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { isOwner, quoted, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    if (!quoted || !quoted.message.imageMessage) return reply("❌ Reply to an image!");
    try {
        const buffer = await quoted.download();
        await conn.updateProfilePicture(conn.user.jid, buffer);
        reply("🖼️ *𝐏𝐫𝐨𝐟𝐢𝐥𝐞 𝐏𝐢𝐜𝐭𝐮𝐫𝐞 𝐔𝐩𝐝𝐚𝐭𝐞𝐝.*");
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// 6. UPDATE BOT NAME
cmd({
    pattern: "setmyname",
    desc: "Update bot display name.",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { isOwner, args, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    const newName = args.join(" ");
    if (!newName) return reply("✍️ Provide a name.");
    try {
        await conn.updateProfileName(newName);
        reply(`✅ Name updated to: *${newName}*`);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// 7. FETCH PRIVACY SUMMARY
cmd({
    pattern: "getprivacy",
    desc: "Check all current privacy settings.",
    category: "privacy",
    filename: __filename
}, async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return reply("❌ Owner only!");
    try {
        const s = await conn.fetchPrivacySettings?.(true);
        if (!s) return reply("❌ Failed to fetch.");
        let msg = `🛡️ *𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐏𝐑𝐈𝐕𝐀𝐂𝐘 𝐒𝐓𝐀𝐓𝐔𝐒*\n\n` +
                  `👤 *Profile:* ${s.profile}\n` +
                  `👁️ *Last Seen:* ${s.last}\n` +
                  `🟢 *Online:* ${s.online}\n` +
                  `💬 *Read Receipts:* ${s.readreceipts}\n` +
                  `👥 *Group Add:* ${s.groupadd}\n\n${FOOTER}`;
        reply(msg);
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    }
});

// 8. FETCH USER PROFILE PIC
cmd({
    pattern: "getpp",
    desc: "Get profile pic of a user.",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { quoted, sender, reply }) => {
    try {
        const target = quoted ? quoted.sender : sender;
        const url = await conn.profilePictureUrl(target, "image").catch(() => null);
        if (!url) return reply("❌ No public profile picture found.");
        await conn.sendMessage(m.chat, { image: { url }, caption: FOOTER }, { quoted: mek });
    } catch (e) {
        reply("❌ Error fetching image.");
    }
});
