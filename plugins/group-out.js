import { cmd } from '../command.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "out",
    alias: ["countrykick", "kickcode"],
    desc: "Mass remove members based on country code.",
    category: "admin",
    react: "🚫",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isBotAdmins, isOwner, groupMetadata, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* This command is restricted to Group Chats.");
        
        // Strictly Developer/Owner Only to prevent accidental group wipes
        if (!isOwner) return reply("🚫 *ACCESS DENIED:* Only the Developer can use mass-remove.");

        if (!isBotAdmins) return reply("❌ *PERMISSION ERROR:* I need Admin rights to remove members.");

        if (!q) return reply(`✍️ *How to use:* \nExample: ${config.PREFIX}out 92\n(This removes all +92 numbers)`);

        const countryCode = q.trim().replace('+', '');
        if (!/^\d+$/.test(countryCode)) return reply("❌ *INVALID CODE:* Please provide numbers only (e.g., 263, 91, 92).");

        // 2. TARGET IDENTIFICATION
        const participants = groupMetadata.participants;
        const botNumber = conn.user.id.split(':')[0];

        const targets = participants.filter(p => 
            p.id.startsWith(countryCode) && 
            !p.admin && // Never kick admins
            !p.id.includes(botNumber) // Safety: Don't kick yourself
        );

        if (targets.length === 0) {
            return reply(`ℹ️ No non-admin members found with country code *+${countryCode}*.`);
        }

        // 3. EXECUTION: MASS KICK
        const jids = targets.map(p => p.id);
        
        // Informing the group before action
        await reply(`⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃:* Cleaning ${targets.length} members from +${countryCode}...`);
        
        await conn.groupParticipantsUpdate(from, jids, "remove");

        // 4. STYLIZED CONFIRMATION (Zero Footprint)
        const successMsg = `✅ *𝐂𝐋𝐄𝐀𝐍𝐔𝐏 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄* ✅\n\n` +
            `📍 *Group:* ${groupMetadata.subject}\n` +
            `🚫 *Removed:* ${targets.length} Members\n` +
            `🌍 *Country Code:* +${countryCode}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(from, {
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: successMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Out Command Error:", error);
        reply("⚠️ *SYSTEM ERROR:* Failed to complete mass removal.");
    }
});
