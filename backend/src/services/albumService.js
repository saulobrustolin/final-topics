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
    
    // Convert owner relation to simple string and clean up
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

export async function createAlbumWithMusics(userId, albumData, files, metadata) {
  // 1. Create Album
  const album = await albumRepository.createAlbum({
    title: albumData.title,
    description: albumData.description,
    coverUrl: albumData.coverUrl,
    userId: userId,
    releaseDate: new Date()
  });

  // 2. Upload and Create Musics
  const musicRecords = [];
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const musicMeta = metadata[i] || {};
      
      // First, create the music entry to get an ID
      let music = await musicRepository.createMusic({
        title: file.originalname,
        duration: 0, 
        audioUrl: 'pending', 
        coverUrl: albumData.coverUrl,
        album: { id: album.id },
        ownerId: userId
      });

      // Handle Collabs
      if (musicMeta.collabs && Array.isArray(musicMeta.collabs)) {
        const collabUsers = [];
        for (const collabId of musicMeta.collabs) {
          const user = await userRepository.getUserById(collabId);
          if (user && user.role === UserRole.ARTIST) {
            collabUsers.push(user);
          }
        }
        // Link collabs via the ManyToMany relation
        music.artists = collabUsers;
        await musicRepository.updateMusic(music.id, { artists: collabUsers });
      }

      // Transcode and upload HLS segments
      const hlsKey = await TranscoderService.convertToHLS(file, music.id);
      const duration = await TranscoderService.getAudioDuration(file.buffer, file.originalname);
      
      // Update music with final HLS URL and real duration
      music = await musicRepository.updateMusic(music.id, {
        audioUrl: hlsKey,
        duration
      });

      musicRecords.push(music);
    }
  }

  // Sign URLs for the returned data
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
