import { runtime } from '../lib/functions.js';
import config from '../config.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "ping",
    desc: "Check the bot's response speed and status.",
    category: "main",
    react: "🦾",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        const prefix = config.PREFIX || '.';
        
        // Calculate exact handshake latency
        const startTime = Date.now();
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const latency = Date.now() - startTime;

        // Build the status performance message
        let pingMessage = `✨ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐒𝐏𝐄𝐄𝐃 𝐓𝐄𝐒𝐓* ✨\n\n`;
        pingMessage += `👋 Hey *${pushname}*\n\n`;
        pingMessage += `🚀 *🤖 Response Latency:* ${latency} ms\n`;
        pingMessage += `🕒 *⏳ System Uptime:* ${runtime(process.uptime())}\n`;
        pingMessage += `🌌 *🌐 Network Mode:* ${config.MODE.toUpperCase()}\n\n`;
        pingMessage += `*${config.BOT_NAME}*`;

        // Compatible structure for personal account interactive messages
        const templateButtons = [
            {
                index: 1,
                quickReplyButton: {
                    displayText: '🧩 Main Menu',
                    id: `${prefix}menu`
                }
            },
            {
                index: 2,
                quickReplyButton: {
                    displayText: '🟢 Check System',
                    id: `${prefix}alive`
                }
            }
        ];

        // Package up into an allowed template payload structure
        const templateMessage = {
            text: pingMessage,
            footer: "watsonxt • Automation Ecosystem",
            templateButtons: templateButtons
        };

        // Dispatch directly through the primary send message pipeline
        await conn.sendMessage(from, templateMessage, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("❌ Error in Ping Plugin:", error);
        reply("💥 *An error occurred while processing the speed test.*");
    }
});      

/*const { cmd, commands } = require('../command');
const config = require('../config');
const os = require('os');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "ping",
    desc: "Check if the bot is active.",
    category: "main",
    react: "🦾",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // 1. Loading Reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const aliveMsg = `✨ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐒𝐓𝐀𝐓𝐔𝐒* ✨\n\n` +
            `Hi *@${m.sender.split('@')[0]}*, I am online and running perfectly 🦾🥂\n\n` +
            `📊 *📡 𝐒𝐘𝐒𝐓𝐄𝐌 𝐈𝐍𝐅𝐎:*\n` +
            `├ ∘ *Mode:* ${config.MODE || 'Public'}\n` +
            `├ ∘ *Uptime:* ${runtime(process.uptime())}\n` +
            `├ ∘ *Prefix:* ${config.PREFIX || '.'}\n` +
            `└ ∘ *Platform:* ${os.hostname()}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`;

        // 2. Send with the linked permanent image
        await conn.sendMessage(from, { 
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: aliveMsg,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // 3. Success Reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("Ping Error:", e);
        reply("⚠️ Bot is online, but I couldn't fetch the system stats.");
    }
});*/
