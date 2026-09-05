import fs from 'fs';
import path from 'path';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cmd({
    pattern: "deepclean",
    alias: ["clearall", "wipe"],
    desc: "Wipe session junk and temp cache files.",
    category: "owner",
    react: "🧼",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    if (!isOwner) return reply("❌ My master only can use this.");

    const sessionPath = path.join(__dirname, '../sessions');
    const tempPath = path.join(__dirname, '../temp'); // or './cache' depending on your folder name
    
    let deletedSession = 0;
    let deletedTemp = 0;

    // 1. Clean Sessions (Protecting Login)
    if (fs.existsSync(sessionPath)) {
        const sFiles = fs.readdirSync(sessionPath);
        sFiles.forEach(file => {
            if (file !== 'creds.json' && !file.includes('app-state')) {
                try {
                    fs.unlinkSync(path.join(sessionPath, file));
                    deletedSession++;
                } catch (e) {}
            }
        });
    }

    // 2. Clean Temp/Cache (All images/videos)
    if (fs.existsSync(tempPath)) {
        const tFiles = fs.readdirSync(tempPath);
        tFiles.forEach(file => {
            try {
                fs.unlinkSync(path.join(tempPath, file));
                deletedTemp++;
            } catch (e) {}
        });
    }

    // 3. Final Report
    const report = `╭━━━〔 *𝐃𝐄𝐄𝐏 𝐂𝐋𝐄𝐀𝐍* 〕━━━┈⊷
┃★╭──────────────
┃★│ 🧹 *Session Junk:* ${deletedSession} files
┃★│ 📁 *Temp Cache:* ${deletedTemp} files
┃★│ 📂 *Protected:* creds.json
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷
> *PRECIOUS-MD* is now fresh and fast!`;

    return reply(report);
});
