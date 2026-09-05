import { cmd } from '../command.js';
import { sleep } from '../lib/functions.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// 1. HARARE TIME (Corrected from Pakistan)
cmd({
    pattern: "timenow",
    alias: ["time"],
    desc: "Check the current local time in Harare.",
    category: "utility",
    react: "🕒",
    filename: __filename,
}, 
async (conn, mek, m, { reply }) => {
    try {
        const localTime = new Date().toLocaleTimeString("en-US", { 
            hour: "2-digit", 
            minute: "2-digit", 
            second: "2-digit", 
            hour12: true,
            timeZone: "Africa/Harare" 
        });
        reply(`🕒 *𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐓𝐈𝐌𝐄 (𝐇𝐀𝐑𝐀𝐑𝐄):* ${localTime}\n\n${FOOTER}`);
    } catch (e) {
        reply("⚠️ Error fetching time.");
    }
});

// 2. ENCODING SUITE (Binary, Base64, URL)
cmd({
    pattern: "binary",
    alias: ["tobinary"],
    desc: "Convert text to binary.",
    category: "utility",
    react: "🔢",
    filename: __filename,
}, 
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("✍️ Provide text to convert.");
    const binary = q.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    reply(`🔢 *𝐁𝐈𝐍𝐀𝐑𝐘 𝐎𝐔𝐓𝐏𝐔𝐓:*\n\n${binary}\n\n${FOOTER}`);
});

cmd({
    pattern: "dbinary",
    desc: "Decode binary to text.",
    category: "utility",
    react: "🔓",
    filename: __filename,
}, 
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("✍️ Provide binary string.");
    const text = q.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
    reply(`🔓 *𝐃𝐄𝐂𝐎𝐃𝐄𝐃 𝐓𝐄𝐗𝐓:*\n\n${text}\n\n${FOOTER}`);
});

// 3. SAFE CALCULATOR (No eval)
cmd({
    pattern: "calculate",
    alias: ["calc"],
    desc: "Solve math expressions safely.",
    category: "utility",
    react: "➕",
    filename: __filename
},
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("✍️ Example: .calc 5 + 5");
    const expression = q.replace(/[^-+/*0-9.() ]/g, ''); // Sanitize input
    try {
        const result = Function(`'use strict'; return (${expression})`)();
        reply(`✅ *𝐑𝐄𝐒𝐔𝐋𝐓:* ${result}\n\n${FOOTER}`);
    } catch {
        reply("❌ Invalid Math Expression.");
    }
});

// 4. FUN TOOLS (Roll, Flip, Pick)
cmd({
    pattern: "roll",
    desc: "Roll a D6 dice.",
    category: "fun",
    react: "🎲",
    filename: __filename,
}, 
async (conn, mek, m, { reply }) => {
    const res = Math.floor(Math.random() * 6) + 1;
    reply(`🎲 *𝐃𝐈𝐂𝐄 𝐑𝐎𝐋𝐋:* ${res}\n\n${FOOTER}`);
});

cmd({
    pattern: "pick",
    desc: "Choose between options separated by a comma.",
    category: "fun",
    react: "🤔",
    filename: __filename,
}, 
async (conn, mek, m, { q, reply }) => {
    if (!q.includes(',')) return reply("✍️ Provide choices separated by a comma.\nExample: .pick Coffee, Tea");
    const choices = q.split(',').map(v => v.trim());
    const picked = choices[Math.floor(Math.random() * choices.length)];
    reply(`🤔 *𝐈 𝐂𝐇𝐎𝐎𝐒𝐄:* ${picked}\n\n${FOOTER}`);
});

// 5. OWNER COUNTDOWN (Anti-Spam)
cmd({
    pattern: "countx",
    desc: "Reverse countdown.",
    category: "owner",
    react: "⏳",
    filename: __filename
},
async (conn, mek, m, { args, isOwner, reply }) => {
    if (!isOwner) return reply("🚫 Developer Only.");
    const count = parseInt(args[0]);
    if (isNaN(count) || count > 20) return reply("❌ Max count is 20.");

    for (let i = count; i >= 1; i--) {
        await conn.sendMessage(m.chat, { text: `🔢 ${i}` });
        await sleep(1000);
    }
    reply("✅ *𝐂𝐎𝐔𝐍𝐓𝐃𝐎𝐖𝐍 𝐅𝐈𝐍𝐈𝐒𝐇𝐄𝐃*");
});
