import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
  pattern: "npm",
  alias: ["package", "npmsearch"],
  desc: "Search for a package on the NPM registry.",
  react: '📦',
  category: "info",
  filename: __filename,
  use: ".npm <package-name>"
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    // 1. INPUT VALIDATION
    if (!args.length) {
      return reply("✍️ *USAGE:* .npm <package-name>\nExample: `.npm axios`.");
    }

    const packageName = args.join(" ").toLowerCase();
    const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

    // 2. FETCH DATA
    const response = await axios.get(apiUrl).catch(() => null);
    
    if (!response || response.status !== 200) {
      return reply("❌ *ERROR:* Package not found in the NPM registry.");
    }

    const data = response.data;
    const latest = data["dist-tags"].latest;
    const meta = data.versions[latest];
    
    // Clean up repository URL for a better look in Harare
    let repo = data.repository ? (data.repository.url || data.repository) : "Not available";
    repo = repo.replace(/^git\+/, '').replace(/\.git$/, '');

    // 3. STYLIZED ANNOUNCEMENT
    const message = `📦 *𝐍𝐏𝐌 𝐏𝐀𝐂𝐊𝐀𝐆𝐄 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍*\n\n` +
      `🔰 *Package:* ${data.name}\n` +
      `📝 *Description:* ${data.description || "No description provided."}\n` +
      `⏸️ *Version:* ${latest}\n` +
      `🪪 *License:* ${data.license || "Unknown"}\n` +
      `📅 *Updated:* ${new Date(data.time.modified).toLocaleDateString()}\n\n` +
      `🪩 *Repository:* ${repo}\n` +
      `🔗 *NPM Link:* https://www.npmjs.com/package/${packageName}\n\n` +
      `${FOOTER}`;

    // 4. DELIVERY
    await conn.sendMessage(from, { 
      text: message,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
      }
    }, { quoted: mek });

  } catch (error) {
    console.error("NPM Error:", error);
    reply("⚠️ *SYSTEM ERROR:* Failed to query the NPM registry.");
  }
});
