import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// 1. LIST JOIN REQUESTS
cmd({
    pattern: "requestlist",
    alias: ["listrequest", "requests"],
    desc: "Shows all pending group join requests.",
    category: "group",
    react: "📋",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED:* Admins only.");
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR:* I need Admin rights.");

        const requests = await conn.groupRequestParticipantsList(from);
        
        if (requests.length === 0) {
            return reply("ℹ️ *𝐒𝐓𝐀𝐓𝐔𝐒:* No pending join requests at the moment.");
        }

        let text = `📋 *𝐏𝐄𝐍𝐃𝐈𝐍𝐆 𝐉𝐎𝐈𝐍 𝐑𝐄𝐐𝐔𝐄𝐒𝐓𝐒*\n\n` +
                   `📍 *Total:* ${requests.length}\n\n`;
        
        requests.forEach((user, i) => {
            text += `│ ${i + 1}. @${user.jid.split('@')[0]}\n`;
        });

        text += `\n${FOOTER}`;

        return reply(text, { mentions: requests.map(u => u.jid) });
    } catch (error) {
        console.error("Request list error:", error);
        return reply("❌ *SYSTEM ERROR:* Failed to fetch requests.");
    }
});

// 2. ACCEPT ALL REQUESTS
cmd({
    pattern: "acceptall",
    alias: ["approveall"],
    desc: "Accepts all pending group join requests instantly.",
    category: "group",
    react: "✅",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED.*");
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR.*");

        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) return reply("ℹ️ No pending requests to approve.");

        const jids = requests.map(u => u.jid);
        await conn.groupRequestParticipantsUpdate(from, jids, "approve");
        
        const msg = `✅ *𝐑𝐄𝐐𝐔𝐄𝐒𝐓𝐒 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃*\n\n` +
                    `📝 *Action:* Bulk Approval\n` +
                    `👥 *Count:* ${requests.length} members added.\n\n` +
                    `${FOOTER}`;

        return reply(msg);
    } catch (error) {
        reply("❌ *SYSTEM ERROR:* Failed to approve requests.");
    }
});

// 3. REJECT ALL REQUESTS
cmd({
    pattern: "rejectall",
    alias: ["denyall"],
    desc: "Rejects all pending group join requests instantly.",
    category: "group",
    react: "❌",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED.*");
        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR.*");

        const requests = await conn.groupRequestParticipantsList(from);
        if (requests.length === 0) return reply("ℹ️ No pending requests to reject.");

        const jids = requests.map(u => u.jid);
        await conn.groupRequestParticipantsUpdate(from, jids, "reject");
        
        const msg = `❌ *𝐑𝐄𝐐𝐔𝐄𝐒𝐓𝐒 𝐑𝐄𝐉𝐄𝐂𝐓𝐄𝐃*\n\n` +
                    `📝 *Action:* Bulk Rejection\n` +
                    `👥 *Count:* ${requests.length} requests cleared.\n\n` +
                    `${FOOTER}`;

        return reply(msg);
    } catch (error) {
        reply("❌ *SYSTEM ERROR:* Failed to reject requests.");
    }
});
