import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure lib folder exists
const libPath = path.join(__dirname, 'lib');
if (!fs.existsSync(libPath)) fs.mkdirSync(libPath, { recursive: true });

// Warnings file
const warnFile = path.join(libPath, 'warnings.json');
if (!fs.existsSync(warnFile)) {
    fs.writeFileSync(warnFile, JSON.stringify({}, null, 2));
    console.log("✅ Created warnings.json");
}

// Ban file
const banFile = path.join(libPath, 'ban.json');
if (!fs.existsSync(banFile)) {
    fs.writeFileSync(banFile, JSON.stringify([], null, 2));
    console.log("✅ Created ban.json");
}

// ===== ANTI-DELETE MESSAGE STORE =====
const storePath = path.join(libPath, 'store.json');
if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({}, null, 2));
}

let messageStore = {};
try {
    messageStore = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
} catch {
    messageStore = {};
}

export const saveMessage = async (mek) => {
    try {
        if (!mek?.key?.id) return;
        messageStore[mek.key.id] = mek;
        // keep only last 500 messages to avoid big file
        const keys = Object.keys(messageStore);
        if (keys.length > 500) {
            delete messageStore[keys[0]];
        }
        fs.writeFileSync(storePath, JSON.stringify(messageStore, null, 2));
    } catch (e) {
        console.log("saveMessage error:", e);
    }
};

export const loadMessage = async (id) => {
    try {
        if (messageStore[id]) return messageStore[id];
        if (fs.existsSync(storePath)) {
            const data = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
            return data[id] || null;
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const getAnti = async () => {
    try {
        const { default: config } = await import('./config.js');
        return config.ANTI_DELETE === "true";
    } catch {
        return true;
    }
};

export default { saveMessage, loadMessage, getAnti };