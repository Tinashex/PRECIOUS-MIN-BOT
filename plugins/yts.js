import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "yts",
  alias: ["ytsearch", "searchyt"],
  desc: "Search for videos on YouTube",
  category: "search",
  filename: __filename,
  use: "<search query>",
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    // 1. Validation Check
    if (!q) {
      return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 a search keyword.* \n\nExample: .yts Mwana Wese");
    }

    // 2. Loading State / Reaction
    await conn.sendMessage(from, { react: { text: '🔍', key: mek.key } });

    // 3. Fetch from your YouTube Search API endpoint
    const apiUrl = `https://eliteprotech-apis.zone.id/ytsearch?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    // 4. Validate the response structure
    if (!data?.success || !data?.results || !Array.isArray(data.results.videos) || data.results.videos.length === 0) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply("❌ No YouTube search results found.");
    }

    const videoList = data.results.videos;
    
    // Limit to top 5 results for clean display formatting
    const maxResults = Math.min(videoList.length, 5);
    
    let searchMsg = `🔍 *𝐘𝐎𝐔𝐓𝐔registered𝐁𝐄 𝐒𝐄𝐀𝐑𝐂𝐇 𝐑𝐄𝐒𝐔𝐋𝐓𝐒*\n\n` +
                    `📝 *Query:* _${q}_\n\n` +
                    `*━━━━━━━━━━━━━━━━━━━━━*\n\n`;

    for (let i = 0; i < maxResults; i++) {
        const video = videoList[i];
        
        searchMsg += `*${i + 1}. ${video.title}*\n` +
                     `⏳ *Duration:* ${video.duration || "Unknown"}\n` +
                     `👀 *Views:* ${video.views ? video.views.toLocaleString() : "0"}\n` +
                     `📅 *Uploaded:* ${video.uploaded || "N/A"}\n` +
                     `👤 *Channel:* ${video.author?.name || "Unknown"}\n` +
                     `🔗 *Link:* ${video.url}\n\n` +
                     `*---------------------*\n\n`;
    }

    searchMsg += `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

    // 5. Send results list with thumbnail of the top video
    if (videoList[0]?.thumbnail) {
        await conn.sendMessage(from, {
            image: { url: videoList[0].thumbnail },
            caption: searchMsg
        }, { quoted: mek });
    } else {
        await conn.sendMessage(from, { text: searchMsg }, { quoted: mek });
    }

    // 6. Success Reaction
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("YT Search Plugin Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    reply("❌ An error occurred during the YouTube search.");
  }
});
