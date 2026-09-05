import { cmd } from '../command.js';
import axios from 'axios';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({
    pattern: "countryinfo",
    alias: ["cinfo", "country", "cinfo2"],
    desc: "Get comprehensive details about any country.",
    category: "info",
    react: "🌍",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, react }) => {
    try {
        if (!q) {
            return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐜𝐨𝐮𝐧𝐭𝐫𝐲 𝐧𝐚𝐦𝐞.*\nExample: `.country Zimbabwe` or `.country South Africa`.");
        }

        await reply("⏳ *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐅𝐄𝐓𝐂𝐇𝐈𝐍𝐆 𝐆𝐋𝐎𝐁𝐀𝐋 𝐃𝐀𝐓𝐀...*");

        const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) {
            await react("❌");
            return reply(`❌ *𝐄𝐑𝐑𝐎𝐑:* No information found for *${q}*. Please check the spelling.`);
        }

        const info = data.data;
        
        // Neighbors formatting logic
        let neighborsText = info.neighbors && info.neighbors.length > 0
            ? info.neighbors.map(n => `🌍 *${n.name}*`).join(", ")
            : "None";

        // Stylized Response for WATSON XD
        const caption = `🌍 *𝐂𝐎𝐔𝐍𝐓𝐑𝐘 𝐈𝐍𝐅𝐎: ${info.name.toUpperCase()}* 🌍\n\n` +
                        `🏛️ *𝐂𝐚𝐩𝐢𝐭𝐚𝐥:* ${info.capital}\n` +
                        `📍 *𝐂𝐨𝐧𝐭𝐢𝐧𝐞𝐧𝐭:* ${info.continent.name} ${info.continent.emoji}\n` +
                        `📞 *𝐃𝐢𝐚𝐥 𝐂𝐨𝐝𝐞:* ${info.phoneCode}\n` +
                        `📏 *𝐀𝐫𝐞𝐚:* ${info.area.squareKilometers.toLocaleString()} km²\n` +
                        `🚗 *𝐃𝐫𝐢𝐯𝐢𝐧𝐠:* ${info.drivingSide.charAt(0).toUpperCase() + info.drivingSide.slice(1)} Side\n` +
                        `💱 *𝐂𝐮𝐫𝐫𝐞𝐧𝐜𝐲:* ${info.currency}\n` +
                        `🔤 *𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞𝐬:* ${info.languages.native.join(", ")}\n` +
                        `🌟 *𝐅𝐚𝐦𝐨𝐮𝐬 𝐅𝐨𝐫:* ${info.famousFor}\n` +
                        `🌎 *𝐈𝐧𝐭𝐞𝐫𝐧𝐞𝐭 𝐓𝐋𝐃:* ${info.internetTLD}\n\n` +
                        `🔗 *𝐍𝐞𝐢𝐠𝐡𝐛𝐨𝐫𝐬:* ${neighborsText}\n\n` +
                        `${FOOTER}`;

        // Send Flag + Info
        await conn.sendMessage(from, {
            image: { url: info.flag },
            caption: caption,
            contextInfo: { 
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐆𝐋𝐎𝐁𝐀𝐋 𝐈𝐍𝐒𝐈𝐆𝐇𝐓`,
                    body: `Data for ${info.name}`,
                    mediaType: 1,
                    sourceUrl: "https://github.com/watson-dev1"
                }
            }
        }, { quoted: mek });

        await react("✅");

    } catch (e) {
        console.error("Country Info Error:", e);
        await react("❌");
        reply("⚠️ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐄𝐑𝐑𝐎𝐑:* Failed to retrieve country data.");
    }
});
