import { cmd } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
  pattern: "wallpaper",
  alias: ["wall", "randomwall"],
  react: "🌌",
  desc: "Download high-quality random wallpapers based on your search.",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    const query = q || "aesthetic nature";
    
    // Using a robust, high-speed API endpoint
    const apiUrl = `https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=${encodeURIComponent(query)}`;

    // 1. DATA FETCHING
    const { data } = await axios.get(apiUrl);
    
    if (data.status && data.imgUrl) {
      // 2. STYLIZED CAPTION (Zero Footprint)
      const caption = `🌌 *𝐖𝐀𝐋𝐋𝐏𝐀𝐏𝐄𝐑 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃*\n\n` +
                      `📍 *Query:* ${query}\n\n` +
                      `${FOOTER}`;

      // 3. EXECUTION
      await conn.sendMessage(from, { 
          image: { url: data.imgUrl }, 
          caption: caption 
      }, { quoted: mek });

    } else {
      reply(`❌ *𝐍𝐎 𝐑𝐄𝐒𝐔𝐋𝐓𝐒:* I couldn't find any wallpapers for "${query}". Try a different keyword.`);
    }
  } catch (error) {
    console.error("Wallpaper Command Error:", error);
    
    // Smart Fallback for Harare server stability
    try {
        const fallbackUrl = `https://api.popcat.xyz/wallpaper?q=${encodeURIComponent(q || 'abstract')}`;
        const fallbackRes = await axios.get(fallbackUrl);
        if (fallbackRes.data.image) {
            return await conn.sendMessage(from, { 
                image: { url: fallbackRes.data.image }, 
                caption: `🌌 *𝐖𝐀𝐋𝐋𝐏𝐀𝐏𝐄𝐑 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃*\n\n${FOOTER}` 
            }, { quoted: mek });
        }
    } catch (fallbackError) {
        reply("⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* The wallpaper service is currently unavailable.");
    }
  }
});
