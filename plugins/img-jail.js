import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "jail",
    alias: ["prison", "jailedit"],
    desc: "Apply a prison cell effect to any image.",
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
        // Dynamic extension detection for better server handling
        const ext = mimeType.includes('png') ? '.png' : '.jpg';
        const tempPath = path.join(os.tmpdir(), `watson_jail_${Date.now()}${ext}`);
        fs.writeFileSync(tempPath, mediaBuffer);

        // 3. UPLOAD TO CATBOX (API PREREQUISITE)
        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(tempPath));
        form.append('reqtype', 'fileupload');

        const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders(),
            timeout: 30000 // 30s timeout for Katabump stability
        });

        const imageUrl = uploadRes.data.trim();
        // Immediate temp file cleanup to maintain server health
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); 

        if (!imageUrl.startsWith('http')) throw new Error("Upload Failed");

        // 4. GENERATE JAILED IMAGE
        const apiUrl = `https://api.popcat.xyz/v2/jail?image=${encodeURIComponent(imageUrl)}`;
        const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

        if (!response.data) throw new Error("API failed to process image");

        const resultBuffer = Buffer.from(response.data, "binary");

        // 5. SEND FINAL RESULT (Zero Footprint)
        await conn.sendMessage(m.chat, {
            image: resultBuffer,
            caption: `⚖️ *𝐉𝐀𝐈𝐋𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘*\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
                // Newsletter metadata strictly removed
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Jail Edit Error:", error);
        reply("⚠️ *SYSTEM ERROR:* Failed to process the image. The editing service might be busy.");
    }
});
