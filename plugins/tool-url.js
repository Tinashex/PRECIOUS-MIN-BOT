import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "tourl",
    alias: ["url", "imgtourl", "upload"],
    desc: "Convert image, video, or audio to a Catbox link.",
    category: "utility",
    react: "🖇️",
    filename: __filename
}, async (conn, mek, m, { reply, quoted }) => {
    try {
        // 1. DATA VALIDATION
        const targetMsg = quoted ? quoted : m;
        const mimeType = (targetMsg.msg || targetMsg).mimetype || '';
        
        if (!mimeType) return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐦𝐞𝐝𝐢𝐚!* \n(Image, Video, or Audio)");

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // 2. MEDIA PROCESSING
        const mediaBuffer = await targetMsg.download();
        const ext = mimeType.split('/')[1] || 'bin';
        const tempFilePath = path.join(os.tmpdir(), `watson_xd_${Date.now()}.${ext}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        // 3. CATBOX UPLOAD LOGIC
        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(tempFilePath));
        form.append('reqtype', 'fileupload');

        const response = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders(),
            timeout: 60000 // 60s timeout for larger files
        });

        // 4. CLEANUP
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

        if (!response.data || typeof response.data !== 'string') throw new Error("Upload Failed");

        const mediaUrl = response.data.trim();
        let mediaType = mimeType.split('/')[0].toUpperCase();

        // 5. STYLIZED TEXT UI (Zero Footprint)
        const successMsg = `🖇️ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐔𝐑𝐋 𝐆𝐄𝐍* 🖇️\n\n` +
            `📍 *Type:* ${mediaType}\n` +
            `📦 *Size:* ${formatBytes(mediaBuffer.length)}\n` +
            `🔗 *Link:* ${mediaUrl}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        await conn.sendMessage(m.chat, { 
            text: successMsg,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("ToURL Error:", error);
        reply("⚠️ *SYSTEM ERROR:* Failed to generate URL. The file might be too large.");
    }
});

// Helper function to format bytes for the Harare setup
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
