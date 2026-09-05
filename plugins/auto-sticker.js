import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { cmd } from '../command.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path configurations
const jsonPath = path.join(__dirname, '../assets/autosticker.json');
const stickersFolder = path.join(__dirname, '../assets/autosticker');

// Cache the JSON data to memory so we don't read the file on every message
let stickerData = {};
if (fs.existsSync(jsonPath)) {
    stickerData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} else {
    console.warn("⚠️ autosticker.json not found in assets folder!");
}

cmd({
  on: "body"
},
async (conn, mek, m, { from, body }) => {
    try {
        // 1. Check if feature is enabled and body exists
        if (config.AUTO_STICKER !== 'true' || !body) return;

        // 2. Normalize input to lowercase
        const messageText = body.toLowerCase().trim();

        // 3. Direct lookup in our cached object (much faster than a loop)
        if (stickerData[messageText]) {
            const fileName = stickerData[messageText];
            const stickerPath = path.join(stickersFolder, fileName);

            if (fs.existsSync(stickerPath)) {
                const stickerBuffer = fs.readFileSync(stickerPath);

                await conn.sendMessage(from, {
                    sticker: stickerBuffer,
                    packname: 'PRECIOUS-MD', // Updated branding
                    author: 'Watson XD'      // Updated branding
                }, { quoted: mek });
            } else {
                console.warn(`Sticker file missing: ${fileName}`);
            }
        }
    } catch (e) {
        console.error("Auto-Sticker Error:", e);
    }
});
