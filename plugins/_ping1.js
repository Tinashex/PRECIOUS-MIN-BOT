import { fileURLToPath } from 'url';
import { runtime } from '../lib/functions.js'; // uncommented + ESM import
import config from '../config.js';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "ping1",
    desc: "Check the bot's response speed and status.",
    category: "main",
    react: "🦾",
    filename: __filename
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        const prefix = config.PREFIX || '.';
        const startTime = Date.now();
        
        // Initial Loading Reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        
        const endTime = Date.now();
        const latency = endTime - startTime;

        let pingMessage = `✨ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐒𝐏𝐄𝐄𝐃 𝐓𝐄𝐒𝐓* ✨\n\n`;
        pingMessage += `👋 Hey *${pushname}*\n\n`;
        pingMessage += `🚀 *🤖 Response Latency:* ${latency} ms\n`;
        pingMessage += `🕒 *⏳ System Uptime:* ${runtime(process.uptime())}\n`;
        pingMessage += `🌌 *🌐 Network Mode:* ${config.MODE?.toUpperCase() || 'PUBLIC'}\n\n`;
        pingMessage += `*${config.BOT_NAME || 'PRECIOUS-MD'}*`;

        // Fixed Interactive Message for new WA
        await conn.sendMessage(from, {
            interactiveMessage: {
                body: { text: pingMessage },
                footer: { text: "watsonxt • Automation Ecosystem" },
                header: { 
                    hasMediaAttachment: false,
                    text: "⚡ Speed Test Results" 
                },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🧩 Main Menu",
                                id: `${prefix}menu`
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "🟢 Check System", 
                                id: `${prefix}alive`
                            })
                        }
                    ]
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("❌ Error in Ping Plugin:", error);
        reply("💥 *An error occurred while processing the speed test.*\n" + error.message);
    }
});