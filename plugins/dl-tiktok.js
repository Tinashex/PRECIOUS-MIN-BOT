import { cmd } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("✍️ *USAGE:* `.tiktok https://tiktok.com/@user/video/xxx`");
        if (!q.includes("tiktok.com")) return reply("❌ *ERROR:* Invalid TikTok link.");
        
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key }});
        
        // Using eliteprotech TikTok API
        const apiUrl = `https://eliteprotech-apis.zone.id/tiktok?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl, { timeout: 15000 });
        
        if (!data?.status || !data?.result?.download) {
            return reply("❌ *ERROR:* Failed to fetch video. Link invalid or API down.");
        }
        
        const videoUrl = data.result.download;
        const title = data.result.title || "TikTok Video";
        const author = data.result.author || "Unknown";
        const views = data.result.views || "N/A";
        
        const caption = `🎵 *𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n` +
                        `📖 *Title:* ${title}\n` +
                        `👤 *Author:* ${author}\n` +
                        `👀 *Views:* ${views}\n\n` +
                        `${FOOTER}`;
        
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: caption,
            buttons: [
                { buttonId: '.play', buttonText: { displayText: '🎵 PLAY' }, type: 1 },
                { buttonId: '.menu', buttonText: { displayText: '📜 MENU' }, type: 1 }
            ],
            headerType: 4,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key }});
        
    } catch (e) {
        console.error("TikTok error:", e);
        reply(`⚠️ *ERROR:* ${e.message}`);
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key }});
    }
});