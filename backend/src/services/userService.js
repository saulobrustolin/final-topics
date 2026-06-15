import { userRepository } from "../repositories/userRepository.js";
import { playlistRepository } from "../repositories/playlistRepository.js";
import { albumRepository } from "../repositories/albumRepository.js";
import { musicRepository } from "../repositories/musicRepository.js";
import UserRole from "../models/enums/UserRole.js";
import { S3Service } from "./S3Service.js";

export async function findUserById(id) {
  return userRepository.getUserById(id);
}

export async function getArtistData(artistId) {
  const artist = await userRepository.getUserById(artistId);
  if (!artist || artist.role !== UserRole.ARTIST) {
    return { errorKey: "errors.artist_not_found", status: 404 };
  }

  if (artist.profile_url) {
    artist.profile_url = await S3Service.getPresignedUrl('profile', artist.profile_url);
  }

  const albums = await albumRepository.listAlbumsByArtist(artistId);
  for (const album of albums) {
    if (album.coverUrl) {
      album.coverUrl = await S3Service.getPresignedUrl('cover', album.coverUrl);
    }
  }

  const playlists = await playlistRepository.listPlaylists(artistId);
  const publicPlaylists = playlists.filter(p => !p.isPrivate);
  for (const playlist of publicPlaylists) {
    if (playlist.coverUrl) {
      playlist.coverUrl = await S3Service.getPresignedUrl('cover', playlist.coverUrl);
    }
  }

  return {
    data: {
      artist,
      albums,
      playlists: publicPlaylists
    },
    status: 200
  };
}

export async function updateArtistMusic(artistId, musicId, userId, userRole, data) {
  if (userRole !== UserRole.ARTIST && userRole !== UserRole.ADMIN) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  if (artistId !== userId && userRole !== UserRole.ADMIN) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  const music = await musicRepository.getMusicById(musicId);
  if (!music) {
    return { errorKey: "errors.music_not_found", status: 404 };
  }

  if (music.album.userId !== artistId && userRole !== UserRole.ADMIN) {
    return { errorKey: "errors.forbidden", status: 403 };
  }

  const updated = await musicRepository.updateMusic(musicId, data);
  
  if (updated.coverUrl) {
    updated.coverUrl = await S3Service.getPresignedUrl('cover', updated.coverUrl);
  }

  return { data: updated, status: 200 };
}
