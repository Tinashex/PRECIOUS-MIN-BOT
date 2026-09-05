import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  desc: "Download Facebook videos",
  category: "downloader",
  filename: __filename,
  use: "<Facebook URL>",
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    // 1. Validation Check
    if (!q || !q.startsWith("http")) {
      return reply("*`Need a valid Facebook URL`*\n\nExample: .fb https://www.facebook.com/watch?v=xxxx");
    }

    // 2. Loading State
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // 3. Fetch from your new API endpoint
    const apiUrl = `https://eliteprotech-apis.zone.id/facebook1?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    // Checking the response status and target download URL structure
    if (!data?.status || !data?.result?.download) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply("❌ Failed to fetch the video. The link might be private or broken.");
    }

    const videoUrl = data.result.download;

    // 4. Send the Video with Watson XD Branding
    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: `📥 *𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`,
    }, { quoted: mek });

    // 5. Final Success Reaction
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("FB Downloader Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    reply("❌ An error occurred while downloading.");
  }
});
