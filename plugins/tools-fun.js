import axios from 'axios';
import fetch from 'node-fetch';
import { sleep } from '../lib/functions.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// 1. JOKE COMMAND
cmd({
  pattern: "joke",
  desc: "😂 Get a random joke.",
  react: "🤣",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const res = await axios.get("https://official-joke-api.appspot.com/random_joke");
    const joke = res.data;
    const jokeMsg = `🤣 *𝐉𝐎𝐊𝐄 𝐓𝐈𝐌𝐄* 🤣\n\n*${joke.setup}*\n\n${joke.punchline} 😆\n\n${FOOTER}`;
    return reply(jokeMsg);
  } catch (e) {
    reply("⚠️ Joke API is currently down. Try again later.");
  }
});

// 2. TRUTH OR DARE SYSTEM
const shizokeys = 'shizo';
['truth', 'dare', 'flirt'].forEach((type) => {
    cmd({
        pattern: type,
        desc: `Get a random ${type} line.`,
        react: type === 'truth' ? "❓" : type === 'dare' ? "🎯" : "💘",
        category: "fun",
        filename: __filename
    }, async (conn, mek, m, { from, reply }) => {
        try {
            const res = await fetch(`https://shizoapi.onrender.com/api/texts/${type}?apikey=${shizokeys}`);
            const json = await res.json();
            if (!json.result) throw new Error();
            
            const msg = `✨ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 ${type.toUpperCase()}* ✨\n\n${json.result}\n\n${FOOTER}`;
            await conn.sendMessage(from, { text: msg, mentions: [m.sender] }, { quoted: mek });
        } catch (e) {
            reply(`⚠️ Failed to fetch ${type}.`);
        }
    });
});

// 3. FACT COMMAND
cmd({
  pattern: "fact",
  desc: "🧠 Get a random fun fact.",
  react: "🧠",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    const res = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
    const factMsg = `🧠 *𝐑𝐀𝐍𝐃𝐎𝐌 𝐅𝐀𝐂𝐓* 🧠\n\n${res.data.text}\n\n${FOOTER}`;
    return reply(factMsg);
  } catch (e) {
    reply("⚠️ Fact API is offline.");
  }
});

// 4. CHARACTER CHECK
cmd({
    pattern: "character",
    alias: ["char"],
    desc: "Check the character of a mentioned user.",
    react: "🔥",
    category: "fun",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, reply }) => {
    if (!isGroup) return reply("❌ This is a group-only feature.");
    const mention = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mention) return reply("✍️ Please mention a user.");

    const traits = ["Sigma", "Generous", "Grumpy", "Simp", "Kind", "Pervert", "Cool", "Brilliant", "Sexy", "Gorgeous", "Cute"];
    const trait = traits[Math.floor(Math.random() * traits.length)];
    
    const msg = `🔥 *𝐂𝐇𝐀𝐑𝐀𝐂𝐓𝐄𝐑 𝐑𝐄𝐏𝐎𝐑𝐓* 🔥\n\n👤 *User:* @${mention.split("@")[0]}\n🎭 *Trait:* ${trait}\n\n${FOOTER}`;
    await conn.sendMessage(from, { text: msg, mentions: [mention] }, { quoted: mek });
});

// 5. REPEAT / SPAM SYSTEM (Owner Only for Security)
cmd({
  pattern: "repeat",
  alias: ["rp"],
  desc: "Repeat a message (Spam text).",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { args, isOwner, reply }) => {
  if (!isOwner) return reply("🚫 Developer Only.");
  const [countStr, ...text] = args.join(" ").split(",");
  const count = parseInt(countStr);
  if (isNaN(count) || count > 100) return reply("❎ Limit: 1-100");
  
  const content = text.join(",").trim();
  const repeated = Array(count).fill(content).join("\n");
  reply(`🔄 *𝐑𝐄𝐏𝐄𝐀𝐓𝐄𝐃 ${count}𝐗*\n\n${repeated}\n\n${FOOTER}`);
});

// 6. READMORE GENERATOR
cmd({
  pattern: "readmore",
  alias: ["rm"],
  desc: "Generate a Read More gap.",
  category: "utility",
  react: "📝",
  filename: __filename
}, async (conn, mek, m, { args }) => {
    const text = args.join(" ") || "PRECIOUS-MD";
    const readMore = String.fromCharCode(8206).repeat(4000);
    const msg = `${text} ${readMore} \n\n*Created by Watson XT*\n${FOOTER}`;
    await conn.sendMessage(m.chat || m.from, { text: msg }, { quoted: mek });
});
