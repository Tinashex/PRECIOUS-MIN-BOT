import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "marriage",
  alias: ["marige", "shadi", "wedding"],
  desc: "Randomly pairs the sender with another user for marriage.",
  react: "💍",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, groupMetadata, reply, sender }) => {
  try {
    // 1. Group Check
    if (!isGroup) return reply("❌ This command can only be used in groups!");

    const participants = groupMetadata.participants;
    // Filter out the sender to find a partner
    const eligibleParticipants = participants.filter(p => p.id !== sender);
    
    if (eligibleParticipants.length < 1) {
      return reply("❌ Not enough participants to find a match!");
    }

    // 2. Select a random partner
    const randomPartner = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)].id;

    // 3. Loading Reaction
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    // 4. Fetch Wedding/Love themed GIF
    // Using a reliable public API for the visual element
    const res = await axios.get("https://api.waifu.pics/sfw/hug");
    const gifUrl = res.data.url;

    // 5. Construct the Marriage Message
    const message = `💍 *𝐖𝐄𝐃𝐃𝐈𝐍𝐆 𝐁𝐄𝐋𝐋𝐒!* 💒\n\n` +
                    `👰 *@${sender.split("@")[0]}*\n` +
                    `🤵 *@${randomPartner.split("@")[0]}*\n\n` +
                    `✨ *Congratulations!* May your virtual marriage be full of joy and zero bugs! 💖\n\n` +
                    `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

    // 6. Send as a GIF (video with gifPlayback)
    await conn.sendMessage(
      from,
      { 
        video: { url: gifUrl }, 
        caption: message, 
        gifPlayback: true, 
        mentions: [sender, randomPartner] 
      },
      { quoted: mek }
    );

    // 7. Success Reaction
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (error) {
    console.error("Marriage Command Error:", error);
    reply("⚠️ Oops, the priest ran away! (API Error)");
  }
});
