import { cmd } from '../command.js';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: 'gitclone',
  alias: ["git", "github"],
  desc: "Download any GitHub repository as a zip file.",
  react: '📦',
  category: "downloader",
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    // 1. Validation
    if (!args[0]) {
      return reply("❌ *Where is the GitHub link?*\n\nExample:\n.gitclone https://github.com/watson-dev1/PRECIOUS-MD");
    }

    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?/i;
    const match = args[0].match(githubRegex);

    if (!match) {
      return reply("⚠️ *Invalid GitHub link.* Please provide a valid repository URL.");
    }

    const [, username, repo] = match;
    const zipUrl = `https://api.github.com/repos/${username}/${repo.replace(/\/$/, '')}/zipball`;

    // 2. Loading Reaction
    await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

    // 3. Metadata Check
    const response = await fetch(zipUrl, { method: "HEAD" });
    if (!response.ok) {
      return reply("❌ *Repository not found.* Make sure it is public.");
    }

    const fileName = `${repo.replace(/\/$/, '')}.zip`;

    // 4. Send Confirmation
    const statusMsg = `📥 *𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐈𝐍𝐆 𝐑𝐄𝐏𝐎𝐒𝐈𝐓𝐎𝐑𝐘*\n\n` +
                      `👤 *Owner:* ${username}\n` +
                      `📦 *Repo:* ${repo}\n\n` +
                      `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;
    
    reply(statusMsg);

    // 5. Send File (Zero Newsletter Metadata)
    await conn.sendMessage(from, {
      document: { url: zipUrl },
      fileName: fileName,
      mimetype: 'application/zip',
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true
        // Newsletter metadata strictly removed
      }
    }, { quoted: mek });

    // 6. Success Reaction
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (error) {
    console.error("GitClone Error:", error);
    reply("❌ Failed to download the repository. Please try again later.");
  }
});
