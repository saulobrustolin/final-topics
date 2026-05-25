import { Album } from "../models/Album.js";
import { getRepository } from "../config/database.js";
import { ILike } from "typeorm";

export async function getAlbumById(id) {
  return getRepository(Album).findOne({
    where: { id },
    relations: {
      musics: {
        artists: true,
        owner: true
      },
      user: true
    }
  });
}

export async function createAlbum(data) {
  const repository = getRepository(Album);
  const album = repository.create(data);
  return repository.save(album);
}

export async function listAlbumsByArtist(artistId) {
  return getRepository(Album).find({
    where: { userId: artistId },
    order: { releaseDate: "DESC" }
  });
}

export async function searchAlbums(q, page = 1, size = 10) {
  const skip = (page - 1) * size;
  return getRepository(Album).find({
    where: { 
      title: q ? ILike(`%${q}%`) : undefined
    },
    relations: {
      user: true
    },
    order: { title: "ASC" },
    take: size,
    skip: skip
  });
}

export const albumRepository = {
  getAlbumById,
  createAlbum,
  listAlbumsByArtist,
  searchAlbums
};
