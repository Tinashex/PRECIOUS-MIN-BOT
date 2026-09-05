import { cmd } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "wstalk",
    alias: ["channelstalk", "chinfo"],
    desc: "Get WhatsApp channel information",
    category: "utility",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        // Check if URL is provided
        if (!args) return reply("❌ Please provide a WhatsApp channel URL\nExample: .wstalk https://whatsapp.com/channel/0029Vb5...");

        // Extract channel ID from URL
        const channelId = args.match(/channel\/([0-9A-Za-z]+)/i)?.[1];
        if (!channelId) return reply("❌ Invalid WhatsApp channel URL");

        // API endpoint
        const apiUrl = `https://itzpire.com/stalk/whatsapp-channel?url=https://whatsapp.com/channel/${channelId}`;

        // Fetch channel info
        const response = await axios.get(apiUrl);
        const data = response.data.data;

        // Format the information
        const channelInfo = `╭━━〔 *𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *📢 𝚃𝙸𝚃𝙻𝙴*: ${data.title}
┃◈┃• *👥 𝙵𝙾𝙻𝙻𝙾𝚆𝙴𝚁𝚂*: ${data.followers}
┃◈┃• *📝 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽*: ${data.description.replace(/\n/g, '\n┃◈┃• ')}
┃◈└───────────┈⊷
╰──────────────┈⊷
> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃*`;

        // Send message with channel image
        await conn.sendMessage(from, {
            image: { url: data.img },
            caption: channelInfo,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in wstalk command:", e);
        reply(`❌ Error: ${e.response?.data?.message || e.message}`);
    }
});
