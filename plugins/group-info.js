import config from '../config.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "ginfo",
    alias: ["groupinfo", "infogroup"],
    desc: "Get detailed group information.",
    category: "group",
    react: "🥏",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isOwner, groupMetadata, participants, reply }) => {
    try {
        // 1. Permissions & Context
        if (!isGroup) return reply(`❌ This command only works in groups.`);
        
        // 2. Fetch Group Profile Picture
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image');
        } catch {
            // Fallback to your permanent branding image if no group icon is set
            ppUrl = 'https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png';
        }

        // 3. Data Parsing
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `│ ${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        const creator = groupMetadata.owner || "Not Available";

        // 4. Stylized Output
        const gdata = `✨ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎* ✨\n\n` +
            `📝 *𝐍𝐚𝐦𝐞:* ${groupMetadata.subject}\n` +
            `🆔 *𝐈𝐃:* ${from}\n` +
            `👥 *𝐌𝐞𝐦𝐛𝐞𝐫𝐬:* ${participants.length}\n` +
            `👑 *𝐂𝐫𝐞𝐚𝐭𝐨𝐫:* @${creator.split('@')[0]}\n\n` +
            `📜 *𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐭𝐢𝐨𝐧:*\n${groupMetadata.desc?.toString() || 'No description provided.'}\n\n` +
            `📂 *𝐀𝐝𝐦𝐢𝐧𝐬 (${groupAdmins.length}):*\n${listAdmin}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        // 5. Execution (Zero Footprint)
        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption: gdata,
            mentions: [...groupAdmins.map(v => v.id), creator],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
                // Newsletter block strictly removed
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Ginfo Error:", e);
        reply(`⚠️ Failed to fetch group info. Error: ${e.message}`);
    }
});
