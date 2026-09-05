import axios from 'axios';
import { cmd } from '../command.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cmd({
  pattern: "sub",
  react: "🎬",
  desc: "Search and download Sinhala Subtitles from Zoom.lk",
  category: "downloader",
  use: ".sub <movie name>",
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("*⚡Type Your Movie Name For Get Subtitle.*\nExample: *.sub Avengers*");

    const searchUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl);

    if (!data.results || data.results.length === 0) {
      return reply("> ❌ Movie Not Found On Zoom..!");
    }

    let txt = `🎬  *PRECIOUS-MD ＺᴏᴏＭ ＳᴜʙᴛɪᴛʟＥ ＤᴏᴡɴʟᴏᴀᴅᴇＲ* 🎬\n\n`;
    data.results.forEach((res, i) => {
      txt += `*${i+1}.* ${res.title}\n👤 ${res.author}\n💬 𝙲𝙾𝙼𝙼𝙴𝙽𝚃𝚂: ${res.comments}\n🔗 𝙻𝙸𝙽𝙺: ${res.link}\n\n> *© POWERED BY PRECIOUS-MD*\n\n`;
    });
    txt += `\n➡️ Use: *.subdl <movie link>* to download`;

    await reply(txt);

  } catch (e) {
    console.log(e);
    reply("❌ Error occurred while searching movie.");
  }
});

cmd({
  pattern: "subdl",
  react: "⬇️",
  desc: "Download Sinhala Subtitle Movies from Zoom.lk",
  category: "download",
  use: ".subdl <zoom.lk movie link>",
  filename: __filename
}, async (conn, mek, m, { args, reply }) => {
  try {
    const url = args[0];
    if (!url) return reply("*⚡Please Copy And Paste Your Zoom Subtitle Link Show Abow.*\nExample: *.subdl https://zoom.lk/...*");

    const dlUrl = `https://supun-md-api-xmjh.vercel.app/api/zoom-dl?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(dlUrl);

    if (!data.results || !data.results.dl_link) {
      return reply("❌ Download link not found!");
    }

    let cap = `🎬 *${data.results.title}*\n\n`;
    cap += `📅 𝙳𝙰𝚃𝙴: ${data.results.date}\n`;
    cap += `👁️ 𝚅𝙸𝙴𝚆𝚂: ${data.results.view}\n`;
    cap += `💾 𝚂𝙸𝚉𝙴: ${data.results.size}\n\n> *© POWERED BY PRECIOUS-MD*`;

    // File name & extension detect
    let dlLink = data.results.dl_link;
    let ext = path.extname(dlLink).toLowerCase();
    let filename = `${data.results.title || "movie"}${ext}`;
    let filePath = path.join(__dirname, "../tmp", filename);

    // Download file
    const response = await axios.get(dlLink, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, response.data);

    // Decide send type
    if (ext === ".mp4" || ext === ".mkv" || ext === ".avi") {
      // send as video document
      await conn.sendMessage(mek.chat, {
        document: fs.readFileSync(filePath),
        mimetype: "video/mp4",
        fileName: filename,
        caption: cap
      }, { quoted: mek });
    } else {
      // send as normal document
      await conn.sendMessage(mek.chat, {
        document: fs.readFileSync(filePath),
        mimetype: "application/octet-stream",
        fileName: filename,
        caption: cap
      }, { quoted: mek });
    }

    fs.unlinkSync(filePath);

  } catch (e) {
    console.log(e);
    reply("❌ Error occurred while fetching or sending download.");
  }
});
