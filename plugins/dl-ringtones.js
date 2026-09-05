import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "ringtone",
    alias: ["ringtones", "ring"],
    desc: "Search and download ringtones",
    react: "🎵",
    category: "fun",
    use: ".ringtone <name>",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("🎵 *Please provide a search query!*\nExample: .ringtone iPhone");
        }

        // 1. Loading Reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // 2. Fetch from alternative Public API
        const url = `https://api.giftedtech.my.id/api/search/ringtone?apikey=gifted&query=${encodeURIComponent(query)}`;
        const { data } = await axios.get(url);

        if (!data.success || !data.results || data.results.length === 0) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ No ringtones found for your query. Try different keywords.");
        }

        // 3. Select a random result from the list
        const results = data.results;
        const selected = results[Math.floor(Math.random() * results.length)];

        // 4. Send the Audio File
        await conn.sendMessage(
            from,
            {
                audio: { url: selected.download },
                mimetype: "audio/mpeg",
                fileName: `${selected.title}.mp3`,
                ptt: false // Set to true if you want it as a voice note
            },
            { quoted: mek }
        );

        // 5. Final success message/reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        
        // Optional: Send text confirmation with branding
        await reply(`🎧 *${selected.title}*\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`);

    } catch (error) {
        console.error("Ringtone Error:", error);
        reply("❌ An error occurred while fetching the ringtone.");
    }
});
