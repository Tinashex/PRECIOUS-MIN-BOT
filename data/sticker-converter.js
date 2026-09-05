import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StickerConverter {
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

    async convertStickerToImage(stickerBuffer) {
        const id = Date.now();

        const tempPath = path.join(
            this.tempDir,
            `sticker_${id}.webp`
        );

        const outputPath = path.join(
            this.tempDir,
            `image_${id}.png`
        );

        try {
            await fs.promises.writeFile(
                tempPath,
                stickerBuffer
            );

            await new Promise((resolve, reject) => {
                ffmpeg(tempPath)
                    .on('error', (err) => {
                        console.error('FFmpeg error:', err);
                        reject(err);
                    })
                    .on('end', resolve)
                    .output(outputPath)
                    .run();
            });

            return await fs.promises.readFile(outputPath);

        } catch (error) {
            console.error('Conversion error:', error);
            throw new Error(
                'Failed to convert sticker to image'
            );

        } finally {
            await Promise.all([
                fs.promises.unlink(tempPath).catch(() => {}),
                fs.promises.unlink(outputPath).catch(() => {})
            ]);
        }
    }
}

export default new StickerConverter();