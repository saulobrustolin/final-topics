import * as userService from "../services/userService.js";
import { S3Service } from "../services/S3Service.js";

function parseId(idParam) {
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export async function getMe(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      profile_url: user.profile_url,
      is_active: user.is_active
    };

    if (userData.profile_url) {
      userData.profile_url = await S3Service.getPresignedUrl('profile', userData.profile_url);
    }
    
    return res.json(userData);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getArtistData(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await userService.getArtistData(id);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function updateArtistMusic(req, res) {
  const artistId = parseId(req.params.artistId);
  const musicId = parseId(req.params.musicId);

  if (artistId === null || musicId === null) {
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

    const result = await userService.updateArtistMusic(artistId, musicId, req.user.id, req.user.role, updateData);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server"), error: error.message });
  }
}
