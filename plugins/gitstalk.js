import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "githubstalk",
    alias: ["ghstalk", "github"],
    desc: "Fetch detailed GitHub user profile information.",
    category: "tools",
    react: "🖥️",
    filename: __filename
},
async (conn, mek, m, { from, args, reply }) => {
    try {
        const username = args[0];
        if (!username) {
            return reply("✍️ *Please provide a GitHub username!*\nExample: .githubstalk watson-dev1");
        }

        // 1. Loading Reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // 2. Fetch Data from GitHub API
        const apiUrl = `https://api.github.com/users/${username}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        // 3. Construct Profile Info
        let userInfo = `👤 *𝐔𝐒𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄: ${data.name || data.login}*\n\n` +
            `🔗 *GitHub URL:* ${data.html_url}\n` +
            `📝 *Bio:* ${data.bio || 'Not available'}\n` +
            `🏙️ *Location:* ${data.location || 'Unknown'}\n` +
            `📊 *Public Repos:* ${data.public_repos}\n` +
            `🔭 *Public Gists:* ${data.public_gists}\n` +
            `👥 *Followers:* ${data.followers}\n` +
            `🤝 *Following:* ${data.following}\n` +
            `📅 *Joined:* ${new Date(data.created_at).toDateString()}\n\n` +
            `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`;

        // 4. Send Image with Caption (Zero Newsletter Metadata)
        await conn.sendMessage(from, {
            image: { url: data.avatar_url },
            caption: userInfo,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

        // 5. Success Reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("GitHub Stalk Error:", e);
        const errorMsg = e.response && e.response.status === 404 
            ? "❌ *User not found!* Please check the username." 
            : "⚠️ *API Error:* Could not fetch GitHub data.";
        reply(errorMsg);
    }
});
