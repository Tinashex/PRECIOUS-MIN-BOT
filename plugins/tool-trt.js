import axios from 'axios';
import config from '../config.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "trt",
    alias: ["translate", "trans"],
    desc: "Translate text into any language.",
    react: "🌍",
    category: "utility",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply(`✍️ *𝐇𝐨𝐰 𝐭𝐨 𝐮𝐬𝐞:* \n.trt [lang] [text]\nExample: .trt xh Hello how are you?`);

        const args = q.split(' ');
        let targetLang = args[0];
        let textToTranslate;

        // Smart Logic: If the first arg isn't a 2-letter code, default to isiXhosa (xh)
        if (targetLang.length !== 2) {
            targetLang = 'xh'; 
            textToTranslate = q;
        } else {
            textToTranslate = args.slice(1).join(' ');
        }

        if (!textToTranslate) return reply("❗ Please provide the text you want to translate.");

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${targetLang}`;

        const response = await axios.get(url);
        const translation = response.data.responseData.translatedText;

        // 4. STYLIZED TEXT UI (Zero Footprint)
        const translationMessage = `🌍 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐓𝐑𝐀𝐍𝐒𝐋𝐀𝐓𝐎𝐑* 🌍\n\n` +
            `📝 *Original:* ${textToTranslate}\n` +
            `✨ *Translated:* ${translation}\n` +
            `🌐 *Target Language:* ${targetLang.toUpperCase()}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        return await conn.sendMessage(from, { 
            text: translationMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Translation Error:", e);
        return reply("⚠️ *SYSTEM ERROR:* Failed to fetch translation. Please check the language code.");
    }
});
