import googleTTS from 'google-tts-api';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃";

cmd({
    pattern: "tts",
    alias: ["say", "voice"],
    desc: "Convert text into a professional AI voice message.",
    category: "convert",
    react: "🎙️",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        // 1. INPUT VALIDATION
        if (!q) return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐭𝐞𝐱𝐭 𝐭𝐨 𝐜𝐨𝐧𝐯𝐞𝐫𝐭.* \nExample: `.tts Hello Watson XT`.");

        // 2. TTS GENERATION
        // Defaulting to English (en). Change to 'en-ZA' for South African accent.
        const url = googleTTS.getAudioUrl(q, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        // 3. STYLIZED DELIVERY
        await conn.sendMessage(from, { 
            audio: { url: url }, 
            mimetype: 'audio/mpeg', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: "𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐀𝐈 𝐕𝐎𝐈𝐂𝐄",
                    body: "𝐓𝐞𝐱𝐭-𝐭𝐨-𝐒𝐩𝐞𝐞𝐜𝐡 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥",
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("TTS Error:", e);
        reply("⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* Failed to generate voice message.");
    }
});
