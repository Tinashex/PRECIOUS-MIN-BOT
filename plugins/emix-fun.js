import { cmd } from '../command.js';
import { fetchEmix } from '../lib/emix-utils.js';
import { getBuffer } from '../lib/functions.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "emix",
    alias: ["emojimix", "mix"],
    desc: "Combine two emojis into a custom sticker.",
    category: "fun",
    react: "😃",
    use: ".emix 😂,🙂",
    filename: __filename,
}, async (conn, mek, m, { args, q, reply, from }) => {
    try {
        // 1. Validation: Ensure two emojis are provided
        if (!q || !q.includes(",")) {
            return reply("❌ *Usage:* .emix 😂,🙂\n_Send two emojis separated by a comma._");
        }

        let [emoji1, emoji2] = q.split(",").map(e => e.trim());

        if (!emoji1 || !emoji2) {
            return reply("❌ Please provide two emojis separated by a comma.");
        }

        // 2. Loading State
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // 3. Fetch the mixed emoji URL
        let imageUrl = await fetchEmix(emoji1, emoji2);

        if (!imageUrl) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("❌ Could not generate emoji mix. Some emoji combinations aren't supported.");
        }

        // 4. Create the Sticker
        let buffer = await getBuffer(imageUrl);
        let sticker = new Sticker(buffer, {
            pack: "PRECIOUS-MD",
            author: "WATSON XD", // Updated Branding
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            quality: 75,
            background: "transparent",
        });

        const stickerBuffer = await sticker.toBuffer();

        // 5. Send the Sticker
        await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });

        // 6. Success Reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("EmojiMix Error:", e);
        reply(`❌ Error: ${e.message || "Failed to create sticker."}`);
    }
});
