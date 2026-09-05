import { cmd } from '../command.js'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updatePath = path.join(__dirname, '../update.json')
const packagePath = path.join(__dirname, '../package.json')

// SECURITY POLICY - Match your SECURITY.md
const SUPPORTED_VERSIONS = [
    { pattern: /^5\.1\./, supported: true },
    { pattern: /^5\.0\./, supported: false },
    { pattern: /^4\.0\./, supported: true },
]

function isVersionSupported(version) {
    for(const v of SUPPORTED_VERSIONS) {
        if(v.pattern.test(version)) return v.supported
    }
    return false // default: not supported
}

async function getLocalVersion() {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
    return pkg.version
}

async function checkForUpdate(conn, sendToOwner = false) {
    try {
        if(!fs.existsSync(updatePath)) return { update: false, error: 'update.json not found' }

        const local = JSON.parse(fs.readFileSync(updatePath, 'utf-8'))
        const localVersion = await getLocalVersion()
        if(!local.repo) return { update: false, error: 'No repo in update.json' }

        const repoName = local.repo.split('github.com/')[1]
        const { data } = await axios.get(`https://api.github.com/repos/${repoName}/releases/latest`)

        const latestVersion = data.tag_name.replace('v', '')
        const isSupported = isVersionSupported(localVersion)

        let securityWarning = ''
        if(!isSupported) {
            securityWarning = `\n\n⚠️ *SECURITY WARNING*\nYou are on v${localVersion} which is NO LONGER SUPPORTED.\nPlease update to v5.1.x immediately to receive security patches.`
        }

        if(latestVersion!== localVersion) {
            let msg = `🚀 *NEW UPDATE AVAILABLE*\n\n`
            msg += `*Bot:* ${local.name}\n`
            msg += `*Current:* v${localVersion}\n`
            msg += `*Latest:* v${latestVersion}\n\n`
            msg += `*📢 What's New:*\n${data.body}`
            msg += securityWarning
            msg += `\n\n*Update now:*.updatebot\n`
            msg += `*Repo:* ${local.repo}`

            if(sendToOwner) {
                await conn.sendMessage(conn.user.id, { text: msg })
            }
            return { update: true, version: latestVersion, url: data.html_url, body: data.body, warning: securityWarning }
        } else {
            let msg = `✅ *${local.name} v${localVersion}* is up to date`
            msg += securityWarning
            if(sendToOwner) {
                await conn.sendMessage(conn.user.id, { text: msg })
            }
            return { update: false, version: localVersion, warning: securityWarning }
        }
    } catch(e) {
        console.log('❌ Update check failed:', e.message)
        return { update: false, error: e.message }
    }
}

export function startAutoUpdateChecker(conn) {
    setInterval(async () => {
        console.log('🔄 [AUTO-UPDATE] Checking for updates...')
        await checkForUpdate(conn, true)
    }, 24 * 60 * 60 * 1000)
}

cmd({
    pattern: "update",
    desc: "Check for bot updates",
    category: "system",
    fromMe: false,
    filename: __filename
}, async (conn, m) => {
    await m.reply('🔄 Checking for updates...')
    const result = await checkForUpdate(conn, false)
    if(result.error) return m.reply(`❌ ${result.error}`)
    if(!result.update) return m.reply(`✅ *PRECIOUS-MD v${result.version}* is up to date${result.warning}`)
    m.reply(`🚀 *Update found: v${result.version}*${result.warning}\n\nUse *.updatebot* to update now`)
})

cmd({
    pattern: "updatebot",
    desc: "Update bot from github",
    category: "system",
    fromMe: true,
    filename: __filename
}, async (conn, m) => {
    await m.reply('📥 Downloading update... Please wait')
    exec('git pull && npm install', (err, stdout, stderr) => {
        if(err) return m.reply(`❌ Update failed:\n${err.message}`)
        let msg = `✅ *Updated Successfully!*\n\n`
        msg += `\`\`${stdout}\`\n`
        msg += `🔄 Restarting bot...`
        m.reply(msg)
        setTimeout(() => process.exit(1), 3000)
    })
})

cmd({
    pattern: "changelog",
    desc: "Show latest changelog",
    category: "system",
    fromMe: false,
    filename: __filename
}, async (conn, m) => {
    if(!fs.existsSync(updatePath)) return m.reply('update.json not found')
    const local = JSON.parse(fs.readFileSync(updatePath, 'utf-8'))
    m.reply(`*📢 ${local.name} CHANGELOG v${local.version}:*\n\n${local.changelog}`)
})

cmd({
    pattern: "system",
    desc: "Show system info",
    category: "system",
    fromMe: false,
    filename: __filename
}, async (conn, m) => {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
    const pluginCount = fs.readdirSync('./plugins').filter(f => f.endsWith('.js')).length
    const cmdCount = events.commands.length
    const isSupported = isVersionSupported(pkg.version)

    let msg = `╭─〔 *${pkg.name} v${pkg.version}* 〕─╮\n`
    msg += `├─ 🧩 Plugins : ${pluginCount}\n`
    msg += `├─ ⚡ Commands : ${cmdCount}\n`
    msg += `├─ 🛡️ Security : ${isSupported? '✅ Supported' : '❌ Unsupported'}\n`
    msg += `├─ 🟢 Node : ${process.version}\n`
    msg += `├─ 💻 Platform : ${process.platform}\n`
    msg += `├─ ⏱ Uptime : ${runtime(process.uptime())}\n`
    msg += `╰─────────────────`
    if(!isSupported) msg += `\n\n⚠️ *Update to v5.1.x for security patches*`
    m.reply(msg)
})