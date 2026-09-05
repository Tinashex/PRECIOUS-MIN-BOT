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
  pattern: "wanted",
  alias: ["wantedposter", "wtd"],
  react: '📸',
  desc: "Generate a 'Wanted' poster style image from your photo.",
  category: "edit",
  filename: __filename
}, async (conn, mek, m, { reply, quoted }) => {
  try {
    // 1. INPUT VALIDATION
    const target = quoted ? quoted : m;
    const mime = (target.msg || target).mimetype || '';
    
    if (!mime || !mime.startsWith('image/')) {
      return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞 (𝐉𝐏𝐄𝐆/𝐏𝐍𝐆).*");
    }

    await reply("⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐀𝐏𝐏𝐋𝐘𝐈𝐍𝐆 𝐏𝐎𝐒𝐓𝐄𝐑 𝐄𝐅𝐅𝐄𝐂𝐓...*");

    // 2. BUFFER & TEMP STORAGE
    const mediaBuffer = await target.download();
    const extension = mime.includes('png') ? '.png' : '.jpg';
    const tempPath = path.join(os.tmpdir(), `wanted_${Date.now()}${extension}`);
    fs.writeFileSync(tempPath, mediaBuffer);

    // 3. SECURE UPLOAD (Catbox)
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempPath), `file${extension}`);
    form.append('reqtype', 'fileupload');

    const upload = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    const imageUrl = upload.data;
    fs.unlinkSync(tempPath); // Immediate cleanup for server health

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error("Cloud upload failed");
    }

    // 4. IMAGE EDITING EXECUTION
    const apiUrl = `https://api.popcat.xyz/v2/wanted?image=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

    if (!response || !response.data) {
      return reply("❌ *𝐄𝐑𝐑𝐎𝐑:* The editing API is currently unavailable.");
    }

    const imageBuffer = Buffer.from(response.data, "binary");

    // 5. STYLIZED DELIVERY
    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: `📸 *𝐖𝐀𝐍𝐓𝐄𝐃 𝐏𝐎𝐒𝐓𝐄𝐑 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃*\n\n${FOOTER}`
    }, { quoted: mek });

  } catch (error) {
    console.error("Wanted Edit Error:", error);
    reply(`⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* Edit failed. Please try again later.`);
  }
});
