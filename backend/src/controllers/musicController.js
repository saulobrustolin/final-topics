import * as musicService from "../services/musicService.js";
import { S3Service } from "../services/S3Service.js";

function parseId(idParam) {
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export async function getMusicById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await musicService.findMusicById(id);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function playMusic(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await musicService.playMusic(id);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function streamMusic(req, res) {
  const musicId = parseId(req.params.id);
  const filename = req.params.file;

  if (musicId === null || !filename) {
    return res.status(400).send();
  }

  try {
    const result = await musicService.getStreamData(musicId, filename);
    if (!result) return res.status(404).send();

    res.setHeader('Content-Type', result.contentType);
    if (result.contentLength) {
      res.setHeader('Content-Length', result.contentLength);
    }
    
    result.stream.pipe(res);
  } catch (error) {
    return res.status(500).send();
  }
}

export async function updateMusic(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const updateData = { ...req.body };

    if (req.files) {
      if (req.files.audio) {
        const audioFile = req.files.audio[0];
        const key = `music-audio-${Date.now()}-${audioFile.originalname}`;
        updateData.audioUrl = await S3Service.uploadFile(audioFile, 'music', key);
      }
      if (req.files.cover) {
        const coverFile = req.files.cover[0];
        const key = `music-cover-${Date.now()}-${coverFile.originalname}`;
        updateData.coverUrl = await S3Service.uploadFile(coverFile, 'cover', key);
      }
    }

    const result = await musicService.updateMusic(id, req.user.id, req.user.role, updateData);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server"), error: error.message });
  }
}
