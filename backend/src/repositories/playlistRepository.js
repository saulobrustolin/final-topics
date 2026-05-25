import { Playlist } from "../models/Playlist.js";
import { User } from "../models/User.js";
import { getRepository } from "../config/database.js";
import { ILike } from "typeorm";

export async function listPlaylists(userId) {
  const repository = getRepository(Playlist);
  
  // Find owned playlists
  const owned = await repository.find({
    where: { user: { id: userId } },
    order: { id: "ASC" },
    relations: { user: true }
  });

  // Find followed playlists (via User model)
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: { followedPlaylists: { user: true } }
  });

  const followed = user?.followedPlaylists || [];

  // Combine and sort or just return
  // To avoid duplicates if a user follows their own playlist (unlikely)
  const combined = [...owned];
  followed.forEach(fp => {
    if (!combined.find(c => c.id === fp.id)) {
      combined.push(fp);
    }
  });

  return combined;
}

export async function followPlaylist(userId, playlistId) {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: { followedPlaylists: true }
  });

  if (!user) return false;

  const playlist = await getRepository(Playlist).findOneBy({ id: playlistId });
  if (!playlist) return false;

  // Add if not already followed
  if (!user.followedPlaylists.find(p => p.id === playlist.id)) {
    user.followedPlaylists.push(playlist);
    await userRepository.save(user);
  }

  return true;
}

export async function unfollowPlaylist(userId, playlistId) {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: { followedPlaylists: true }
  });

  if (!user) return false;

  user.followedPlaylists = user.followedPlaylists.filter(p => p.id !== playlistId);
  await userRepository.save(user);
  return true;
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

export async function searchPlaylists(q, page = 1, size = 10) {
  const skip = (page - 1) * size;
  const repository = getRepository(Playlist);
  return repository.find({
    where: { 
      title: q ? ILike(`${q}%`) : undefined,
      isPrivate: false
    },
    relations: {
      user: true
    },
    order: { title: "ASC" },
    take: size,
    skip: skip
  });
}

export const playlistRepository = {
  listPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  removePlaylist,
  searchPlaylists,
  followPlaylist,
  unfollowPlaylist
};
