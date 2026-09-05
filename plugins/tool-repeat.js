import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "msg",
    alias: ["spam", "repeat"],
    desc: "Send a message multiple times (Developer Only).",
    category: "owner",
    react: "🔁",
    filename: __filename
},
async (conn, mek, m, { from, q, isOwner, reply }) => {
    // 1. UNTOUCHABLE SECURITY LAYER
    if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");

    try {
        // 2. INPUT VALIDATION
        if (!q || !q.includes(',')) {
            return reply("✍️ *𝐔𝐒𝐀𝐆𝐄:*\n.msg text,count\n\n*Example:* .msg Hello,5");
        }

        const [text, countStr] = q.split(',');
        const message = text.trim();
        const count = parseInt(countStr.trim());

        // Hard limit to protect the bot's health
        if (isNaN(count) || count < 1 || count > 50) {
            return reply("⚠️ *LIMIT:* Max 50 messages to prevent ban.");
        }

        // 3. SILENT EXECUTION LOOP
        for (let i = 0; i < count; i++) {
            await conn.sendMessage(from, { 
                text: message 
            }, { quoted: null }); // Unquoted for speed

            // 500ms delay to bypass WhatsApp Spam Filters
            if (count > 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

    } catch (e) {
        console.error("Spam Command Error:", e);
        reply("❌ *SYSTEM ERROR:* Spammer failed.");
    }
});
