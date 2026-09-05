import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "imgjoke",
    alias: ["jokedit", "overhead"],
    desc: "Apply a 'Joke Overhead' effect to any image.",
    category: "img_edit",
    react: "📸",
    filename: __filename
}, async (conn, mek, m, { reply, quoted }) => {
    try {
        // 1. DATA VALIDATION
        const targetMsg = quoted ? quoted : m;
        const mimeType = (targetMsg.msg || targetMsg).mimetype || '';
        
        if (!mimeType || !mimeType.startsWith('image/')) {
            return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚𝐧 𝐢𝐦𝐚𝐠𝐞!* \n(JPEG or PNG only)");
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // 2. DOWNLOAD & TEMP STORAGE
        const mediaBuffer = await targetMsg.download();
        const ext = mimeType.includes('png') ? '.png' : '.jpg';
        const tempPath = path.join(os.tmpdir(), `watson_joke_${Date.now()}${ext}`);
        fs.writeFileSync(tempPath, mediaBuffer);

        // 3. UPLOAD TO CATBOX (API PREREQUISITE)
        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(tempPath));
        form.append('reqtype', 'fileupload');

        const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders(),
            timeout: 30000
        });

        const imageUrl = uploadRes.data.trim();
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); // Immediate cleanup

        if (!imageUrl.startsWith('http')) throw new Error("Upload Failed");

        // 4. GENERATE JOKE IMAGE
        const apiUrl = `https://api.popcat.xyz/v2/jokeoverhead?image=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

        if (!response.data) throw new Error("API failed to process image");

        const resultBuffer = Buffer.from(response.data, "binary");

        // 5. SEND FINAL RESULT (Zero Footprint)
        await conn.sendMessage(m.chat, {
            image: resultBuffer,
            caption: `📸 *𝐈𝐌𝐆 𝐉𝐎𝐊𝐄 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃*\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("ImgJoke Error:", error);
        reply("⚠️ *SYSTEM ERROR:* Failed to process the image. The API might be down.");
    }
});
