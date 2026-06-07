import * as albumService from "../services/albumService.js";
import { S3Service } from "../services/S3Service.js";

function parseId(idParam) {
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export async function createAlbum(req, res) {
  try {
    const { title, description, musicsMetadata, releaseDate } = req.body;
    let coverUrl = null;

    if (req.files['cover']) {
      const coverFile = req.files['cover'][0];
      const key = `album-cover-${Date.now()}-${coverFile.originalname}`;
      coverUrl = await S3Service.uploadFile(coverFile, 'cover', key);
    }

    const musicFiles = req.files['musics'] || [];
    
    // musicsMetadata expected to be a JSON string if coming from multipart form
    // it should contain an array of { title: "Song Name", collabs: [id1, id2] } corresponding to the musicFiles index
    let metadata = [];
    if (musicsMetadata) {
      try {
        metadata = JSON.parse(musicsMetadata);
      } catch (e) {
        return res.status(400).json({ message: "Invalid musicsMetadata format. Expected JSON string." });
      }
    }

    const result = await albumService.createAlbumWithMusics(req.user.id, {
      title,
      description,
      coverUrl,
      releaseDate
    }, musicFiles, metadata);

    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server"), error: error.message });
  }
}

export async function listMyAlbums(req, res) {
  try {
    const albums = await albumService.listAlbumsByArtist(req.user.id);
    return res.json(albums.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getAlbumMusics(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await albumService.findAlbumMusics(id);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getAlbumById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await albumService.findAlbumById(id);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}
