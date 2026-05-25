import { albumRepository } from "../repositories/albumRepository.js";
import { musicRepository } from "../repositories/musicRepository.js";
import { playlistRepository } from "../repositories/playlistRepository.js";
import { S3Service } from "./S3Service.js";

export async function search(q, page, size) {
  const albums = await albumRepository.searchAlbums(q, page, size);
  const musics = await musicRepository.searchMusics(q, page, size);
  const playlists = await playlistRepository.searchPlaylists(q, page, size);

  const portFrontend = process.env.FRONTEND_PORT || 3000;

  const mappedAlbums = await Promise.all(albums.map(async (album) => {
    let signedCoverUrl = null;
    if (album.coverUrl) {
      signedCoverUrl = await S3Service.getPresignedUrl('cover', album.coverUrl);
    }
    return {
      id: album.id,
      name: album.title,
      artist: album.user?.name || "Unknown Artist",
      coverUrl: signedCoverUrl,
      albumUrl: `http://localhost:${portFrontend}/album/${album.id}`
    };
  }));

  const mappedMusics = await Promise.all(musics.map(async (music) => {
    let signedCoverUrl = null;
    if (music.coverUrl) {
      signedCoverUrl = await S3Service.getPresignedUrl('cover', music.coverUrl);
    }

    const artists = music.artists?.map(a => a.name) || [];
    // Ensure the main artist (from album) is included if not in colab list
    const mainArtist = music.album?.user?.name;
    if (mainArtist && !artists.includes(mainArtist)) {
      artists.unshift(mainArtist);
    }

    return {
      id: music.id,
      name: music.title,
      duration: formatDuration(music.duration),
      coverUrl: signedCoverUrl,
      artistics: artists,
      albumName: music.album?.title || "Unknown Album",
      musicUrl: `http://localhost:${portFrontend}/music/${music.id}`
    };
  }));

  const mappedPlaylists = await Promise.all(playlists.map(async (playlist) => {
    let signedCoverUrl = null;
    if (playlist.coverUrl) {
      signedCoverUrl = await S3Service.getPresignedUrl('cover', playlist.coverUrl);
    }
    return {
      id: playlist.id,
      name: playlist.title,
      owner: playlist.user?.name || "Unknown User",
      coverUrl: signedCoverUrl,
      isPrivate: playlist.isPrivate
    };
  }));

  return {
    albuns: mappedAlbums,
    musics: mappedMusics,
    playlists: mappedPlaylists
  };
}

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const searchService = {
  search
};
