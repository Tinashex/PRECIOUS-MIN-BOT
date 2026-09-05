import { cmd } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

// Safety Filter Keywords
const forbiddenKeywords = [
    "porn", "sex", "hentai", "xvide", "xnxx", "nude", "naked", 
    "pussy", "dick", "ass", "bj", "vagina", "penis", "erotic", 
    "adult", "18+", "nsfw", "brazzers"
];

cmd({
    pattern: "img",
    alias: ["image", "searchimg", "gimg"],
    react: "🦋",
    desc: "Search and download images (Safe Search)",
    category: "fun",
    use: ".img <keywords>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ").toLowerCase();
        
        if (!query) {
            return reply("🖼️ Please provide a search query\nExample: .img Harare City");
        }

        // 1. Safety Filter Check
        const containsForbidden = forbiddenKeywords.some(word => query.includes(word));
        if (containsForbidden) {
            await conn.sendMessage(from, { react: { text: "🚫", key: mek.key } });
            return reply("❌ *𝐒𝐀𝐅𝐄𝐓𝐘 𝐀𝐋𝐄𝐑𝐓:* Inappropriate content is not allowed.\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃");
        }

        // 2. Search Reaction
        await conn.sendMessage(from, { react: { text: "🔍", key: mek.key } });

        // 3. Call Public Search API (Alternative to David)
        const url = `https://api.giftedtech.my.id/api/search/googleimage?apikey=gifted&query=${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        // 4. Validate Results
        if (!response.data || !response.data.results || response.data.results.length === 0) {
            return reply("❌ No images found for that query. Try different keywords.");
        }

        const results = response.data.results;
        
        // 5. Select 5 random images
        const selectedImages = results
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        // 6. Send images to the user
        for (const imageUrl of selectedImages) {
            await conn.sendMessage(
                from,
                { 
                    image: { url: imageUrl },
                    caption: `📷 *𝐑𝐞𝐬𝐮𝐥𝐭 𝐟𝐨𝐫:* ${query}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`
                },
                { quoted: mek }
            );
            
            // Delay to prevent spam detection
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        // 7. Success Reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (error) {
        console.error('Image Search Error:', error);
        reply(`❌ Error: Image API is currently unavailable.`);
    }
});
