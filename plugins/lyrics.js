import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "lyrics",
  alias: ["lyric", "text"],
  desc: "Search for song lyrics",
  category: "search",
  filename: __filename,
  use: "<song name / artist>",
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    // 1. Validation Check
    if (!q) {
      return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞 𝐨𝐫 𝐚𝐫𝐭𝐢𝐬𝐭.* \n\nExample: .lyrics Ed Sheeran Perfect");
    }

    // 2. Loading State
    await conn.sendMessage(from, { react: { text: '🔍', key: mek.key } });

    // 3. Fetch from your lyrics API endpoint
    const apiUrl = `https://eliteprotech-apis.zone.id/lyrics?query=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    // 4. Validate the response structure
    if (!data?.status || !data?.result || !data?.result?.lyrics) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply("❌ Lyrics not found. Try adding the artist's name to your search.");
    }

    const info = data.result;
    
    // 5. Format the text layout beautifully
    let lyricMsg = `🎵 *𝐋𝐘𝐑𝐈𝐂𝐒 𝐒𝐄𝐀𝐑𝐂𝐇*\n\n` +
                   `🎤 *Artist:* ${info.artist || "Unknown"}\n` +
                   `🎶 *Title:* ${info.title || q}\n` +
                   `🔗 *Source:* ${info.image || "Default"}\n\n` +
                   `📝 *𝐋𝐘𝐑𝐈𝐂𝐒:* \n\n${info.lyrics}\n\n` +
                   `> © 𝐏class𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`;

    // 6. Send the text message
    await conn.sendMessage(from, { text: lyricMsg }, { quoted: mek });

    // 7. Success Reaction
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("Lyrics Downloader Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    reply("❌ An error occurred while searching for lyrics.");
  }
});
