import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { cmd, commands } from '../command.js';

// Auto Recording Presence System
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isOwner }) => {
    try {
        // 1. Check if the feature is enabled in config.js
        if (config.AUTO_RECORDING === 'true') {
            
            // 2. Prevent the bot from triggering recording for its own messages
            if (mek.key.fromMe) return;

            // 3. Send 'recording' status to the chat
            // This will show "recording audio..." at the top of the WhatsApp chat
            await conn.sendPresenceUpdate('recording', from);
        }
    } catch (e) {
        console.error("Auto-Recording Error:", e);
    }
});
