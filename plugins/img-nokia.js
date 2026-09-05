import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃";

cmd({
  pattern: "nokia",
  alias: ["nokiaphoto", "nkedit"],
  react: '📸',
  desc: "Put your image inside a classic Nokia phone screen.",
  category: "edit",
  use: ".nokia [reply to image]",
  filename: __filename
}, async (conn, mek, m, { reply, quoted }) => {
  try {
    // Determine the target message (quoted or current)
    const target = quoted ? quoted : m;
    const mime = (target.msg || target).mimetype || '';
    
    // Validate that the media is an image
    if (!mime || !mime.startsWith('image/')) {
      return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 (𝐉𝐏𝐄𝐆/𝐏𝐍𝐆).*");
    }

    await reply("⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐀𝐏𝐏𝐋𝐘𝐈𝐍𝐆 𝐍𝐎𝐊𝐈𝐀 𝐅𝐑𝐀𝐌𝐄...*");

    // Download media and setup temporary path
    const mediaBuffer = await target.download();
    const extension = mime.includes('png') ? '.png' : '.jpg';
    const tempPath = path.join(os.tmpdir(), `nokia_${Date.now()}${extension}`);
    fs.writeFileSync(tempPath, mediaBuffer);

    // Prepare upload to Catbox moe
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempPath), `file${extension}`);
    form.append('reqtype', 'fileupload');

    const upload = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    // Extract the image URL and clean up temporary file immediately
    const imageUrl = upload.data;
    fs.unlinkSync(tempPath);

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error("Catbox upload failed.");
    }

    // Call the editing API to place the image in the Nokia frame
    const apiUrl = `https://api.popcat.xyz/v2/nokia?image=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response || !response.data) {
      return reply("❌ *𝐄𝐑𝐑𝐎𝐑:* The image generation API failed.");
    }

    const imageBuffer = Buffer.from(response.data, "binary");

    // Send the final result with the updated WATSON XD branding
    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `📸 *𝐍𝐎𝐊𝐈𝐀 𝐅𝐑𝐀𝐌𝐄 𝐀𝐏𝐏𝐋𝐈𝐄𝐃*\n\n${FOOTER}`
    }, { quoted: mek });

  } catch (error) {
    console.error("Nokia Edit Error:", error);
    reply(`⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* The process could not be completed.`);
  }
});
