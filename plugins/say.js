import { cmd } from '../command.js';
import googleTTS from 'google-tts-api';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "say",
    alias: ["tts", "speak", "voice"],
    desc: "Convert text to a professional AI voice note.",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("✍️ Please provide text to speak (max 200 chars).");

        let lang = "en";
        let text = q.trim();

        const match = text.match(/^([a-z]{2,3}):(.*)$/i);
        if (match) {
            lang = match[1].toLowerCase();
            text = match[2].trim();
        }

        if (!text) return reply("❌ Text cannot be empty.");
        if (text.length > 200) return reply(`⚠️ Text too long (max 200 chars).`);

        // Send "processing" reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Generate Google TTS URL
        const audioUrl = googleTTS.getAudioUrl(text, {
            lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // Send audio as PTT
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            ptt: true
        }, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error("TTS Error:", error);

        // Error reaction
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });

        reply(
            "⚠️ Failed to generate voice.\n" +
            "• Check the text length (≤200 chars)\n" +
            "• Check language code\n" +
            "• Ensure network access"
        );
    }
});