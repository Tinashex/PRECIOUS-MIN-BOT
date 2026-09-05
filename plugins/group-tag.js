import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "hidetag",
    alias: ["tag", "h", "all"],  
    desc: "Tag all group members with a message or media.",
    category: "group",
    react: "🔊",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isOwner, isAdmins, participants, reply }) => {
    try {
        // 1. UNTOUCHABLE SECURITY LAYER
        if (!isGroup) return reply("❌ *ERROR:* Groups only.");
        if (!isAdmins && !isOwner) return reply("🚫 *ACCESS DENIED:* Admins or Developer only.");

        const mentionAll = { mentions: participants.map(u => u.id) };

        // 2. PROCESS QUOTED MEDIA/TEXT
        if (m.quoted) {
            const type = m.quoted.mtype || '';
            const caption = q || m.quoted.text || "";

            // Handle Media Types
            if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)) {
                const buffer = await m.quoted.download();
                if (!buffer) return reply("❌ Failed to download media.");

                let content = {};
                switch (type) {
                    case "imageMessage":
                        content = { image: buffer, caption, ...mentionAll };
                        break;
                    case "videoMessage":
                        content = { video: buffer, caption, ...mentionAll };
                        break;
                    case "audioMessage":
                        content = { audio: buffer, mimetype: "audio/mp4", ptt: true, ...mentionAll };
                        break;
                    case "stickerMessage":
                        content = { sticker: buffer, ...mentionAll };
                        break;
                    case "documentMessage":
                        content = { 
                            document: buffer, 
                            mimetype: m.quoted.msg.mimetype, 
                            fileName: m.quoted.msg.fileName, 
                            caption, 
                            ...mentionAll 
                        };
                        break;
                }
                return await conn.sendMessage(from, content);
            }

            // Handle Quoted Text
            return await conn.sendMessage(from, { 
                text: m.quoted.text || "📢 *Attention Everyone!*", 
                ...mentionAll 
            });
        }

        // 3. PROCESS DIRECT TEXT
        if (!q) return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐦𝐞𝐬𝐬𝐚𝐠𝐞!* \nExample: .hidetag Good Morning!");

        await conn.sendMessage(from, { 
            text: `🔊 *𝐀𝐍𝐍𝐎𝐔𝐍𝐂𝐄𝐌𝐄𝐍𝐓*\n\n${q}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`, 
            ...mentionAll 
        });

    } catch (e) {
        console.error("Hidetag Error:", e);
        reply("⚠️ *SYSTEM ERROR:* Tagging failed.");
    }
});
