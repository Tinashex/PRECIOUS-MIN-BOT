import { cmd } from '../command.js';
import { sleep } from '../lib/functions.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "leave",
    alias: ["left", "leftgc", "leavegc", "exit"],
    desc: "Make the bot leave the group chat.",
    category: "owner",
    react: "👋",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isOwner, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is restricted to Group Chats.");
        
        // Authorization: Strictly Developer only
        if (!isOwner) {
            return reply("🚫 *ACCESS DENIED:* Only the Developer can order a system exit.");
        }

        // 2. STYLIZED GOODBYE (Zero Footprint)
        const goodbyeMsg = `👋 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐃𝐄𝐏𝐀𝐑𝐓𝐔𝐑𝐄*\n\n` +
            `📍 *Status:* System exiting group as per Developer's command.\n` +
            `✅ *Action:* Completed.\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, { 
            text: goodbyeMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        });

        // 3. EXECUTION
        await sleep(2000); // 2s delay ensures the message clears the queue
        await conn.groupLeave(from);

    } catch (e) {
        console.error("Leave Command Error:", e);
        reply("⚠️ *SYSTEM ERROR:* Failed to leave the group.");
    }
});
