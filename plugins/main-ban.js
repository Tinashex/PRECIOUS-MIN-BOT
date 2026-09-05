import fs from 'fs';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const BAN_FILE = "./lib/ban.json";
const DEV_NUMBER = "263781330745@s.whatsapp.net"; // Watson XT Protection

// Ensure ban file exists to prevent crashes
if (!fs.existsSync(BAN_FILE)) {
    fs.writeFileSync(BAN_FILE, JSON.stringify([]));
}

// 1. BAN USER
cmd({
    pattern: "ban",
    alias: ["blockuser", "addban"],
    desc: "Ban a user from using the bot.",
    category: "owner",
    react: "⛔",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("🚫 *ACCESS DENIED:* Developer Only.");

        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : null);

        if (!target) return reply("✍️ *How to use:* \nReply to a user, tag them, or type their number.");
        
        // UNTOUCHABLE PROTECTION
        if (target === DEV_NUMBER) return reply("❌ *CRITICAL ERROR:* I am programmed to never ban my Developer.");
        if (target.includes(conn.user.id.split(':')[0])) return reply("❌ I cannot ban myself.");

        let banned = JSON.parse(fs.readFileSync(BAN_FILE, "utf-8"));
        if (banned.includes(target)) return reply("ℹ️ This user is already in the ban list.");

        banned.push(target);
        fs.writeFileSync(BAN_FILE, JSON.stringify([...new Set(banned)], null, 2));

        const msg = `⛔ *𝐔𝐒𝐄𝐑 𝐁𝐀𝐍𝐍𝐄𝐃* ⛔\n\n` +
                    `👤 *User:* @${target.split('@')[0]}\n` +
                    `🚫 *Status:* Access Revoked\n\n` +
                    `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`;

        await conn.sendMessage(from, { text: msg, mentions: [target] }, { quoted: mek });

    } catch (err) {
        reply("⚠️ *SYSTEM ERROR:* " + err.message);
    }
});

// 2. UNBAN USER
cmd({
    pattern: "unban",
    alias: ["removeban"],
    desc: "Restore bot access to a user.",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("🚫 *ACCESS DENIED.*");

        let target = m.mentionedJid?.[0] 
            || (m.quoted?.sender ?? null)
            || (args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : null);

        if (!target) return reply("✍️ *Tag or reply* to the user you want to unban.");

        let banned = JSON.parse(fs.readFileSync(BAN_FILE, "utf-8"));
        if (!banned.includes(target)) return reply("ℹ️ This user is not currently banned.");

        const updated = banned.filter(u => u !== target);
        fs.writeFileSync(BAN_FILE, JSON.stringify(updated, null, 2));

        const msg = `✅ *𝐔𝐒𝐄𝐑 𝐔𝐍𝐁𝐀𝐍𝐍𝐄𝐃* ✅\n\n` +
                    `👤 *User:* @${target.split('@')[0]}\n` +
                    `🔓 *Status:* Access Restored\n\n` +
                    `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`;

        await conn.sendMessage(from, { text: msg, mentions: [target] }, { quoted: mek });

    } catch (err) {
        reply("⚠️ *SYSTEM ERROR.*");
    }
});

// 3. LIST BANNED USERS
cmd({
    pattern: "listban",
    alias: ["banlist"],
    desc: "View all restricted users.",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("🚫 *ACCESS DENIED.*");

        let banned = JSON.parse(fs.readFileSync(BAN_FILE, "utf-8"));
        if (banned.length === 0) return reply("✅ *𝐒𝐓𝐀𝐓𝐔𝐒:* No users are currently banned.");

        let msg = `📋 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐁𝐀𝐍 𝐋𝐈𝐒𝐓*\n\n`;
        banned.forEach((id, i) => {
            msg += `│ ${i + 1}. @${id.split('@')[0]}\n`;
        });
        msg += `\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, { text: msg, mentions: banned }, { quoted: mek });
    } catch (err) {
        reply("⚠️ *SYSTEM ERROR.*");
    }
});
