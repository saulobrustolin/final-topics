import { playlistRepository } from "../repositories/playlistRepository.js";
import { playlistMusicRepository } from "../repositories/playlistMusicRepository.js";
import { musicRepository } from "../repositories/musicRepository.js";
import { S3Service } from "./S3Service.js";

async function signPlaylistUrls(playlist) {
  if (!playlist) return null;
  const processedPlaylist = { ...playlist };
  
  if (processedPlaylist.coverUrl) {
    processedPlaylist.coverUrl = await S3Service.getPresignedUrl('cover', processedPlaylist.coverUrl);
  }

  if (processedPlaylist.user) {
    processedPlaylist.owner = processedPlaylist.user.name;
    delete processedPlaylist.user;
  } else {
    processedPlaylist.owner = "Unknown User";
  }
  
  if (processedPlaylist.musics) {
    const processedMusics = [];
    for (const pm of processedPlaylist.musics) {
      const pmCopy = { ...pm };
      if (pmCopy.music) {
        const musicCopy = { ...pmCopy.music };
        if (musicCopy.coverUrl) {
          musicCopy.coverUrl = await S3Service.getPresignedUrl('cover', musicCopy.coverUrl);
        }
        
        // Convert owner relation to simple string and clean up
        musicCopy.owner = musicCopy.owner?.name || "Unknown Artist";
        delete musicCopy.ownerId;
        
        pmCopy.music = musicCopy;
      }
      processedMusics.push(pmCopy);
    }
    processedPlaylist.musics = processedMusics;
  }
  return processedPlaylist;
}

export async function createPlaylist(userId, data) {
  const playlist = await playlistRepository.createPlaylist({
    ...data,
    userId
  });
  return signPlaylistUrls(playlist);
}

export async function followPlaylist(userId, playlistId) {
  const success = await playlistRepository.followPlaylist(userId, playlistId);
  if (!success) {
    return { errorKey: "errors.playlist_not_found", status: 404 };
  }
  return { status: 200 };
}

export async function unfollowPlaylist(userId, playlistId) {
  const success = await playlistRepository.unfollowPlaylist(userId, playlistId);
  if (!success) {
    return { errorKey: "errors.playlist_not_found", status: 404 };
  }
  return { status: 200 };
}

export async function listUserPlaylists(userId) {
  const playlists = await playlistRepository.listPlaylists(userId);
  
  return Promise.all(playlists.map(p => signPlaylistUrls(p)));
}

export async function getPlaylist(playlistId, currentUserId) {
  const playlist = await playlistRepository.getPlaylistById(playlistId);
  
  if (!playlist) {
    return { errorKey: "errors.playlist_not_found", status: 404 };
  }

  // RN01 Usuário não pode acessar paylist privadas que não foram criadas por ele
  if (playlist.isPrivate && playlist.userId !== currentUserId) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  const signedPlaylist = await signPlaylistUrls(playlist);
  return { data: signedPlaylist, status: 200 };
}

export async function updatePlaylist(playlistId, userId, data) {
  const playlist = await playlistRepository.getPlaylistById(playlistId);

  if (!playlist) {
    return { errorKey: "errors.playlist_not_found", status: 404 };
  }

  if (playlist.userId !== userId) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  const updated = await playlistRepository.updatePlaylist(playlistId, data);
  const signedUpdated = await signPlaylistUrls(updated);
  return { data: signedUpdated, status: 200 };
}

export async function addMusic(playlistId, userId, musicId) {
  const playlist = await playlistRepository.getPlaylistById(playlistId);

  if (!playlist) {
    return { errorKey: "errors.playlist_not_found", status: 404 };
  }

  // RN02 Usuário não pode adicionar músicas em playlists de outros usuários
  if (playlist.userId !== userId) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  const music = await musicRepository.getMusicById(musicId);
  if (!music) {
    return { errorKey: "errors.music_not_found", status: 404 };
  }

  const existing = await playlistMusicRepository.findEntry(playlistId, musicId);
  if (existing) {
    return { errorKey: "errors.music_already_in_playlist", status: 400 };
  }

  await playlistMusicRepository.addMusicToPlaylist(playlistId, musicId);
  return { status: 201 };
}

export async function removeMusic(playlistId, userId, musicId) {
  const playlist = await playlistRepository.getPlaylistById(playlistId);

  if (!playlist) {
    return { errorKey: "errors.playlist_not_found", status: 404 };
  }

  if (playlist.userId !== userId) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  const removed = await playlistMusicRepository.removeMusicFromPlaylist(playlistId, musicId);
  if (!removed) {
    return { errorKey: "errors.music_not_in_playlist", status: 404 };
  }

  return { status: 204 };
}
