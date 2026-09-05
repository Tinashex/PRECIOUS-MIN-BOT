import { cmd } from '../command.js';
import config from '../config.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "ship",
  alias: ["match", "love"],
  desc: "Randomly pairs the sender with another group member.",
  react: "❤️",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, groupMetadata, reply, sender }) => {
  try {
    // 1. Group Check
    if (!isGroup) return reply("❌ This command can only be used in groups!");

    const participants = groupMetadata.participants.map(user => user.id);
    const devNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;
    
    let randomPair;

    // 2. Logic: If Developer is in the group, force the ship with them
    if (devNumber && participants.includes(devNumber) && sender !== devNumber) {
      randomPair = devNumber;
    } else {
      // Otherwise, pick a random person (excluding the sender)
      const eligible = participants.filter(id => id !== sender);
      if (eligible.length < 1) return reply("❌ Not enough participants to find a match!");
      randomPair = eligible[Math.floor(Math.random() * eligible.length)];
    }

    // 3. Construct Message
    const message = `💘 *𝐌𝐀𝐓𝐂𝐇 𝐅𝐎𝐔𝐍𝐃!* 💘\n\n` +
                    `❤️ *@${sender.split("@")[0]}* +  *@${randomPair.split("@")[0]}*\n\n` +
                    `✨ *Congratulations!* A perfect connection has been detected. 🎉\n\n` +
                    `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

    // 4. Send Message (Zero Newsletter Metadata)
    await conn.sendMessage(from, {
      text: message,
      mentions: [sender, randomPair],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
        // Newsletter metadata strictly removed
      }
    }, { quoted: mek });

  } catch (error) {
    console.error("Ship Command Error:", error);
    reply("⚠️ An error occurred while calculating the match.");
  }
});
