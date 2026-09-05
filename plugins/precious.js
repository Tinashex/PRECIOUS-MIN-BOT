import { cmd } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "me",
    alias: ["me", "precious", "ask"],
    desc: "Advanced AI with Vision and Identity.",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, react, pushname, quoted }) => {
    try {
        if (!q && !m.quoted?.message?.imageMessage && !m.message?.imageMessage) {
            return reply(`✍️ *𝐇𝐞𝐥𝐥𝐨 ${pushname}, 𝐡𝐨𝐰 𝐜𝐚𝐧 𝐈 𝐡𝐞𝐥𝐩 𝐲𝐨𝐮 𝐭𝐨𝐝𝐚𝐲?*`);
        }

        await react("⏳");

        // 1. DYNAMIC IDENTITY & CONTEXT
        const zimTime = new Date().toLocaleString("en-GB", { timeZone: "Africa/Harare" });
        const systemPrompt = `You are PRECIOUS-MD, created by Watson-Xd (Watson Xd), a 22-year-old genius developer from Zimbabwe.
        Current Time in Zimbabwe: ${zimTime}.
        If anyone asks about your creator or origin, proudly mention Watson-Xd. 
        You can now 'see' images if they are provided. Keep responses witty and professional.`;

        // 2. VISION LOGIC (If user sends or replies to an image)
        const isImage = m.message?.imageMessage || m.quoted?.message?.imageMessage;
        
        if (isImage) {
            const target = m.message?.imageMessage ? m : m.quoted;
            const buffer = await target.download();
            
            // Uploading to a temporary host for the AI to process
            const FormData = (await import('form-data')).default;
            const form = new FormData();
            form.append('fileToUpload', buffer, 'image.jpg');
            form.append('reqtype', 'fileupload');
            
            const upload = await axios.post("https://catbox.moe/user/api.php", form, { headers: form.getHeaders() });
            const imageUrl = upload.data;

            // Using Vision API
            const visionUrl = `https://api.giftedtech.my.id/api/ai/gemini-vision?prompt=${encodeURIComponent(q || "Describe this image")}&url=${encodeURIComponent(imageUrl)}`;
            const visionRes = await axios.get(visionUrl);
            var aiResponse = visionRes.data.result;
        } else {
            // 3. STANDARD TEXT LOGIC
            const textUrl = `https://api.giftedtech.my.id/api/ai/gpt4?prompt=${encodeURIComponent(systemPrompt + " | User: " + q)}`;
            const textRes = await axios.get(textUrl);
            var aiResponse = textRes.data.result;
        }

        // 4. STYLIZED DELIVERY
        const formattedResponse = `🤖 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐀𝐈*\n\n` +
                                  `${aiResponse}\n\n` +
                                  `${FOOTER}`;

        await conn.sendMessage(from, { 
            text: formattedResponse,
            contextInfo: {
                externalAdReply: {
                    title: "𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐈𝐍𝐓𝐄𝐋𝐋𝐈𝐆𝐄𝐍𝐂𝐄",
                    body: isImage ? "𝐕𝐢𝐬𝐢𝐨𝐧 𝐌𝐨𝐝𝐞 𝐀𝐜𝐭𝐢𝐯𝐞 👁️" : "𝐀𝐝𝐯𝐚𝐧𝐜𝐞𝐝 𝐀𝐈 𝐂𝐡𝐚𝐭 🧠",
                    thumbnailUrl: "https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png",
                    sourceUrl: "https://github.com/watson-dev1",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        await react("✅");

    } catch (e) {
        console.error("AI Error:", e);
        await react("❌");
        reply("⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* I encountered a glitch in the matrix.");
    }
});
