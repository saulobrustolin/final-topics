import { albumRepository } from "../repositories/albumRepository.js";
import { musicRepository } from "../repositories/musicRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { S3Service } from "./S3Service.js";
import { TranscoderService } from "./TranscoderService.js";
import UserRole from "../models/enums/UserRole.js";

async function signMusicUrls(musics) {
  if (!musics) return [];
  const processed = [];
  for (const music of musics) {
    const m = { ...music };
    if (m.coverUrl) {
      m.coverUrl = await S3Service.getPresignedUrl('cover', m.coverUrl);
    }
    if (m.audioUrl && m.audioUrl.endsWith('.m3u8')) {
      const portBackend = process.env.PORT || 3001;
      m.audioUrl = `http://localhost:${portBackend}/api/v1/music/stream/${m.id}`;
    }
    
    m.owner = music.owner?.name || "Unknown Artist";
    delete m.ownerId;
    processed.push(m);
  }
  return processed;
}

export async function findAlbumMusics(id) {
  const album = await albumRepository.getAlbumById(id);
  if (!album) {
    return { errorKey: "errors.album_not_found", status: 404 };
  }
  const signedMusics = await signMusicUrls(album.musics);
  return { data: signedMusics, status: 200 };
}

export async function findAlbumById(id) {
  const album = await albumRepository.getAlbumById(id);
  if (!album) {
    return { errorKey: "errors.album_not_found", status: 404 };
  }
  if (album.coverUrl) {
    album.coverUrl = await S3Service.getPresignedUrl('cover', album.coverUrl);
  }
  if (album.musics) {
    album.musics = await signMusicUrls(album.musics);
  }

  const responseData = {
    ...album,
    owner: album.user?.name || "Unknown Artist"
  };
  delete responseData.user;
  delete responseData.userId;

  return { data: responseData, status: 200 };
}

export async function listAlbumsByArtist(artistId) {
  const albums = await albumRepository.listAlbumsByArtist(artistId);
  const processed = [];
  for (const album of albums) {
    const a = { ...album };
    if (a.coverUrl) {
      a.coverUrl = await S3Service.getPresignedUrl('cover', a.coverUrl);
    }
    processed.push(a);
  }
  return { data: processed, status: 200 };
}

export async function createAlbumWithMusics(userId, albumData, files, metadata) {
  const album = await albumRepository.createAlbum({
    title: albumData.title,
    description: albumData.description,
    coverUrl: albumData.coverUrl,
    userId: userId,
    releaseDate: albumData.releaseDate ? new Date(albumData.releaseDate) : new Date()
  });

  const musicRecords = [];
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const musicMeta = metadata[i] || {};
      
      let music = await musicRepository.createMusic({
        title: musicMeta.title || file.originalname,
        duration: 0, 
        audioUrl: 'pending', 
        coverUrl: albumData.coverUrl,
        album: { id: album.id },
        ownerId: userId
      });

      if (musicMeta.collabs && Array.isArray(musicMeta.collabs)) {
        const collabUsers = [];
        for (const collabId of musicMeta.collabs) {
          const user = await userRepository.getUserById(collabId);
          if (user && user.role === UserRole.ARTIST) {
            collabUsers.push(user);
          }
        }
        music.artists = collabUsers;
        await musicRepository.updateMusic(music.id, { artists: collabUsers });
      }

      const hlsKey = await TranscoderService.convertToHLS(file, music.id);
      const duration = await TranscoderService.getAudioDuration(file.buffer, file.originalname);
      
      music = await musicRepository.updateMusic(music.id, {
        audioUrl: hlsKey,
        duration
      });

      musicRecords.push(music);
    }
  }

  const signedAlbum = { ...album };
  if (signedAlbum.coverUrl) {
    signedAlbum.coverUrl = await S3Service.getPresignedUrl('cover', signedAlbum.coverUrl);
  }
  const signedMusics = await signMusicUrls(musicRecords);

  return {
    data: {
      ...signedAlbum,
      musics: signedMusics
    },
    status: 201
  };
}
