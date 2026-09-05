import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { spawn } from 'child_process';

const ffmpegPath = ffmpegInstaller.path;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AudioConverter {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        this.ensureTempDir();
    }

    ensureTempDir() {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, {
                recursive: true
            });
        }
    }

    async cleanFile(file) {
        if (file && fs.existsSync(file)) {
            await fs.promises.unlink(file).catch(() => {});
        }
    }

    async convert(buffer, args, ext, ext2) {
        const id = Date.now();

        const inputPath = path.join(
            this.tempDir,
            `${id}.${ext}`
        );

        const outputPath = path.join(
            this.tempDir,
            `${id}.${ext2}`
        );

        try {
            await fs.promises.writeFile(
                inputPath,
                buffer
            );

            return new Promise((resolve, reject) => {
                const ffmpeg = spawn(
                    ffmpegPath,
                    [
                        '-y',
                        '-i',
                        inputPath,
                        ...args,
                        outputPath
                    ],
                    {
                        timeout: 30000
                    }
                );

                let errorOutput = '';

                ffmpeg.stderr.on(
                    'data',
                    (data) => {
                        errorOutput += data.toString();
                    }
                );

                ffmpeg.on(
                    'close',
                    async (code) => {
                        await this.cleanFile(inputPath);

                        if (code !== 0) {
                            await this.cleanFile(outputPath);

                            return reject(
                                new Error(
                                    `Conversion failed: ${errorOutput}`
                                )
                            );
                        }

                        try {
                            const result =
                                await fs.promises.readFile(outputPath);

                            await this.cleanFile(outputPath);

                            resolve(result);

                        } catch (error) {
                            reject(error);
                        }
                    }
                );

                ffmpeg.on(
                    'error',
                    (err) => {
                        reject(err);
                    }
                );
            });

        } catch (err) {
            await this.cleanFile(inputPath);
            await this.cleanFile(outputPath);

            throw err;
        }
    }


    toAudio(buffer, ext) {
        return this.convert(
            buffer,
            [
                '-vn',
                '-ac',
                '2',
                '-b:a',
                '128k',
                '-ar',
                '44100',
                '-f',
                'mp3'
            ],
            ext,
            'mp3'
        );
    }


    toPTT(buffer, ext) {
        return this.convert(
            buffer,
            [
                '-vn',
                '-c:a',
                'libopus',
                '-b:a',
                '128k',
                '-vbr',
                'on',
                '-compression_level',
                '10'
            ],
            ext,
            'opus'
        );
    }
}

export default new AudioConverter();