import fs from 'fs';
import dotenv from 'dotenv';
if (fs.existsSync('config.env')) dotenv.config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault? true : false;
}

const config = {
    // ========================= SESSION & AUTH =========================
    SESSION_ID: process.env.SESSION_ID || "",

    // ========================= STATUS SETTINGS =========================
    AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN || "true",
    AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
    AUTO_STATUS_REACT: process.env.AUTO_STATUS_REACT || "true",
    AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*SEEN YOUR STATUS BY PRECIOUS-MD*",

    // ========================= SECURITY & ANTI =========================
    ANTI_DELETE: process.env.ANTI_DELETE || "true",
    ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "inbox",
    ANTI_LINK: process.env.ANTI_LINK || "true",
    ANTI_LINK_KICK: process.env.ANTI_LINK_KICK || "true",
    DELETE_LINKS: process.env.DELETE_LINKS || "false",

    // Anti-Bad-Words Settings
    ANTI_BAD: process.env.ANTI_BAD || "true",
    MAX_WARNINGS: parseInt(process.env.MAX_WARNINGS || "3"),
    BAD_WORDS: (process.env.BAD_WORDS || "fuck,porn,bitch,asshole").split(","),

    // Anti-Link Settings
    LINK_MAX_WARNINGS: parseInt(process.env.LINK_MAX_WARNINGS || "3"),

    // Anti-Tag-All Settings
    ANTI_TAGALL: process.env.ANTI_TAGALL || "true",
    TAGALL_LIMIT: parseInt(process.env.TAGALL_LIMIT || "15"),

    // NEW: ANTI-FAKE SETTINGS
    ANTI_FAKE: process.env.ANTI_FAKE || "false",
    FAKE_COUNTRY_CODES: (process.env.FAKE_COUNTRY_CODES || "234,92,1,91").split(","),

    ANTI_VV: process.env.ANTI_VV || "true",
    ANTI_CALL: process.env.ANTI_CALL || "true",

    // ========================= GROUP SETTINGS =========================
    WELCOME: process.env.WELCOME || "false",
    ADMIN_EVENTS: process.env.ADMIN_EVENTS || "true",
    GROUP_EVENTS: process.env.GROUP_EVENTS || "true",

    // ========================= BOT CUSTOMIZATION =========================
    PREFIX: process.env.PREFIX || ".",
    BOT_NAME: process.env.BOT_NAME || "PRECIOUS-MD",
    STICKER_NAME: process.env.STICKER_NAME || "PRECIOUS-MD",
    OWNER_NAME: process.env.OWNER_NAME || "Watson Xd",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "263789622747",
    DEV: process.env.DEV || "263789622747",
    DESCRIPTION: process.env.DESCRIPTION || "*© 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐅𝐎𝐔𝐑𝐏𝐄𝐍𝐂𝐄*",

    // ========================= OWNER PERSONAL INFO =========================
    EMAIL: process.env.EMAIL || "fourpencewatson7@gmail.com",
    GITHUB: process.env.GITHUB || "watson-dev1",
    LOCATION: process.env.LOCATION || "Harare, Zimbabwe",

    // ========================= MEDIA & URLS =========================
    MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png",
    ALIVE_IMG: process.env.ALIVE_IMG || "https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png",
    LIVE_MSG: process.env.LIVE_MSG || "> PRECIOUS-MD IS ALIVE! ⚡",

    // ========================= AUTOMATION SETTINGS =========================
    READ_MESSAGE: process.env.READ_MESSAGE || "false",
    AUTO_REACT: process.env.AUTO_REACT || "false",
    CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
    CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
    AUTO_STICKER: process.env.AUTO_STICKER || "false",
    AUTO_REPLY: process.env.AUTO_REPLY || "false",
    AUTO_TYPING: process.env.AUTO_TYPING || "true",
    AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
    ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",

    // ========================= SYSTEM MODE =========================
    MODE: process.env.MODE || "public",
    READ_CMD: process.env.READ_CMD || "false",
    MENTION_REPLY: process.env.MENTION_REPLY || "false"
};

export default config;