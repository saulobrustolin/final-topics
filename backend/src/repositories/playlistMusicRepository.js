import { PlaylistMusic } from "../models/PlaylistMusic.js";
import { getRepository } from "../config/database.js";

export async function addMusicToPlaylist(playlistId, musicId, position = 0) {
  const repository = getRepository(PlaylistMusic);
  const entry = repository.create({
    playlist: { id: playlistId },
    music: { id: musicId },
    position
  });
  return repository.save(entry);
}

export async function removeMusicFromPlaylist(playlistId, musicId) {
  const result = await getRepository(PlaylistMusic).delete({
    playlist: { id: playlistId },
    music: { id: musicId }
  });
  return (result.affected ?? 0) > 0;
}

export async function findEntry(playlistId, musicId) {
  return getRepository(PlaylistMusic).findOne({
    where: {
      playlist: { id: playlistId },
      music: { id: musicId }
    }
  });
}

export const playlistMusicRepository = {
  addMusicToPlaylist,
  removeMusicFromPlaylist,
  findEntry
};
