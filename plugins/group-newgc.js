import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "newgc",
    alias: ["creategroup", "makegc"],
    desc: "Create a new group and add participants automatically.",
    category: "owner",
    react: "🏗️",
    filename: __filename
}, async (conn, mek, m, { q, isOwner, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");

        // 2. INPUT VALIDATION
        if (!q || !q.includes(';')) {
            return reply("✍️ *𝐔𝐒𝐀𝐆𝐄:*\n.newgc Name;2637xxx,2637xxx\n\n> Separate name and numbers with a semicolon (;)");
        }

        const [groupName, numbersString] = q.split(";");
        const participantNumbers = numbersString.split(",").map(num => {
            let formatted = num.trim().replace(/[^0-9]/g, '');
            return `${formatted}@s.whatsapp.net`;
        });

        if (participantNumbers.length === 0) return reply("❌ No valid numbers provided.");

        await reply(`⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐈𝐍𝐈𝐓𝐈𝐀𝐓𝐈𝐍𝐆 𝐆𝐑𝐎𝐔𝐏 𝐂𝐑𝐄𝐀𝐓𝐈𝐎𝐍*...`);

        // 3. EXECUTION
        const group = await conn.groupCreate(groupName.trim(), participantNumbers);
        
        // Fetch invite link immediately
        const inviteCode = await conn.groupInviteCode(group.id);

        // 4. STYLIZED CONFIRMATION (Zero Footprint)
        const successMsg = `🏗️ *𝐆𝐑𝐎𝐔𝐏 𝐂𝐑𝐄𝐀𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘*\n\n` +
            `📍 *Name:* ${groupName}\n` +
            `👥 *Members:* ${participantNumbers.length}\n` +
            `🔗 *Link:* https://chat.whatsapp.com/${inviteCode}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(m.chat, { 
            text: successMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // Send a greeting to the new group
        await conn.sendMessage(group.id, { text: `👋 *System Initialized.*\nGroup created by **PRECIOUS-MD**.` });

    } catch (e) {
        console.error("NewGC Error:", e);
        reply(`⚠️ *SYSTEM ERROR:* ${e.message}`);
    }
});
