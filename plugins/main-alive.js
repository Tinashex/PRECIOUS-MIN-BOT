import { cmd } from '../command.js';
import os from 'os';
import { runtime } from '../lib/functions.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check if the bot is online and view system stats.",
    category: "main",
    react: "🦾",
    filename: __filename
},
async (conn, mek, m, { from, sender, reply }) => {
    try {
        // 1. System Calculations
        const usedRam = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
        const uptime = runtime(process.uptime());

        // 2. Stylized Status Message
        const status = `✨ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐒𝐓𝐀𝐓𝐔𝐒* ✨\n\n` +
            `Hi *@${sender.split('@')[0]}*, I am online and running smoothly! 🦾🥂\n\n` +
            `📊 *📡 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎:*\n` +
            `├ ∘ *Mode:* ${config.MODE || 'Public'}\n` +
            `├ ∘ *Version:* 4.0.0\n` +
            `├ ∘ *RAM:* ${usedRam}MB / ${totalRam}MB\n` +
            `├ ∘ *Uptime:* ${uptime}\n` +
            `├ ∘ *Prefix:* ${config.PREFIX}\n` +
            `└ ∘ *Host:* ${os.hostname()} (ZW)\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        // 3. Send Message (Strictly No Newsletter Metadata)
        await conn.sendMessage(from, {
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: status,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true
                // Newsletter block strictly removed
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`⚠️ Error: ${e.message}`);
    }
});
