import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "hack",
    desc: "Dynamic hacking animation for entertainment.",
    category: "fun",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");

        const steps = [
            '💻 *𝐈𝐍𝐈𝐓𝐈𝐀𝐓𝐈𝐍𝐆 𝐒𝐘𝐒𝐓𝐄𝐌 𝐁𝐑𝐄𝐀𝐂𝐇...*',
            '🛠️ *Loading exploit modules...*',
            '🌐 *Bypassing firewall protocols...*',
            '⏳ ```[▒▒▒▒▒▒▒▒▒▒] 10%```',
            '⏳ ```[██▒▒▒▒▒▒▒▒] 30%```',
            '⏳ ```[█████▒▒▒▒▒] 50%```',
            '⏳ ```[████████▒▒] 80%```',
            '✅ ```[██████████] 100%```',
            '🔓 *𝐒𝐘𝐒𝐓𝐄𝐌 𝐁𝐑𝐄𝐀𝐂𝐇: 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋*',
            '📡 *Transmitting encrypted data...*',
            '🤫 *Ensuring stealth clearance...*',
            '🏁 *𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐎𝐍 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄.*',
            `☣️ *𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐇𝐀𝐂𝐊 𝐅𝐈𝐍𝐈𝐒𝐇𝐄𝐃*\n\n${FOOTER}`
        ];

        // 2. SEND INITIAL MESSAGE
        let { key } = await conn.sendMessage(from, { text: steps[0] }, { quoted: mek });

        // 3. ANIMATION LOOP (Editing the same message)
        for (let i = 1; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1200)); // Delay for realism
            await conn.sendMessage(from, { text: steps[i], edit: key });
        }

    } catch (e) {
        console.error("Hack Command Error:", e);
        reply("⚠️ *CRITICAL ERROR:* Exploit failed to execute.");
    }
});
