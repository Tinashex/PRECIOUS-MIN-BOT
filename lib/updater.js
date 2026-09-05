import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const updatePath = path.join(__dirname, '../update.json')

export async function checkForUpdate(conn, sendToOwner = false) {
    try {
        const local = JSON.parse(fs.readFileSync(updatePath, 'utf-8'))
        if(!local.repo) return

        // Get latest release from github
        const repoName = local.repo.split('github.com/')[1]
        const { data } = await axios.get(`https://api.github.com/repos/${repoName}/releases/latest`)

        const latestVersion = data.tag_name.replace('v', '')
        const localVersion = local.version

        if(latestVersion!== localVersion) {
            let msg = `🚀 *NEW UPDATE AVAILABLE*\n\n`
            msg += `*Current:* v${localVersion}\n`
            msg += `*Latest:* v${latestVersion}\n\n`
            msg += `*📢 What's New:*\n${data.body}\n\n`
            msg += `*Update now:*.updatebot\n`
            msg += `*Repo:* ${local.repo}`

            if(sendToOwner) {
                await conn.sendMessage(conn.user.id, { text: msg })
            }
            return { update: true, version: latestVersion, url: data.html_url, body: data.body }
        } else {
            if(sendToOwner) {
                await conn.sendMessage(conn.user.id, { text: `✅ *PRECIOUS-MD v${localVersion}* is up to date` })
            }
            return { update: false }
        }
    } catch(e) {
        console.log('❌ Update check failed:', e.message)
    }
}

// Auto check every 24 hours
export function startAutoUpdateChecker(conn) {
    setInterval(async () => {
        console.log('🔄 Checking for updates...')
        await checkForUpdate(conn, true) // true = send to owner
    }, 24 * 60 * 60 * 1000) // 24h
}