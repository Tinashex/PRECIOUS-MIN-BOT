import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
  pattern: "send",
  alias: ["sendme", "save"],
  react: '📤',
  desc: "Saves media and sends it to your private chat.",
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, quoted, sender, reply }) => {
  try {
    // 1. INPUT VALIDATION
    if (!quoted) return await reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐬𝐚𝐯𝐞.*");

    const mtype = quoted.mtype;
    const allowedTypes = ["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"];
    
    if (!allowedTypes.includes(mtype) && mtype !== "extendedTextMessage") {
      return await reply("❌ *ERROR:* Unsupported message type.");
    }

    // 2. MEDIA PROCESSING
    let messageContent = {};
    
    if (mtype === "extendedTextMessage" || mtype === "conversation") {
        messageContent = { text: quoted.text + `\n\n${FOOTER}` };
    } else {
        const buffer = await quoted.download();
        if (!buffer) throw new Error("Download failed");

        switch (mtype) {
          case "imageMessage":
            messageContent = { image: buffer, caption: (quoted.text || "") + `\n\n${FOOTER}` };
            break;
          case "videoMessage":
            messageContent = { video: buffer, caption: (quoted.text || "") + `\n\n${FOOTER}` };
            break;
          case "audioMessage":
            messageContent = { audio: buffer, mimetype: "audio/mp4", ptt: quoted.msg.ptt || false };
            break;
          case "stickerMessage":
            messageContent = { sticker: buffer };
            break;
          case "documentMessage":
            messageContent = { 
                document: buffer, 
                mimetype: quoted.msg.mimetype, 
                fileName: quoted.msg.fileName || "Saved_File",
                caption: FOOTER 
            };
            break;
        }
    }

    // 3. DIRECT DELIVERY (Sends to your DM)
    await conn.sendMessage(sender, messageContent);
    
    // Notify in the current chat that it's been sent to DM
    if (from !== sender) {
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }

  } catch (error) {
    console.error("Save Command Error:", error);
    reply("⚠️ *SYSTEM ERROR:* Failed to save media.");
  }
});
