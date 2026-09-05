import { cmd } from '../command.js';
import { sleep } from '../lib/functions.js';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "restart",
    alias: ["reboot", "refresh"],
    desc: "Reboots the PRECIOUS-MD system.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { reply, isOwner }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");

        // 2. STYLIZED ANNOUNCEMENT
        const { key } = await conn.sendMessage(m.chat, { 
            text: `⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐈𝐍𝐈𝐓𝐈𝐀𝐓𝐈𝐍𝐆 𝐑𝐄𝐒𝐓𝐀𝐑𝐓...*\n\nSystem will be back online in seconds.\n\n${FOOTER}` 
        }, { quoted: mek });

        // 3. GRACEFUL DELAY (Ensures message delivery on Harare networks)
        await sleep(2000);

        // 4. PROCESS EXECUTION
        // Checks if running via PM2 or a standard Node process
        exec("pm2 restart all || npm restart || node index.js", (error) => {
            if (error) {
                console.error("Manual Restart Triggered.");
                process.exit(); // Fallback if exec fails
            }
        });

    } catch (e) {
        console.error("Restart Error:", e);
        reply(`⚠️ *SYSTEM ERROR:* ${e.message}`);
    }
});
