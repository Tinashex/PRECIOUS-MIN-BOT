import converter from '../data/converter.js';
import stickerConverter from '../data/sticker-converter.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

// ---------------------------------------------------------------------------
//  STICKER TO IMAGE CONVERTER
// ---------------------------------------------------------------------------
cmd({
    pattern: 'convert',
    alias: ['sticker2img', 'stoimg', 's2i'],
    desc: 'Convert stickers to high-quality images.',
    category: 'media',
    react: '🖼️',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const quoted = m.quoted ? m.quoted : m;
        if (quoted.mtype !== 'stickerMessage') return reply("✨ *WATSON XD* \n\nReply to a sticker to convert it to an image.");

        await reply("🔄 *Converting sticker...*");

        const stickerBuffer = await quoted.download();
        const imageBuffer = await stickerConverter.convertStickerToImage(stickerBuffer);

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: FOOTER,
            mimetype: 'image/png'
        }, { quoted: m });

    } catch (error) {
        console.error('Conversion error:', error);
        reply("❌ *ERROR:* Failed to convert sticker. Please try again.");
    }
});

// ---------------------------------------------------------------------------
//  VIDEO/AUDIO TO MP3 CONVERTER
// ---------------------------------------------------------------------------
cmd({
    pattern: 'tomp3',
    alias: ['mp3'],
    desc: 'Extract high-quality audio from media.',
    category: 'audio',
    react: '🎵',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const quoted = m.quoted ? m.quoted : m;
        if (!['videoMessage', 'audioMessage'].includes(quoted.mtype)) {
            return reply("❌ Reply to a video or audio file to convert it to MP3.");
        }

        if (quoted.seconds > 300) return reply("⏱️ *LIMIT:* Media exceeds 5 minutes.");

        await reply("🔄 *Processing audio...*");

        const buffer = await quoted.download();
        const ext = quoted.mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const audio = await converter.toAudio(buffer, ext);

        await conn.sendMessage(from, {
            audio: audio,
            mimetype: 'audio/mpeg',
            fileName: `WATSON-XD-AUDIO.mp3`
        }, { quoted: m });

    } catch (e) {
        console.error('MP3 Conversion error:', e);
        reply("❌ *ERROR:* Audio extraction failed.");
    }
});

// ---------------------------------------------------------------------------
//  MEDIA TO VOICE MESSAGE (PTT)
// ---------------------------------------------------------------------------
cmd({
    pattern: 'toptt',
    alias: ['voice'],
    desc: 'Convert media to a voice note.',
    category: 'audio',
    react: '🎙️',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const quoted = m.quoted ? m.quoted : m;
        if (!['videoMessage', 'audioMessage'].includes(quoted.mtype)) {
            return reply("❌ Reply to a video/audio to create a voice note.");
        }

        if (quoted.seconds > 120) return reply("⏱️ *LIMIT:* Voice notes max 2 minutes.");

        await reply("🔄 *Generating voice note...*");

        const buffer = await quoted.download();
        const ext = quoted.mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const ptt = await converter.toPTT(buffer, ext);

        await conn.sendMessage(from, {
            audio: ptt,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m });

    } catch (e) {
        console.error('PTT error:', e);
        reply("❌ *ERROR:* Voice note generation failed.");
    }
});
