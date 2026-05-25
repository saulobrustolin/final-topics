import { musicRepository } from "../repositories/musicRepository.js";
import UserRole from "../models/enums/UserRole.js";
import { S3Service } from "./S3Service.js";

async function signMusicUrls(music) {
  if (!music) return null;
  
  if (music.coverUrl) {
    music.coverUrl = await S3Service.getPresignedUrl('cover', music.coverUrl);
  }
  
  if (music.audioUrl && music.audioUrl.endsWith('.m3u8')) {
    const portBackend = process.env.PORT || 3001;
    music.audioUrl = `http://localhost:${portBackend}/api/v1/music/stream/${music.id}/index.m3u8`;
  }

  // Handle nested album cover
  if (music.album && music.album.coverUrl) {
    music.album.coverUrl = await S3Service.getPresignedUrl('cover', music.album.coverUrl);
  }

  return music;
}

export async function getStreamData(musicId, filename) {
  const music = await musicRepository.getMusicById(musicId);
  if (!music) return null;

  const key = `hls/${musicId}/${filename}`;
  return S3Service.getFileStream('music', key);
}

export async function findMusicById(id) {
  const music = await musicRepository.getMusicById(id);
  if (!music) {
    return { errorKey: "errors.music_not_found", status: 404 };
  }
  const signedMusic = await signMusicUrls(music);
  return { data: signedMusic, status: 200 };
}

export async function playMusic(id) {
  const music = await musicRepository.getMusicById(id);
  if (!music) {
    return { errorKey: "errors.music_not_found", status: 404 };
  }
  
  const portBackend = process.env.PORT || 3001;
  const proxyUrl = `http://localhost:${portBackend}/api/v1/music/stream/${music.id}/index.m3u8`;
  return { data: { url: proxyUrl }, status: 200 };
}

export async function updateMusic(musicId, userId, userRole, data) {
  const music = await musicRepository.getMusicById(musicId);

  if (!music) {
    return { errorKey: "errors.music_not_found", status: 404 };
  }

  if (userRole !== UserRole.ARTIST && userRole !== UserRole.ADMIN) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  if (music.album.userId !== userId && userRole !== UserRole.ADMIN) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  const updated = await musicRepository.updateMusic(musicId, data);
  const signedUpdated = await signMusicUrls(updated);
  return { data: signedUpdated, status: 200 };
}
