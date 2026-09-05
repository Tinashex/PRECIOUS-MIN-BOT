import { cmd } from '../command.js';
import { fetchJson, getBuffer } from '../lib/functions2.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃";

// Configuration for Logo Effects
const logoEffects = [
    { pattern: "3dcomic", url: "https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html" },
    { pattern: "dragonball", url: "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html" },
    { pattern: "deadpool", url: "https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html" },
    { pattern: "blackpink", url: "https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html" },
    { pattern: "neonlight", url: "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html" },
    { pattern: "cat", url: "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html" },
    { pattern: "sadgirl", url: "https://en.ephoto360.com/write-text-on-wet-glass-online-589.html" },
    { pattern: "pornhub", url: "https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html" },
    { pattern: "naruto", url: "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html" },
    { pattern: "thor", url: "https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html" },
    { pattern: "america", url: "https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html" },
    { pattern: "eraser", url: "https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html" },
    { pattern: "3dpaper", url: "https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html" },
    { pattern: "futuristic", url: "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html" },
    { pattern: "clouds", url: "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html" },
    { pattern: "sand", url: "https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html" },
    { pattern: "galaxy", url: "https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html" },
    { pattern: "leaf", url: "https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html" },
    { pattern: "sunset", url: "https://en.ephoto360.com/create-sunset-light-text-effects-online-807.html" },
    { pattern: "nigeria", url: "https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html" },
    { pattern: "devilwings", url: "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html" },
    { pattern: "hacker", url: "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html" },
    { pattern: "boom", url: "https://en.ephoto360.com/boom-text-comic-style-text-effect-675.html" },
    { pattern: "luxury", url: "https://en.ephoto360.com/floral-luxury-logo-collection-for-branding-616.html" },
    { pattern: "zodiac", url: "https://en.ephoto360.com/create-star-zodiac-wallpaper-mobile-604.html" },
    { pattern: "angelwings", url: "https://en.ephoto360.com/angel-wing-effect-329.html" },
    { pattern: "bulb", url: "https://en.ephoto360.com/text-effects-incandescent-bulbs-219.html" },
    { pattern: "tattoo", url: "https://en.ephoto360.com/make-tattoos-online-by-empire-tech-309.html" },
    { pattern: "castle", url: "https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html" },
    { pattern: "frozen", url: "https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html" },
    { pattern: "paint", url: "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html" },
    { pattern: "birthday", url: "https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html" },
    { pattern: "typography", url: "https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html" },
    { pattern: "bear", url: "https://en.ephoto360.com/free-bear-logo-maker-online-673.html" }
];

// DYNAMIC COMMAND GENERATOR
logoEffects.forEach(effect => {
    cmd({
        pattern: effect.pattern,
        desc: `Create a ${effect.pattern} style logo/text effect.`,
        category: "logo",
        react: "🎨",
        filename: __filename
    }, async (conn, mek, m, { from, args, reply }) => {
        try {
            if (!args.length) return reply(`✍️ *USAGE:* .${effect.pattern} [Text]\nExample: .${effect.pattern} Watson XT`);
            
            const name = args.join(" ");
            await reply("⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐃𝐄𝐒𝐈𝐆𝐍𝐈𝐍𝐆 𝐘𝐎𝐔𝐑 𝐋𝐎𝐆𝐎...*");
            
            const apiUrl = `https://api-pink-venom.vercel.app/api/logo?url=${effect.url}&name=${encodeURIComponent(name)}`;
            const result = await fetchJson(apiUrl);

            if (!result?.result?.download_url) {
                return reply("❌ *𝐄𝐑𝐑𝐎𝐑:* Failed to generate logo. API might be down.");
            }

            await conn.sendMessage(from, {
                image: { url: result.result.download_url },
                caption: `🎨 *${effect.pattern.toUpperCase()} 𝐋𝐎𝐆𝐎 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃*\n\n✨ *Text:* ${name}\n\n${FOOTER}`
            }, { quoted: mek });

        } catch (e) {
            console.error(`Logo Error (${effect.pattern}):`, e);
            reply("⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* Logo generation protocol interrupted.");
        }
    });
});

// SPECIAL HANDLING FOR MULTI-INPUT (Valorant)
cmd({
    pattern: "valorant",
    desc: "Create a Valorant YouTube banner (3 text inputs required).",
    category: "logo",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (args.length < 3) {
            return reply(`✍️ *USAGE:* .valorant [Text1] [Text2] [Text3]\nExample: .valorant PRECIOUS MD 2026`);
        }

        const t1 = args[0], t2 = args[1], t3 = args.slice(2).join(" ");
        await reply("⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐃𝐄𝐒𝐈𝐆𝐍𝐈𝐍𝐆 𝐘𝐎𝐔𝐑 𝐁𝐀𝐍𝐍𝐄𝐑...*");

        const apiUrl = `https://api.nexoracle.com/ephoto360/valorant-youtube-banner?apikey=MepwBcqIM0jYN0okD&text1=${encodeURIComponent(t1)}&text2=${encodeURIComponent(t2)}&text3=${encodeURIComponent(t3)}`;
        const buffer = await getBuffer(apiUrl);

        await conn.sendMessage(from, {
            image: buffer, 
            caption: `🎮 *𝐕𝐀𝐋𝐎𝐑𝐀𝐍𝐓 𝐁𝐀𝐍𝐍𝐄𝐑 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄𝐃*\n\n${FOOTER}`
        }, { quoted: mek });
    } catch (e) {
        reply("⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* Failed to generate banner.");
    }
});
