import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { S3Service } from './S3Service.js';

export async function getAudioDuration(buffer, originalname) {
  const tempFile = path.join(process.cwd(), 'temp', `probe-${Date.now()}-${originalname}`);
  
  if (!fs.existsSync(path.dirname(tempFile))) {
    await fsPromises.mkdir(path.dirname(tempFile), { recursive: true });
  }

  await fsPromises.writeFile(tempFile, buffer);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(tempFile, (err, metadata) => {
      // Cleanup temp file immediately
      fsPromises.unlink(tempFile).catch(() => {});
      
      if (err) return reject(err);
      resolve(Math.round(metadata.format.duration || 0));
    });
  });
}

export async function convertToHLS(file, musicId) {
  const tempDir = path.join(process.cwd(), 'temp', musicId.toString());
  
  if (!fs.existsSync(tempDir)) {
    await fsPromises.mkdir(tempDir, { recursive: true });
  }

  const inputPath = path.join(tempDir, `input-${Date.now()}${path.extname(file.originalname)}`);
  const outputPath = path.join(tempDir, 'index.m3u8');

  // Save buffer to temp file
  await fsPromises.writeFile(inputPath, file.buffer);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-profile:a aac_low',
        '-hls_time 10',
        '-hls_list_size 0',
        '-f hls'
      ])
      .output(outputPath)
      .on('end', async () => {
        try {
          // Upload all files in tempDir to S3
          const files = await fsPromises.readdir(tempDir);
          const uploadPromises = files
            .filter(f => f.endsWith('.m3u8') || f.endsWith('.ts'))
            .map(async (f) => {
              const filePath = path.join(tempDir, f);
              const fileBuffer = await fsPromises.readFile(filePath);
              const key = `hls/${musicId}/${f}`;
              
              const mockFile = {
                buffer: fileBuffer,
                originalname: f,
                mimetype: f.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/MP2T'
              };
              
              return S3Service.uploadFile(mockFile, 'music', key);
            });

          await Promise.all(uploadPromises);

          // Cleanup
          await fsPromises.rm(tempDir, { recursive: true, force: true });
          
          resolve(`hls/${musicId}/index.m3u8`);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

export const TranscoderService = {
  convertToHLS,
  getAudioDuration,
};
