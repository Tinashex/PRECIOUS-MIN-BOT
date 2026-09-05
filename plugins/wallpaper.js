import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "wallpaper",
  alias: ["wall", "4kwall"],
  desc: "Search for 4K wallpapers",
  category: "search",
  filename: __filename,
  use: "<search query>",
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    // 1. Validation Check
    if (!q) {
      return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 a search keyword.* \n\nExample: .wallpaper Cars");
    }

    // 2. Loading State / Reaction
    await conn.sendMessage(from, { react: { text: '🖼️', key: mek.key } });

    // 3. Fetch from your 4K Wallpaper API endpoint
    const apiUrl = `https://eliteprotech-apis.zone.id/4kwallpaper?q=${encodeURIComponent(q)}&type=search`;
    const { data } = await axios.get(apiUrl);

    // 4. Validate the response structure
    if (!data?.success || !Array.isArray(data.results) || data.results.length === 0) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply("❌ No wallpapers found for that query.");
    }

    const wallList = data.results;
    
    // Limit to top 5 results for clean layout display
    const maxResults = Math.min(wallList.length, 5);
    
    let wallMsg = `🖼️ *𝟒𝐊 𝐖𝐀𝐋𝐋𝐏𝐀𝐏𝐄𝐑 𝐒𝐄𝐀𝐑𝐂𝐇*\n\n` +
                  `📝 *Query:* _${data.query || q}_\n` +
                  `📊 *Total Found:* ${data.total || wallList.length}\n\n` +
                  `*━━━━━━━━━━━━━━━━━━━━━*\n\n`;

    for (let i = 0; i < maxResults; i++) {
        const wall = wallList[i];
        
        wallMsg += `*${i + 1}. ${wall.title}*\n` +
                   `🔗 *Page Link:* ${wall.url}\n\n` +
                   `*---------------------*\n\n`;
    }

    wallMsg += `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

    // 5. Send results list with the thumbnail of the first wallpaper
    if (wallList[0]?.thumbnail) {
        await conn.sendMessage(from, {
            image: { url: wallList[0].thumbnail },
            caption: wallMsg
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { text: wallMsg }, { quoted: mek });
    }

    // 6. Success Reaction
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("Wallpaper Search Plugin Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    reply("❌ An error occurred during the wallpaper search.");
  }
});
