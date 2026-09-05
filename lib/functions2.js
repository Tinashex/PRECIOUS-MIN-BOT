import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

const configPath = './config.env';

/**
 * Upload file to Empire CDN
 */
async function empiretourl(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);

    form.append("file", fileStream);

    const originalFileName = filePath.split("/").pop();
    form.append("originalFileName", originalFileName);

    try {
        const response = await axios.post(
            "https://cdn.empiretech.biz.id/api/upload.php",
            form,
            {
                headers: {
                    ...form.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        return response.data;

    } catch (error) {
        if (error.response) {
            throw new Error(
                `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            );
        } else if (error.request) {
            throw new Error("No response received from server.");
        } else {
            throw new Error(`Request Error: ${error.message}`);
        }
    }
}


/**
 * Fetch buffer from URL
 */
const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: {
                'DNT': '1',
                'Upgrade-Insecure-Request': '1'
            },
            ...options,
            responseType: 'arraybuffer'
        });

        return res.data;

    } catch (e) {
        console.error(e);
        return null;
    }
};


/**
 * Get group admins
 */
const getGroupAdmins = (participants) => {
    const admins = [];

    for (const participant of participants) {
        if (participant.admin !== null) {
            admins.push(participant.id);
        }
    }

    return admins;
};


/**
 * Random filename
 */
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};


/**
 * Format numbers
 */
const h2k = (eco) => {
    const lyrik = ['', 'K', 'M', 'B', 'T', 'P', 'E'];

    const ma = Math.floor(Math.log10(Math.abs(eco)) / 3);

    if (ma === 0) return eco.toString();

    const scale = Math.pow(10, ma * 3);
    const scaled = eco / scale;

    return (
        scaled.toFixed(1).replace(/\.0$/, '') +
        lyrik[ma]
    );
};


/**
 * Check URL
 */
const isUrl = (url) => {
    return url.match(
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/
    );
};


/**
 * JSON stringify
 */
const Json = (string) => {
    return JSON.stringify(string, null, 2);
};


/**
 * Runtime formatter
 */
const runtime = (seconds) => {
    seconds = Math.floor(seconds);

    const d = Math.floor(seconds / 86400);
    seconds %= 86400;

    const h = Math.floor(seconds / 3600);
    seconds %= 3600;

    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;

    return `${s}s`;
};


/**
 * Sleep
 */
const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};


/**
 * Fetch JSON
 */
const fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url,
            headers: {
                'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            ...options
        });

        return res.data;

    } catch (err) {
        console.error(err);
        return null;
    }
};


/**
 * Save config
 */
const saveConfig = (key, value) => {
    let configData = fs.existsSync(configPath)
        ? fs.readFileSync(configPath, 'utf8').split('\n')
        : [];

    let found = false;

    configData = configData.map(line => {
        if (line.startsWith(`${key}=`)) {
            found = true;
            return `${key}=${value}`;
        }

        return line;
    });

    if (!found) {
        configData.push(`${key}=${value}`);
    }

    fs.writeFileSync(
        configPath,
        configData.join('\n'),
        'utf8'
    );

    dotenv.config({ path: configPath });
};


export {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    saveConfig,
    empiretourl
};