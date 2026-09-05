import crypto from 'crypto';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "gpass",
  alias: ["genpass", "password"],
  desc: "Generate a strong, secure password.",
  category: "tools",
  react: '🔐',
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    // 1. Set length (default 12, max 32 for practical use)
    const passwordLength = args[0] ? parseInt(args[0]) : 12;

    if (isNaN(passwordLength) || passwordLength < 8) {
      return reply("❌ Minimum length is 8 characters. Example: .gpass 16");
    }
    
    if (passwordLength > 32) {
      return reply("❌ Maximum length for security is 32 characters.");
    }

    // 2. Strong Character Set
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    
    // 3. Secure Generation Logic
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      password += chars[randomIndex];
    }

    // 4. Construct Message
    const resultText = `🔐 *𝐒𝐄𝐂𝐔𝐑𝐄 𝐏𝐀𝐒𝐒𝐖𝐎𝐑𝐃*\n\n` +
                       `🔑 *Password:* \`\`\`${password}\`\`\`\n` +
                       `📏 *Length:* ${passwordLength}\n\n` +
                       `*Note:* Use triple backticks to copy easily.\n\n` +
                       `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

    // 5. Send Message (Zero Newsletter/Forward context)
    await conn.sendMessage(from, { text: resultText }, { quoted: mek });
    
  } catch (error) {
    console.error("Gpass Error:", error);
    reply("❌ Error generating password.");
  }
});
