import { Music } from "../models/Music.js";
import { getRepository } from "../config/database.js";
import { ILike, LessThanOrEqual } from "typeorm";

export async function getMusicById(id) {
  return getRepository(Music).findOne({
    where: { id },
    relations: {
      album: true,
      artists: true
    }
  });
}

export async function createMusic(data) {
  const repository = getRepository(Music);
  const music = repository.create(data);
  return repository.save(music);
}

export async function searchMusics(q, page = 1, size = 10) {
  const skip = (page - 1) * size;
  return getRepository(Music).find({
    where: { 
      title: q ? ILike(`%${q}%`) : undefined,
      album: {
        releaseDate: LessThanOrEqual(new Date())
      }
    },
    relations: {
      artists: true,
      album: {
        user: true
      }
    },
    order: { title: "ASC" },
    take: size,
    skip: skip
  });
}

export async function updateMusic(id, data) {
  const repository = getRepository(Music);
  const music = await repository.findOneBy({ id });

  if (!music) {
    return null;
  }

  Object.assign(music, data);
  return repository.save(music);
}

export async function removeMusic(id) {
  const result = await getRepository(Music).delete({ id });
  return (result.affected ?? 0) > 0;
}

export const musicRepository = {
  getMusicById,
  createMusic,
  updateMusic,
  removeMusic,
  searchMusics
};
