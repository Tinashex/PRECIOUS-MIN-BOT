import config from '../config.js';
import { cmd } from '../command.js';
import axios from 'axios';

cmd({
  on: "body"
}, async (conn, mek, m, { isGroup, body }) => {
  try {
    // 1. SILENT EXECUTION CHECK
    if (config.MENTION_REPLY !== 'true' || !isGroup) return;
    
    const botNumber = conn.user.id.split(":")[0] + '@s.whatsapp.net';
    if (!m.mentionedJid || !m.mentionedJid.includes(botNumber)) return;

    // 2. REACTION POOL (Randomized for variety)
    const voiceClips = [
      "https://cdn.ironman.my.id/i/7p5plg.mp4",
      "https://cdn.ironman.my.id/i/l4dyvg.mp4",
      "https://cdn.ironman.my.id/i/4z93dg.mp4",
      "https://cdn.ironman.my.id/i/m9gwk0.mp4",
      "https://cdn.ironman.my.id/i/gr1jjc.mp4",
      "https://cdn.ironman.my.id/i/lbr8of.mp4",
      "https://cdn.ironman.my.id/i/0z95mz.mp4",
      "https://cdn.ironman.my.id/i/rldpwy.mp4",
      "https://cdn.ironman.my.id/i/lz2z87.mp4",
      "https://cdn.ironman.my.id/i/gg5jct.mp4"
    ];

    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

    // 3. THUMBNAIL OPTIMIZATION (Harare Bandwidth Protection)
    const thumbUrl = config.MENU_IMAGE_URL || "https://files.catbox.moe/c836ws.png";
    const thumbRes = await axios.get(thumbUrl, { responseType: 'arraybuffer' }).catch(() => null);
    const thumbBuffer = thumbRes ? Buffer.from(thumbRes.data, 'binary') : null;

    // 4. STYLIZED PTT DELIVERY
    await conn.sendMessage(m.chat, {
      audio: { url: randomClip },
      mimetype: 'audio/mp4',
      ptt: true,
      waveform: [0, 40, 80, 40, 0, 40, 80, 40, 0], // Visual wave effect
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃 𝐈𝐒 𝐎𝐍𝐋𝐈𝐍𝐄 ⚡",
          body: "© 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃",
          mediaType: 1,
          renderLargerThumbnail: true,
          thumbnail: thumbBuffer,
          sourceUrl: `https://wa.me/263781330745`,
          mediaUrl: thumbUrl,
          showAdAttribution: true
        }
      }
    }, { quoted: mek });

  } catch (e) {
    console.error("Mention Handler Error:", e);
  }
});
