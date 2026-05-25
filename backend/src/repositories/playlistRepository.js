import { Playlist } from "../models/Playlist.js";
import { getRepository } from "../config/database.js";

export async function listPlaylists(userId) {
  const query = {
    order: { id: "ASC" },
    where: { user: userId },
  };

  return getRepository(Playlist).find(query);
}

export async function getPlaylistById(id) {
  return getRepository(Playlist).findOne({
    where: { id },
    relations: {
      user: true,
      musics: {
        music: {
          album: true,
          artists: true,
          owner: true
        }
      }
    }
  });
}

export async function createPlaylist(data) {
  const repository = getRepository(Playlist);
  const playlist = repository.create(data);
  return repository.save(playlist);
}

export async function updatePlaylist(id, data) {
  const repository = getRepository(Playlist);
  const playlist = await repository.findOne({ 
    where: { id },
    relations: { user: true }
  });

  if (!playlist) {
    return null;
  }

  Object.assign(playlist, data);
  return repository.save(playlist);
}

export async function removePlaylist(id) {
  const result = await getRepository(Playlist).delete({ id });
  return (result.affected ?? 0) > 0;
}

export const playlistRepository = {
  listPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  removePlaylist
};
