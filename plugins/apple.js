import { cmd } from '../command.js';
import yts from 'yt-search';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";

cmd({ 
    pattern: "apple", 
    alias: ["applemusic", "am"], 
    react: "🍎", 
    desc: "Download tracks from Apple Music.", 
    category: "main", 
    filename: __filename 
}, async (conn, mek, m, { from, q, reply }) => { 
    try {
        if (!q) return reply("✍️ *𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞 𝐨𝐫 𝐀𝐩𝐩𝐥𝐞 𝐌𝐮𝐬𝐢𝐜 𝐥𝐢𝐧𝐤.*");

        // React with loading state
        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        let trackQuery = q.trim();

        // If it's not a direct URL, search using original yt-search to get a clean title string
        if (!trackQuery.startsWith("http")) {
            const searchResult = await yts(q);
            const videos = searchResult.videos;
            if (!videos.length) {
                await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
                return reply("❌ No results found for that song name.");
            }
            // Use the title of the top search video result for the API parameters
            trackQuery = videos[0].title;
        }

        // Hit your eliteprotech Apple Music endpoint
        const apiUrl = `https://eliteprotech-apis.zone.id/applemusic?url=${encodeURIComponent(trackQuery)}`;
        
        const res = await fetch(apiUrl);
        const data = await res.json();

        // Validate eliteprotech payload format
        if (!data?.status || !data?.result?.download) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("⚠️ Download failed. The API might be down or the track is unavailable.");
        }

        const trackTitle = data.result.title || q;

        // Send the converted audio stream
        await conn.sendMessage(from, {
            audio: { url: data.result.download },
            mimetype: "audio/mpeg",
            fileName: `${trackTitle}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: trackTitle,
                    body: "𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐀𝐩𝐩𝐥𝐞 𝐌𝐮𝐬𝐢𝐜 𝐒𝐲𝐬𝐭𝐞𝐦",
                    mediaType: 1,
                    thumbnailUrl: "https://i.imgur.com/v8pA77O.png", // Stand-in Apple Music branding icon
                    sourceUrl: q.startsWith("http") ? q : "https://music.apple.com",
                    showAdAttribution: false,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        // Success reaction
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error("Apple Music Downloader Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("⚠️ *SYSTEM ERROR:* Failed to process Apple Music request.");
    }
});
