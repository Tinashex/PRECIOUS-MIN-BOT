import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
  pattern: "caption",
  alias: ["cap", "recaption", "c"],
  react: '✏️',
  desc: "Add or replace the caption of any media file.",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    // 1. INPUT VALIDATION
    const quoted = m.quoted ? m.quoted : null;
    if (!quoted) {
        return reply("✨ *Hey* \n\nReply to an image, video, or document to add a new caption.\n\n*Usage:* .caption [Your New Text]");
    }

    if (!q) return reply("❌ Please provide the new caption text.");

    // 2. PROCESSING ANNOUNCEMENT
    await reply("🔄 *Applying new caption...*");

    // 3. MEDIA EXTRACTION
    const buffer = await quoted.download().catch(() => null);
    if (!buffer) return reply("❌ *ERROR:* Failed to download the media from WhatsApp servers.");

    const mtype = quoted.mtype;
    const messageContent = {
      caption: `${q}\n\n${FOOTER}`,
      mimetype: quoted.mimetype
    };

    // 4. DYNAMIC TYPE HANDLING
    switch (mtype) {
      case "imageMessage":
        messageContent.image = buffer;
        break;
      case "videoMessage":
        messageContent.video = buffer;
        break;
      case "documentMessage":
        messageContent.document = buffer;
        messageContent.fileName = quoted.fileName || `WATSON-XD-DOC`;
        break;
      case "audioMessage":
        // Audio doesn't support captions in standard WA, but we deliver as PTT/Audio
        messageContent.audio = buffer;
        messageContent.ptt = quoted.ptt || false;
        delete messageContent.caption; // Remove caption for audio compatibility
        break;
      default:
        return reply("❌ This media type is not supported for recaptioning.");
    }

    // 5. REDELIVERY
    await conn.sendMessage(from, messageContent, { quoted: mek });

  } catch (error) {
    console.error("Caption Error:", error);
    reply("⚠️ *SYSTEM ERROR:* Failed to process caption update.");
  }
});
