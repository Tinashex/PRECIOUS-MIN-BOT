import { cmd, commands } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "couplepp",
  alias: ["couple", "cpp"],
  react: '💑',
  desc: "Get a pair of male and female matching profile pictures.",
  category: "image",
  use: ".couplepp",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // Notify the user
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    // Fetch from the API
    const response = await axios.get("https://api.davidcyriltech.my.id/couplepp");

    if (!response.data || !response.data.male || !response.data.female) {
      return reply("❌ Failed to fetch matching pictures. The API might be down.");
    }

    const malePp = response.data.male;
    const femalePp = response.data.female;

    // Send Male Picture
    await conn.sendMessage(from, {
      image: { url: malePp },
      caption: `👨 *Male Matching PP*\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363424621387196@newsletter',
          newsletterName: '𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // Send Female Picture
    await conn.sendMessage(from, {
      image: { url: femalePp },
      caption: `👩 *Female Matching PP*\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363424621387196@newsletter',
          newsletterName: '𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // Final Success Reaction
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (error) {
    console.error("CouplePP Error:", error);
    reply("❌ An error occurred while fetching the couple profile pictures.");
  }
});
