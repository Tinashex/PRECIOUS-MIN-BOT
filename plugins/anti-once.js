import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "vv2",
  alias: ["vv", "retrive"], // Removed the conversational aliases
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { from, isOwner }) => {
  try {
    // 1. Owner Security Check
    if (!isOwner) return; 

    // 2. Check if a message is quoted
    if (!m.quoted) {
      return await conn.sendMessage(from, {
        text: "*𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 🍁 Please reply to a 'View Once' message!*"
      }, { quoted: mek });
    }

    // 3. Download the media
    const buffer = await m.quoted.download();
    const mtype = m.quoted.mtype;

    let messageContent = {};
    const caption = m.quoted.text || '';

    // 4. Determine Media Type
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: `🚀 *PRECIOUS-MD: RECOVERED IMAGE*\n\n${caption}`,
          mimetype: m.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: `🚀 *PRECIOUS-MD: RECOVERED VIDEO*\n\n${caption}`,
          mimetype: m.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: m.quoted.ptt || false
        };
        break;
      default:
        return await conn.sendMessage(from, {
          text: "❌ Only image, video, and audio 'View Once' messages are supported."
        }, { quoted: mek });
    }

    // 5. Send the recovered media back to YOUR PRIVATE CHAT
    await conn.sendMessage(conn.user.id, messageContent);
    
    // Optional: React to show success in the group
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (error) {
    console.error("VV Download Error:", error);
    await conn.sendMessage(from, {
      text: "❌ Error fetching VV message: " + error.message
    }, { quoted: mek });
  }
});
