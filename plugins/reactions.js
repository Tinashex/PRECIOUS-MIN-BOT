import { cmd } from '../command.js';
import { fetchGif, gifToVideo } from '../lib/fetchGif.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// List of all reaction types and their emojis
const reactions = [
    { name: "cry", emoji: "😢", text: "is crying over" },
    { name: "cuddle", emoji: "🤗", text: "cuddled" },
    { name: "bully", emoji: "😈", text: "is bullying" },
    { name: "hug", emoji: "🫂", text: "hugged" },
    { name: "awoo", emoji: "🐺", text: "awoos at" },
    { name: "lick", emoji: "👅", text: "licked" },
    { name: "pat", emoji: "🫂", text: "patted" },
    { name: "smug", emoji: "😏", text: "is smug at" },
    { name: "bonk", emoji: "🔨", text: "bonked" },
    { name: "yeet", emoji: "💨", text: "yeeted" },
    { name: "blush", emoji: "😊", text: "is blushing at" },
    { name: "handhold", emoji: "🤝", text: "is holding hands with" },
    { name: "highfive", emoji: "✋", text: "gave a high-five to" },
    { name: "nom", emoji: "🍽️", text: "is nomming" },
    { name: "wave", emoji: "👋", text: "waved at" },
    { name: "smile", emoji: "😁", text: "smiled at" },
    { name: "wink", emoji: "😉", text: "winked at" },
    { name: "happy", emoji: "😊", text: "is happy with" },
    { name: "glomp", emoji: "🤗", text: "glomped" },
    { name: "bite", emoji: "🦷", text: "bit" },
    { name: "poke", emoji: "👉", text: "poked" },
    { name: "cringe", emoji: "😬", text: "thinks it is cringe at" },
    { name: "dance", emoji: "💃", text: "danced with" },
    { name: "kill", emoji: "🔪", text: "killed" },
    { name: "slap", emoji: "✊", text: "slapped" },
    { name: "kiss", emoji: "💋", text: "kissed" }
];

// DYNAMIC COMMAND GENERATOR
reactions.forEach((react) => {
    cmd(
        {
            pattern: react.name,
            desc: `Send a ${react.name} reaction GIF.`,
            category: "fun",
            react: react.emoji,
            filename: __filename,
        },
        async (conn, mek, m, { reply }) => {
            try {
                const sender = `@${mek.sender.split("@")[0]}`;
                const mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
                
                let message;
                if (mentionedUser) {
                    const target = `@${mentionedUser.split("@")[0]}`;
                    message = `${sender} ${react.text} ${target}`;
                } else {
                    // Default message if no one is tagged
                    message = m.isGroup 
                        ? `${sender} ${react.text} everyone!` 
                        : `${FOOTER}`;
                }

                // 1. FETCH GIF FROM WAIFU.PICS API
                const { data } = await axios.get(`https://api.waifu.pics/sfw/${react.name}`);
                
                // 2. CONVERSION (Optimized for Harare Server Bandwidth)
                const gifBuffer = await fetchGif(data.url);
                const videoBuffer = await gifToVideo(gifBuffer);

                // 3. EXECUTION
                await conn.sendMessage(
                    mek.chat,
                    { 
                        video: videoBuffer, 
                        caption: message, 
                        gifPlayback: true, 
                        mentions: [mek.sender, mentionedUser].filter(Boolean) 
                    },
                    { quoted: mek }
                );
            } catch (error) {
                console.error(`Error in .${react.name}:`, error);
                reply(`❌ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* Failed to generate reaction.`);
            }
        }
    );
});
