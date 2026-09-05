import axios from 'axios';
import fs from 'fs';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export const getBuffer = async(url, options) => {
	try {
		options? options : {}
		var res = await axios({
			method: 'get',
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (e) {
		console.log(e)
	}
}

export const getGroupAdmins = (participants) => {
	var admins = []
	for (let i of participants) {
		i.admin!== null? admins.push(i.id) : ''
	}
	return admins
}

export const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`
}

export const h2k = (eco) => {
	var lyrik = ['', 'K', 'M', 'B', 'T', 'P', 'E']
	var ma = Math.log10(Math.abs(eco)) / 3 | 0
	if (ma == 0) return eco
	var ppo = lyrik[ma]
	var scale = Math.pow(10, ma * 3)
	var scaled = eco / scale
	var formatt = scaled.toFixed(1)
	if (/\.0$/.test(formatt))
		formatt = formatt.substr(0, formatt.length - 2)
	return formatt + ppo
}

export const isUrl = (url) => {
	return url.match(
		new RegExp(
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/,
			'gi'
		)
	)
}

export const Json = (string) => {
    return JSON.stringify(string, null, 2)
}

export const runtime = (seconds) => {
	seconds = Number(seconds)
	var d = Math.floor(seconds / (3600 * 24))
	var h = Math.floor(seconds % (3600 * 24) / 3600)
	var m = Math.floor(seconds % 3600 / 60)
	var s = Math.floor(seconds % 60)
	var dDisplay = d > 0? d + (d == 1? ' day, ' : ' days, ') : ''
	var hDisplay = h > 0? h + (h == 1? ' hour, ' : ' hours, ') : ''
	var mDisplay = m > 0? m + (m == 1? ' minute, ' : ' minutes, ') : ''
	var sDisplay = s > 0? s + (s == 1? ' second' : ' seconds') : ''
	return dDisplay + hDisplay + mDisplay + sDisplay;
}

export const sleep = async(ms) => {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export const fetchJson = async (url, options) => {
    try {
        options? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
           ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

// These two were missing but your index.js calls them - added so bot won't crash
export const imageToWebp = async (buffer) => {
    const sticker = new Sticker(buffer, {
        pack: 'PRECIOUS-MD',
        author: 'Watson',
        type: StickerTypes.FULL,
        quality: 50
    });
    return await sticker.toBuffer();
}

export const videoToWebp = async (buffer) => {
    const sticker = new Sticker(buffer, {
        pack: 'PRECIOUS-MD',
        author: 'Watson',
        type: StickerTypes.FULL,
        quality: 50
    });
    return await sticker.toBuffer();
}

export default { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, imageToWebp, videoToWebp };