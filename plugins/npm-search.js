import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
  pattern: "npm",
  alias: ["pkg", "package"],
  desc: "Search for package details on the NPM registry.",
  react: '📦',
  category: "utility",
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    // 1. INPUT VALIDATION
    if (!args.length) {
      return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐩𝐚𝐜𝐤𝐚𝐠𝐞 𝐧𝐚𝐦𝐞.*\nExample: `.npm axios` or `.npm baileys`.");
    }

    const packageName = args[0].toLowerCase();
    const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

    // 2. DATA FETCHING
    const response = await axios.get(apiUrl).catch(() => null);
    
    if (!response || !response.data) {
      return reply(`❌ *𝐄𝐑𝐑𝐎𝐑:* Package \`${packageName}\` not found on NPM registry.`);
    }

    const data = response.data;
    const latest = data["dist-tags"]?.latest || "Unknown";
    const desc = data.description || "No description provided.";
    const license = data.license || "Not Specified";
    const author = data.author?.name || "Various Contributors";
    const repo = data.repository?.url?.replace("git+", "") || "None";
    const npmLink = `https://www.npmjs.com/package/${packageName}`;

    // 3. STYLIZED DELIVERY (WATSON XD Standards)
    const resultText = `📦 *𝐍𝐏𝐌 𝐏𝐀𝐂𝐊𝐀𝐆𝐄 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍*\n\n` +
                       `✨ *𝐍𝐚𝐦𝐞:* ${packageName}\n` +
                       `👤 *𝐀𝐮𝐭𝐡𝐨𝐫:* ${author}\n` +
                       `📄 *𝐃𝐞𝐬𝐜:* ${desc}\n` +
                       `🆙 *𝐕𝐞𝐫𝐬𝐢𝐨𝐧:* ${latest}\n` +
                       `🪪 *𝐋𝐢𝐜𝐞𝐧𝐬𝐞:* ${license}\n` +
                       `🔗 *𝐑𝐞𝐩𝐨:* ${repo}\n\n` +
                       `🌐 *𝐔𝐑𝐋:* ${npmLink}\n\n` +
                       `${FOOTER}`;

    await conn.sendMessage(from, { text: resultText }, { quoted: mek });

  } catch (error) {
    console.error("NPM Search Error:", error);
    reply("⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* Failed to retrieve registry data.");
  }
});
