import axios from 'axios';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
  pattern: "apk",
  alias: ["app", "downloadapk"],
  desc: "Download Android applications (APK files)",
  category: "downloader",
  filename: __filename,
  use: "<app name>",
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    // 1. Validation Check
    if (!q) {
      return reply("✍️ * can you please provide an application name.* \n\nExample: .apk WhatsApp Messenger");
    }

    // 2. Loading State / Reaction
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

    // 3. Fetch from your APK API endpoint
    const apiUrl = `https://eliteprotech-apis.zone.id/apk?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    // 4. Validate the eliteprotech response structure
    if (!data?.status || !data?.result || !data?.result?.download) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        return reply("❌ Failed to find or fetch the requested APK file. Try a different app name.");
    }

    const appInfo = data.result;
    const appName = appInfo.title || q;
    const appSize = appInfo.size || "Unknown Size";

    // 5. Construct structural caption overview
    let apkMsg = `📦 *𝐀𝐏𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑*\n\n` +
                 `📱 *App Name:* ${appName}\n` +
                 `⚖️ *Size:* ${appSize}\n\n` +
                 `*⚡ Sending file to chat... Please wait.*`;

    await reply(apkMsg);

    // 6. Send the APK as an installation document file string
    await conn.sendMessage(from, {
        document: { url: appInfo.download },
        mimetype: "application/vnd.android.package-archive",
        fileName: `${appName}.apk`,
        caption: `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃`
    }, { quoted: mek });

    // 7. Success Reaction
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("APK Downloader Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    reply("❌ An error occurred while retrieving the application file.");
  }
});
