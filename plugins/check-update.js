import axios from 'axios';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { cmd, commands } from '../command.js';
import { runtime } from '../lib/functions.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cmd({
  pattern: 'version',
  alias: ["changelog", "cupdate", "checkupdate"],
  react: '🚀',
  desc: "Check bot's version, system stats, and update info.",
  category: 'info',
  filename: __filename
}, async (conn, mek, m, {
  from, sender, pushname, reply
}) => {
  try {
    const localVersionPath = path.join(__dirname, '../data/version.json');
    let localVersion = '5.0.0';
    let changelog = 'No changelog available.';
    
    if (fs.existsSync(localVersionPath)) {
      const localData = JSON.parse(fs.readFileSync(localVersionPath));
      localVersion = localData.version;
      changelog = localData.changelog;
    }

    const rawVersionUrl = 'https://raw.githubusercontent.com/watson-dev1/PRECIOUS-MD/main/data/version.json';
    let latestVersion = localVersion; 
    let latestChangelog = 'Checking for updates...';
    
    try {
      const { data } = await axios.get(rawVersionUrl);
      latestVersion = data.version;
      latestChangelog = data.changelog;
    } catch (error) {
      console.error('Failed to fetch latest version:', error);
      latestVersion = 'Unknown';
    }

    const pluginPath = path.join(__dirname, '../plugins');
    const pluginFiles = fs.readdirSync(pluginPath).filter(file => file.endsWith('.js'));
    const pluginCount = pluginFiles.length;
    const totalCommands = commands.length;

    const uptime = runtime(process.uptime());
    const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
    const hostName = os.hostname();
    const lastUpdate = fs.existsSync(localVersionPath) ? fs.statSync(localVersionPath).mtime.toLocaleString() : "Never";

    let updateMessage = `✅ *PRECIOUS-MD is up-to-date!*`;
    if (localVersion !== latestVersion && latestVersion !== 'Unknown') {
      updateMessage = `🚀 *PRECIOUS-MD is outdated!*
🔹 *Current:* ${localVersion}
🔹 *Latest:* ${latestVersion}

> Use *.update* to pull the latest changes.`;
    }

    const statusMessage = `🌟 *Hello, ${pushname}!* 🌟

📌 *Bot Name:* PRECIOUS-MD)
🔖 *Version:* ${localVersion}
📢 *Latest:* ${latestVersion}
📂 *Plugins:* ${pluginCount}
🔢 *Commands:* ${totalCommands}

💾 *𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨:*
⏳ *Uptime:* ${uptime}
📟 *RAM Usage:* ${ramUsage}MB / ${totalRam}MB
⚙️ *Host:* ${hostName}
📅 *Last Sync:* ${lastUpdate}

📝 *𝐂𝐡𝐚𝐧𝐠𝐞𝐥𝐨𝐠:*
${latestChangelog}

⭐ *GitHub:* https://github.com/watson-dev1/PRECIOUS-MD
👤 *Owner:* Watson-xd

${updateMessage}

🚀 *Fork & Star the repo for more updates!*
> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

    // Using your requested image link
    await conn.sendMessage(from, {
      image: { url: 'https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png' },
      caption: statusMessage,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363424621387196@newsletter',
          newsletterName: '𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃',
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (error) {
    console.error('Error fetching version info:', error);
    reply('❌ Error checking system version.');
  }
});
