import { cmd } from '../command.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

// 1. COMPATIBILITY CHECK
cmd({
  pattern: "compatibility",
  alias: ["friend", "fcheck"],
  desc: "Calculate the compatibility score between two users.",
  category: "fun",
  react: "💖",
  filename: __filename,
  use: "@tag1 @tag2",
}, async (conn, mek, m, { args, reply, from }) => {
  try {
    if (args.length < 2) {
      return reply("Please mention two users.\nUsage: .compatibility @user1 @user2");
    }

    let user1 = m.mentionedJid[0]; 
    let user2 = m.mentionedJid[1]; 
    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;

    let score = Math.floor(Math.random() * 1000) + 1;

    if (user1 === specialNumber || user2 === specialNumber) {
      score = 1000;
      return reply(`💖 *Compatibility:* @${user1.split('@')[0]} & @${user2.split('@')[0]}\n✨ *Score:* ${score}+/1000\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`);
    }

    await conn.sendMessage(from, {
      text: `💖 *Compatibility:* @${user1.split('@')[0]} & @${user2.split('@')[0]}\n✨ *Score:* ${score}/1000\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`,
      mentions: [user1, user2],
    }, { quoted: mek });

  } catch (e) { reply(`❌ Error: ${e.message}`); }
});

// 2. AURA CALCULATOR
cmd({
  pattern: "aura",
  desc: "Calculate aura score of a user.",
  category: "fun",
  react: "💀",
  filename: __filename,
  use: "@tag",
}, async (conn, mek, m, { args, reply, from }) => {
  try {
    let user = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
    if (!user) return reply("Tag someone to check their aura!");

    const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;
    let auraScore = Math.floor(Math.random() * 1000) + 1;

    if (user === specialNumber) {
      auraScore = 999999;
      return reply(`💀 *Aura Analysis:* @${user.split('@')[0]}\n🗿 *Aura:* ${auraScore}+ (INFINITE)\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`);
    }

    await conn.sendMessage(from, {
      text: `💀 *Aura Analysis:* @${user.split('@')[0]}\n🗿 *Aura:* ${auraScore}/1000\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`,
      mentions: [user],
    }, { quoted: mek });

  } catch (e) { reply(`❌ Error: ${e.message}`); }
});

// 3. ENGLISH ROASTS
cmd({
    pattern: "roast",
    desc: "Roast someone in English",
    category: "fun",
    react: "🔥",
    filename: __filename,
    use: "@tag"
}, async (conn, mek, m, { reply, from }) => {
    const roasts = [
        "Your IQ is lower than your Wi-Fi signal.",
        "You’re the reason God created the 'Mute' button.",
        "If I wanted to kill myself, I'd climb your ego and jump to your IQ.",
        "I’d explain it to you, but I don’t have any crayons left.",
        "You're proof that even mistakes are sometimes consistent.",
        "I’m not saying you’re stupid, you just have bad luck when it comes to thinking.",
        "You're like a cloud. When you disappear, it's a beautiful day.",
        "Somewhere out there, a tree is working very hard to produce oxygen for you. Go apologize to it.",
        "You have the face of a saint... a Saint Bernard.",
        "Don't worry about what people think of you. They don't think about you that much anyway.",
        "You're like a software update. Every time I see you, I think 'Not now'."
    ];               
        
    let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);

    if (!mentionedUser) return reply("Tag someone to roast!");

    await conn.sendMessage(from, { 
        text: `@${mentionedUser.split("@")[0]} :\n\n🔥 *${randomRoast}*\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`, 
        mentions: [mentionedUser] 
    }, { quoted: mek });
});

// 4. MAGIC 8BALL
cmd({
    pattern: "8ball",
    desc: "Magic 8-Ball answers your questions",
    category: "fun",
    react: "🎱",
    filename: __filename
}, 
async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("Ask a yes/no question!");
    const responses = ["Yes!", "No.", "Maybe...", "Definitely!", "Not sure.", "Ask again later.", "Absolutely!", "No way!"];
    let answer = responses[Math.floor(Math.random() * responses.length)];
    reply(`🎱 *Magic 8-Ball says:* ${answer}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`);
});

// 5. COMPLIMENT
cmd({
    pattern: "compliment",
    desc: "Give a nice compliment",
    category: "fun",
    react: "😊",
    filename: __filename
}, async (conn, mek, m, { reply, from }) => {
    const compliments = [
        "You're amazing just the way you are! 💖",
        "Your smile is contagious! 😊",
        "You're a genius in your own way! 🧠",
        "Your positive vibes are truly inspiring! 💫",
        "The world is better with you in it! ✨"
    ];
    let randomComp = compliments[Math.floor(Math.random() * compliments.length)];
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);

    let text = mentionedUser 
        ? `Hey @${mentionedUser.split("@")[0]}, 😊 *${randomComp}*`
        : `😊 *${randomComp}*`;

    await conn.sendMessage(from, { 
        text: `${text}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`, 
        mentions: mentionedUser ? [mentionedUser] : [] 
    }, { quoted: mek });
});

// 6. LOVE TEST
cmd({
    pattern: "lovetest",
    desc: "Check love compatibility",
    category: "fun",
    react: "❤️",
    filename: __filename
}, async (conn, mek, m, { args, reply, from }) => {
    if (args.length < 2) return reply("Tag two users!");
    let u1 = m.mentionedJid[0];
    let u2 = m.mentionedJid[1];
    let lovePercent = Math.floor(Math.random() * 100) + 1;
    
    let message = `💘 *Love Test Result* 💘\n\n❤️ @${u1.split("@")[0]} + @${u2.split("@")[0]} = *${lovePercent}%*\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;
    await conn.sendMessage(from, { text: message, mentions: [u1, u2] }, { quoted: mek });
}); 

// 7. TEXT TO EMOJI
cmd({
        pattern: "emoji",
        desc: "Convert text into emoji form.",
        category: "fun",
        react: "🙂",
        filename: __filename
    },
    async (conn, mek, m, { args, reply, from }) => {
        let text = args.join(" ").toLowerCase();
        if (!text) return reply("Provide text!");
        
        const map = { a: "🅰️", b: "🅱️", c: "🇨️", d: "🇩️", e: "🇪️", f: "🇫️", g: "🇬️", h: "🇭️", i: "🇮️", j: "🇯️", k: "🇰️", l: "🇱️", m: "🇲️", n: "🇳️", o: "🅾️", p: "🇵️", q: "🇶️", r: "🇷️", s: "🇸️", t: "🇹️", u: "🇺️", v: "🇻️", w: "🇼️", x: "🇽️", y: "🇾️", z: "🇿️", " ": "  " };
        let emojiText = text.split("").map(c => map[c] || c).join("");

        reply(`${emojiText}\n\n> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`);
    }
);
