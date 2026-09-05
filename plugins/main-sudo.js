import fs from 'fs';
import path from 'path';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER_PATH = path.join(__dirname, "../lib/sudo.json");
const LIB_PATH = path.join(__dirname, "../lib");
const IMG_URL = "https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png";

// Ensure the sudo system directory and file exist
if (!fs.existsSync(LIB_PATH)) fs.mkdirSync(LIB_PATH);
if (!fs.existsSync(OWNER_PATH)) fs.writeFileSync(OWNER_PATH, JSON.stringify([]));

const getOwners = () => JSON.parse(fs.readFileSync(OWNER_PATH, "utf-8"));
const saveOwners = (data) => fs.writeFileSync(OWNER_PATH, JSON.stringify(data, null, 2));

// 1. ADD SUDO
cmd({
    pattern: "setsudo",
    alias: ["addsudo", "addowner"],
    desc: "Add a temporary owner/sudo user.",
    category: "owner",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("🚫 *Access Denied:* Developer Only.");

        let target = m.mentionedJid?.[0] || m.quoted?.sender || (args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : null);
        if (!target) return reply("✍️ *Tag, reply, or provide a number* to grant sudo rights.");

        let owners = getOwners();
        if (owners.includes(target)) return reply("ℹ️ This user already has sudo rights.");

        owners.push(target);
        saveOwners([...new Set(owners)]);

        const successMsg = `✅ *𝐒𝐔𝐃𝐎 𝐀𝐃𝐃𝐄𝐃*\n\n` +
            `👤 *User:* @${target.split('@')[0]}\n` +
            `🛡️ *Status:* Granted Temporary Owner\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, {
            image: { url: IMG_URL },
            caption: successMsg,
            mentions: [target],
            contextInfo: { forwardingScore: 999, isForwarded: true }
        }, { quoted: mek });

    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});

// 2. REMOVE SUDO
cmd({
    pattern: "delsudo",
    alias: ["delowner", "removesudo"],
    desc: "Remove a temporary owner.",
    category: "owner",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("🚫 *Access Denied:* Developer Only.");

        let target = m.mentionedJid?.[0] || m.quoted?.sender || (args[0] ? args[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : null);
        if (!target) return reply("✍️ *Tag or reply* to the user you want to demote.");

        let owners = getOwners();
        if (!owners.includes(target)) return reply("❌ This user is not in the sudo list.");

        const updated = owners.filter(x => x !== target);
        saveOwners(updated);

        const msg = `✅ *𝐒𝐔𝐃𝐎 𝐑𝐄𝐌𝐎𝐕𝐄𝐃*\n\nUser @${target.split('@')[0]} demoted successfully.\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, {
            image: { url: IMG_URL },
            caption: msg,
            mentions: [target],
            contextInfo: { forwardingScore: 999, isForwarded: true }
        }, { quoted: mek });

    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});

// 3. LIST SUDO
cmd({
    pattern: "listsudo",
    alias: ["sudoer", "owners"],
    desc: "List all temporary owners.",
    category: "owner",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
    try {
        if (!isCreator) return reply("🚫 *Access Denied:* Developer Only.");

        let owners = getOwners();
        if (owners.length === 0) return reply("❌ No temporary owners found in the database.");

        let list = `✨ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐒𝐔𝐃𝐎 𝐋𝐈𝐒𝐓* ✨\n\n`;
        owners.forEach((owner, i) => {
            list += `${i + 1}. @${owner.split('@')[0]}\n`;
        });
        list += `\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, {
            image: { url: IMG_URL },
            caption: list,
            mentions: owners,
            contextInfo: { forwardingScore: 999, isForwarded: true }
        }, { quoted: mek });

    } catch (err) {
        reply("❌ Error: " + err.message);
    }
});
