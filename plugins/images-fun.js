import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃";
const ERROR_MSG = "❌ I can't find that image right now.";

// 1. ANIME SUITE (Waifu, Neko, Maid, etc.)
const animeCategories = [
    { pattern: "waifu", api: "https://api.waifu.pics/sfw/waifu", react: "💫", desc: "Random Waifu" },
    { pattern: "neko", api: "https://api.waifu.pics/sfw/neko", react: "🐈", desc: "Random Neko" },
    { pattern: "megumin", api: "https://api.waifu.pics/sfw/megumin", react: "❤️‍🔥", desc: "Random Megumin" },
    { pattern: "awoo", api: "https://api.waifu.pics/sfw/awoo", react: "🐺", desc: "Random Awoo" },
    { pattern: "maid", api: "https://api.waifu.im/search/?included_tags=maid", react: "🧹", desc: "Random Maid" }
];

animeCategories.forEach(cat => {
    cmd({
        pattern: cat.pattern,
        desc: cat.desc,
        category: "anime",
        react: cat.react,
        filename: __filename
    }, async (conn, mek, m, { from, reply }) => {
        try {
            let res = await axios.get(cat.api);
            let url = cat.pattern === "maid" ? res.data.images[0].url : res.data.url;
            
            await conn.sendMessage(from, { 
                image: { url: url }, 
                caption: `🌸 *${cat.desc.toUpperCase()}*\n\n${FOOTER}` 
            }, { quoted: mek });
        } catch (e) {
            reply(ERROR_MSG);
        }
    });
});

// 2. CONSOLIDATED ANIME GIRL GENERATOR
cmd({
    pattern: "animegirl",
    alias: ["agirl", "animegirl1", "animegirl2"],
    desc: "Fetch a random anime girl image.",
    category: "anime",
    react: "🧚🏻",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const res = await axios.get(`https://api.waifu.pics/sfw/waifu`);
        await conn.sendMessage(from, { 
            image: { url: res.data.url }, 
            caption: `🧚🏻 *𝐀𝐍𝐈𝐌𝐄 𝐆𝐈𝐑𝐋 𝐈𝐌𝐀𝐆𝐄*\n\n${FOOTER}` 
        }, { quoted: mek });
    } catch (e) {
        reply(ERROR_MSG);
    }
});

// 3. ANIMAL SUITE
cmd({
    pattern: "dog",
    desc: "Fetch a random dog image.",
    category: "fun",
    react: "🐶",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const res = await axios.get(`https://dog.ceo/api/breeds/image/random`);
        await conn.sendMessage(from, { 
            image: { url: res.data.message }, 
            caption: `🐶 *𝐑𝐀𝐍𝐃𝐎𝐌 𝐃𝐎𝐆 𝐈𝐌𝐀𝐆𝐄*\n\n${FOOTER}` 
        }, { quoted: mek });
    } catch (e) {
        reply(ERROR_MSG);
    }
});

// 4. ANIME BUNDLE (Multi-image)
cmd({
    pattern: "animebundle",
    alias: ["animepack"],
    desc: "Get a curated pack of anime images.",
    category: "anime",
    react: "⛱️",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const images = [
            "https://i.waifu.pics/aD7t0Bc.jpg",
            "https://i.waifu.pics/PQO5wPN.jpg",
            "https://i.waifu.pics/5At1P4A.jpg"
        ];
        
        for (let url of images) {
            await conn.sendMessage(from, { 
                image: { url: url }, 
                caption: FOOTER 
            }, { quoted: mek });
            await new Promise(resolve => setTimeout(resolve, 1000)); // Harare server stability delay
        }
    } catch (e) {
        reply(ERROR_MSG);
    }
});
