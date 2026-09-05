import { cmd } from '../command.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { setCommitHash, getCommitHash } from '../data/updateDB.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FOOTER = "> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃";
const REPO_URL = "https://github.com/watson-dev1/PRECIOUS-MD";

cmd({
    pattern: "update",
    alias: ["upgrade", "sync"],
    react: '🆕',
    desc: "Sync PRECIOUS-MD with the latest GitHub source.",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner }) => {
    // 1. UNTOUCHABLE SECURITY LAYER
    if (!isOwner) return reply("🚫 *ACCESS DENIED:* Developer Only.");

    try {
        await reply("🔍 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃: 𝐂𝐇𝐄𝐂𝐊𝐈𝐍𝐆 𝐅𝐎𝐑 𝐒𝐘𝐒𝐓𝐄𝐌 𝐔𝐏𝐃𝐀𝐓𝐄𝐒...*");

        // Fetch latest commit from GitHub
        const { data: commitData } = await axios.get(`https://api.github.com/repos/watson-dev1/PRECIOUS-MD/commits/main`);
        const latestHash = commitData.sha;
        const currentHash = await getCommitHash();

        if (latestHash === currentHash) {
            return reply(`✅ *𝐒𝐘𝐒𝐓𝐄𝐌 𝐔𝐏-𝐓𝐎-𝐃𝐀𝐓𝐄*\n\nYour current version is fully optimized.\n\n${FOOTER}`);
        }

        await reply("🚀 *𝐔𝐏𝐃𝐀𝐓𝐄 𝐅𝐎𝐔𝐍𝐃: 𝐈𝐍𝐈𝐓𝐈𝐀𝐓𝐈𝐍𝐆 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃...*");

        // 2. SECURE DOWNLOAD
        const zipPath = path.join(__dirname, "temp_update.zip");
        const { data: zipBuffer } = await axios.get(`${REPO_URL}/archive/main.zip`, { responseType: "arraybuffer" });
        fs.writeFileSync(zipPath, zipBuffer);

        // 3. SAFE EXTRACTION
        const extractPath = path.join(__dirname, 'temp_extract');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        await reply("📦 *𝐄𝐗𝐓𝐑𝐀𝐂𝐓𝐈𝐍𝐆 & 𝐏𝐑𝐄𝐒𝐄𝐑𝐕𝐈𝐍𝐆 𝐂𝐎𝐍𝐅𝐈𝐆𝐒...*");

        // 4. SMART FILE REPLACEMENT
        const sourceFolder = path.join(extractPath, "PRECIOUS-MD-main");
        const destFolder = path.join(__dirname, '..');
        
        // Recursive copy with safety exclusions
        const copyFiles = (src, dest) => {
            if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
            
            fs.readdirSync(src).forEach(item => {
                const sPath = path.join(src, item);
                const dPath = path.join(dest, item);

                // PROTECTION: Never overwrite personal credentials or configs
                if (["config.js", "app.json", "session", ".env", "data"].includes(item)) return;

                if (fs.lstatSync(sPath).isDirectory()) {
                    copyFiles(sPath, dPath);
                } else {
                    fs.copyFileSync(sPath, dPath);
                }
            });
        };

        copyFiles(sourceFolder, destFolder);

        // 5. DATABASE SYNC & CLEANUP
        await setCommitHash(latestHash);
        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        await reply(`✅ *𝐔𝐏𝐃𝐀𝐓𝐄 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋*\n\nPRECIOUS-MD has been synchronized. Restarting core... \n\n${FOOTER}`);
        
        // Final restart to apply changes
        setTimeout(() => { process.exit(0); }, 2000);

    } catch (error) {
        console.error("Update System Error:", error);
        reply("⚠️ *𝐔𝐏𝐃𝐀𝐓𝐄 𝐅𝐀𝐈𝐋𝐄𝐃:* Please check your internet connection or GitHub repository permissions.");
    }
});
