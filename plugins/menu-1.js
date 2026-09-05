import fs from 'fs';
import path from 'path';
import os from 'os';

import config from '../config.js';
import { cmd, commands } from '../command.js';
import { runtime } from '../lib/functions.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cmd({
    pattern: "menu1",
    alias: ["help1", "list1"],
    desc: "Luxury auto plugin menu",
    category: "main",
    react: "🌹",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // DO NOT RELOAD PLUGINS HERE - already loaded in index.js
        // reloading every menu call = lag

        // CATEGORY ICONS
        const categoryIcons = {
            DOWNLOAD: "📥",
            GROUP: "👥",
            SEARCH: "🔎",
            FUN: "🎮",
            AI: "🤖",
            OWNER: "👑",
            MAIN: "⚙️",
            TOOLS: "🛠️",
            CONVERT: "♻️",
            NSFW: "🔞",
            OTHER: "✨"
        };

        // ORGANIZE COMMANDS
        const menuData = {};
        commands.forEach(command => {
            if (!command.dontAddCommandList && command.pattern) {
                const category = command.category? command.category.toUpperCase() : "OTHER";
                if (!menuData[category]) menuData[category] = [];
                menuData[category].push(command);
            }
        });

        // SYSTEM INFO
        const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(0);
        const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0);
        const speed = `${Date.now() - (mek.messageTimestamp * 1000)} ms`;

        // READ MORE
        const readMore = String.fromCharCode(8206).repeat(4001);

        // HEADER
        let fullMenu = `
╔═══━━━─── • ───━━━═══╗
        🤖 ${config.BOT_NAME || "PRECIOUS-MD"}
╚═══━━━─── • ───━━━═══╝

╭════〘 SYSTEM INFO 〙════╮
┃ 👑 Owner : ${config.OWNER_NAME || "Watson XD"}
┃ 👤 User : ${m.pushName || "User"}
┃ ⚡ Speed : ${speed}
┃ 🕒 Runtime : ${runtime(process.uptime())}
┃ 📟 RAM : ${usedRAM}MB / ${totalRAM}MB
┃ ⚙️ Mode : ${config.MODE || "Public"}
┃ 🔣 Prefix : ${config.PREFIX || "."}
┃ 📚 Commands: ${commands.length}
╰══════════════╯

${readMore}
`;

        // SORT CATEGORIES
        const categories = Object.keys(menuData).sort();
        categories.forEach(category => {
            const icon = categoryIcons[category] || "✨";
            fullMenu += `╭════〘 ${icon} ${category} 〙════╮\n`;
            const sortedCmds = menuData[category].sort((a, b) => a.pattern.localeCompare(b.pattern));
            sortedCmds.forEach(command => {
                const isPremium = command.isPremium? " ⭐" : "";
                const isLimit = command.isLimit? " 🪙" : "";
                fullMenu += `┃⬡▸ ${config.PREFIX || "."}${command.pattern}${isPremium}${isLimit}\n`;
            });
            fullMenu += `╰══════════════════════╯\n\n`;
        });

        // FOOTER
        fullMenu += `
╔═══━━━─── • ───━━━═══╗
┃ 🌹 POWERED BY ${config.BOT_NAME || "PRECIOUS-MD"}
┃ 🚀 PREMIUM WHATSAPP BOT
╚═══━━━─── • ───━━━═══╝
`;

        // BUTTONS - works with your new index button handler
        const buttons = [
            { buttonId: `${config.PREFIX}ping1`, buttonText: { displayText: "⚡ Speed Test" }, type: 1 },
            { buttonId: `${config.PREFIX}alive`, buttonText: { displayText: "🟢 Bot Status" }, type: 1 },
            { buttonId: `${config.PREFIX}owner`, buttonText: { displayText: "👑 Owner" }, type: 1 }
        ];

        // CONTEXT INFO
        const contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363424621387196@newsletter',
                newsletterName: config.OWNER_NAME || "Watson XD",
                serverMessageId: 143
            }
        };

        // MENU IMAGE
        const menuImage = config.MENU_IMAGE_URL || 'https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png';

        // SEND MENU WITH BUTTONS
        try {
            await conn.sendMessage(from, {
                image: { url: menuImage },
                caption: fullMenu,
                footer: `Click a button below ⬇️`,
                buttons: buttons,
                headerType: 1,
                contextInfo
            }, { quoted: mek });

            await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
        } catch (imgError) {
            console.error("Image failed, sending text menu:", imgError);
            await conn.sendMessage(from, {
                text: fullMenu,
                footer: `Click a button below ⬇️`,
                buttons: buttons,
                headerType: 1,
                contextInfo
            }, { quoted: mek });
        }

    } catch (e) {
        console.error('Luxury Menu Error:', e);
        reply("❌ Error generating menu.\n" + e.message);
    }
});










/*const fs = require('fs');
const path = require('path');
const os = require('os');

const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
    pattern: "menu1",
    desc: "Luxury auto plugin menu",
    category: "main",
    react: "🌹",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {

        // AUTO LOAD PLUGINS
        const pluginsPath = path.join(__dirname, '../plugins');

        fs.readdirSync(pluginsPath)
            .filter(file => file.endsWith('.js'))
            .forEach(file => {

                const pluginPath = path.join(pluginsPath, file);

                delete require.cache[
                    require.resolve(pluginPath)
                ];

                require(pluginPath);
            });

        // CATEGORY ICONS
        const categoryIcons = {
            DOWNLOAD: "📥",
            GROUP: "👥",
            SEARCH: "🔎",
            FUN: "🎮",
            AI: "🤖",
            OWNER: "👑",
            MAIN: "⚙️",
            TOOLS: "🛠️",
            CONVERT: "♻️",
            NSFW: "🔞",
            OTHER: "✨"
        };

        // ORGANIZE COMMANDS
        const menuData = {};

        commands.forEach(command => {

            if (
                !command.dontAddCommandList &&
                command.pattern
            ) {

                const category = command.category
                    ? command.category.toUpperCase()
                    : "OTHER";

                if (!menuData[category]) {
                    menuData[category] = [];
                }

                menuData[category].push(command);
            }
        });

        // SYSTEM INFO
        const totalRAM = (
            os.totalmem() / 1024 / 1024
        ).toFixed(0);

        const usedRAM = (
            process.memoryUsage().heapUsed /
            1024 / 1024
        ).toFixed(0);

        // SPEED
        const speed =
            `${Date.now() - (mek.messageTimestamp * 1000)} ms`;

        // READ MORE
        const readMore =
            String.fromCharCode(8206).repeat(4001);

        // HEADER
        let fullMenu = `
╔═══━━━─── • ───━━━═══╗
        🤖 ${config.OWNER_NAME || "WATSON XD"}
╚═══━━━─── • ───━━━═══╝

╭════〘 SYSTEM INFO 〙════╮
┃ 👑 Owner   : ${config.OWNER_NAME || "Watson XD"}
┃ 👤 User    : ${m.pushName || "User"}
┃ ⚡ Speed   : ${speed}
┃ 🕒 Runtime : ${runtime(process.uptime())}
┃ 📟 RAM     : ${usedRAM}MB / ${totalRAM}MB
┃ ⚙️ Mode    : ${config.MODE || "Public"}
┃ 🔣 Prefix  : ${config.PREFIX || "."}
┃ 📚 Commands: ${commands.length}
╰══════════════════════╯

${readMore}
`;

        // SORT CATEGORIES
        const categories =
            Object.keys(menuData).sort();

        categories.forEach(category => {

            const icon =
                categoryIcons[category] || "✨";

            fullMenu +=
                `╭════〘 ${icon} ${category} 〙════╮\n`;

            const sortedCmds =
                menuData[category].sort((a, b) =>
                    a.pattern.localeCompare(b.pattern)
                );

            sortedCmds.forEach(command => {

                const isPremium =
                    command.isPremium ? " ⭐" : "";

                const isLimit =
                    command.isLimit ? " 🪙" : "";

                fullMenu +=
                    `┃⬡▸ ${config.PREFIX || "."}${command.pattern}${isPremium}${isLimit}\n`;
            });

            fullMenu +=
                `╰══════════════════════╯\n\n`;
        });

        // FOOTER
        fullMenu += `
╔═══━━━─── • ───━━━═══╗
┃   🌹 POWERED BY WATSON XD
┃   🚀 PREMIUM WHATSAPP BOT
╚═══━━━─── • ───━━━═══╝
`;

        // CONTEXT INFO
        const contextInfo = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid:
                    '120363424621387196@newsletter',

                newsletterName:
                    config.OWNER_NAME || "Watson XD",

                serverMessageId: 143
            }
        };

        // MENU IMAGE
        const menuImage =
            config.MENU_IMAGE_URL ||
            'https://i.imgur.com/v8pA77O.png';

        // SEND MENU
        try {

            await conn.sendMessage(from, {
                image: { url: menuImage },
                caption: fullMenu,
                contextInfo
            }, { quoted: mek });

        } catch (imgError) {

            console.error(
                "Image failed, sending text menu:",
                imgError
            );

            await conn.sendMessage(from, {
                text: fullMenu,
                contextInfo
            }, { quoted: mek });
        }

    } catch (e) {

        console.error(
            'Luxury Menu Error:',
            e
        );

        reply("❌ Error generating menu.");
    }
});


/*const { cmd, commands } = require('../command');
const config = require('../config');

cmd({
    pattern: "menu1",
    alias: ["help1", "list1"],
    desc: "Display the main command menu.",
    category: "main",
    react: "📜",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // 1. Loading Reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // 2. Organize commands by category
        const categorized = {};
        commands.forEach(cmd => {
            const cat = cmd.category || 'misc';
            if (!categorized[cat]) categorized[cat] = [];
            categorized[cat].push(cmd.pattern);
        });

        // 3. Construct the stylized menu
        let menuMsg = `🤖 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃 𝐌𝐀𝐈𝐍 𝐌𝐄𝐍𝐔* 🤖\n\n` +
            `Greetings *@${m.sender.split('@')[0]}*, here is your interactive command list!\n\n`;

        Object.keys(categorized).sort().forEach(cat => {
            menuMsg += `📂 *[ ${cat.toUpperCase()} ]*\n`;
            categorized[cat].forEach(cmdPattern => {
                menuMsg += `├ ${config.PREFIX || '.'}${cmdPattern}\n`;
            });
            menuMsg += `└──────────⭔\n\n`;
        });

        menuMsg += `> © 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐖𝐀𝐓𝐒𝐎𝐍 𝐗𝐃`;

        // 4. Send with the permanent image (No Newsletter Metadata)
        await conn.sendMessage(from, { 
            image: { url: `https://cdn.phototourl.com/free/2026-04-27-7d887981-eedf-41fe-86de-eb707ccefdc3.png` },
            caption: menuMsg,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true
                // Newsletter metadata strictly removed
            }
        }, { quoted: mek });

        // 5. Success Reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    } catch (e) {
        console.error("Menu Error:", e);
        reply("⚠️ An error occurred while generating the menu.");
    }
});*/
