import fs from 'fs';
import config from '../config.js';
import { cmd, commands } from '../command.js';
import { runtime } from '../lib/functions.js';
import os from 'os';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "menu",
    desc: "Show all commands in one list",
    category: "main",
    react: "🌌",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {

    try {

        // AUTO CATEGORY SYSTEM
        const menuData = {};

        commands.forEach(command => {

            if (!command.dontAddCommandList && command.pattern) {

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
        const totalRAM = (os.totalmem() / 1024 / 1024).toFixed(0);
        const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0);

        // MAIN HEADER
        let fullMenu = `
╭━━〔 🤖 ${config.OWNER_NAME || "WATSON XD"} MENU 〕━━⬣
┃ 👑 Owner   : ${config.OWNER_NAME || "Watson XD"}
┃ 🕒 Uptime  : ${runtime(process.uptime())}
┃ 📟 RAM     : ${usedRAM}MB / ${totalRAM}MB
┃ ⚙️ Mode    : ${config.MODE || "Public"}
┃ 🔣 Prefix  : ${config.PREFIX || "."}
┃ 📚 Commands: ${commands.length}
╰━━━━━━━━━━━━━━━━━━⬣

`;

        // SORT CATEGORIES
        const categories = Object.keys(menuData).sort();

        categories.forEach(category => {

            fullMenu += `╭──❖「 ${category} 」❖\n`;

            const sortedCmds = menuData[category]
                .sort((a, b) => a.pattern.localeCompare(b.pattern));

            sortedCmds.forEach(command => {

                const isPremium = command.isPremium ? " ⭐" : "";
                const isLimit = command.isLimit ? " 🪙" : "";

                fullMenu += `┃⬡▸ ${config.PREFIX || "."}${command.pattern}${isPremium}${isLimit}\n`;
            });

            fullMenu += `╰────────────────❖\n\n`;
        });

        // FOOTER
        fullMenu += `
╭────────────────❖
┃ ${config.DESCRIPTION || "POWERED BY WATSON XD"}
╰────────────────❖`;

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

        console.error('Menu Error:', e);

        reply("❌ Error generating menu.");
    }
});