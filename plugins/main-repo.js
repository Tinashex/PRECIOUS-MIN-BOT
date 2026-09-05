import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch information about the PRECIOUS-MD source code.",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {
    const githubRepoURL = 'https://github.com/watson-dev1/PRECIOUS-MD';

    try {
        const [, username, repoName] = githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);
        const response = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        
        if (!response.ok) throw new Error("GitHub API Offline");

        const repoData = await response.json();

        // 1. STYLIZED REPO INFO
        const formattedInfo = `⚡ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐑𝐄𝐏𝐎𝐒𝐈𝐓𝐎𝐑𝐘*\n\n` +
            `📂 *Name:* ${repoData.name}\n` +
            `👤 *Owner:* ${repoData.owner.login}\n` +
            `⭐ *Stars:* ${repoData.stargazers_count}\n` +
            `🍴 *Forks:* ${repoData.forks_count}\n\n` +
            `🔗 *Link:* ${repoData.html_url}\n\n` +
            `📝 *Description:* ${repoData.description || 'WhatsApp User Bot Optimized for Harare Servers.'}\n\n` +
            `*Don't Forget To Star and Fork Repository*\n\n` +
            `${FOOTER}`;

        // 2. IMAGE DELIVERY WITH NEWSLETTER CONTEXT
        await conn.sendMessage(from, {
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: formattedInfo,
            contextInfo: { 
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403792569649@newsletter',
                    newsletterName: '𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐔𝐏𝐃𝐀𝐓𝐄𝐒',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        // 3. AUDIO SYSTEM (With Harare Server Safety Check)
        const audioPath = path.join(__dirname, '../assets/menu.m4a');
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: fs.readFileSync(audioPath),
                mimetype: 'audio/mp4',
                ptt: true,
                contextInfo: { 
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403792569649@newsletter',
                        newsletterName: '𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐔𝐏𝐃𝐀𝐓𝐄𝐒',
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        }

    } catch (error) {
        console.error("Repo Command Error:", error);
        reply("⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* Failed to fetch repository data. Check your connection");
    }
});
