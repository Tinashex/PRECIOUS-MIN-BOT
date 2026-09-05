import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "fancy",
  alias: ["font", "style"],
  react: "✍️",
  desc: "Convert text into various fancy fonts.",
  category: "tools",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    // 1. Validation
    if (!q) {
      return reply("✍️ *Please provide text to style!*\nExample: .fancy Watson XD");
    }

    // 2. Loading Reaction
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    // 3. Fetch from API
    const apiUrl = `https://api.giftedtech.my.id/api/tools/fancy-font?apikey=gifted&text=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    
    if (!response.data || !response.data.results) {
      await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
      return reply("❌ Failed to fetch fonts. Please try again later.");
    }

    // 4. Format the Results (Using map to list all font styles)
    const fonts = response.data.results.map(item => `✨ *${item.name}:*\n${item.result}`).join("\n\n");
    
    const resultText = `✨ *𝐅𝐀𝐍𝐂𝐘 𝐅𝐎𝐍𝐓 𝐂𝐎𝐍𝐕𝐄𝐑𝐓𝐄𝐑* ✨\n\n${fonts}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

    // 5. Send the styled text
    await conn.sendMessage(from, { text: resultText }, { quoted: mek });

    // 6. Success Reaction
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (error) {
    console.error("Fancy Font Error:", error);
    reply("⚠️ An error occurred while styling your text.");
  }
});
