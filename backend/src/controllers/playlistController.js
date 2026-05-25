import * as playlistService from "../services/playlistService.js";
import { S3Service } from "../services/S3Service.js";

function parseId(idParam) {
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export async function createPlaylist(req, res) {
  try {
    let coverUrl = req.body.coverUrl;
    
    if (req.file) {
      const key = `playlist-cover-${Date.now()}-${req.file.originalname}`;
      coverUrl = await S3Service.uploadFile(req.file, 'cover', key);
    }

    const playlist = await playlistService.createPlaylist(req.user.id, {
      ...req.body,
      coverUrl
    });
    return res.status(201).json(playlist);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server"), error: error.message });
  }
}

export async function getPlaylists(req, res) {
  try {
    const playlists = await playlistService.listUserPlaylists(req.user.id);
    return res.json(playlists);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getPlaylistById(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await playlistService.getPlaylist(id, req.user?.id);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function updatePlaylist(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    let coverUrl = req.body.coverUrl;
    
    if (req.file) {
      const key = `playlist-cover-${Date.now()}-${req.file.originalname}`;
      coverUrl = await S3Service.uploadFile(req.file, 'cover', key);
    }

    const updateData = { ...req.body };
    if (coverUrl) updateData.coverUrl = coverUrl;

    const result = await playlistService.updatePlaylist(id, req.user.id, updateData);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.json(result.data);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server"), error: error.message });
  }
}

export async function followPlaylist(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await playlistService.followPlaylist(req.user.id, id);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.status(200).send();
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function unfollowPlaylist(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await playlistService.unfollowPlaylist(req.user.id, id);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.status(200).send();
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function addMusicToPlaylist(req, res) {
  const id = parseId(req.params.id);
  const { musicId } = req.body;
  
  if (id === null || !musicId) {
    return res.status(400).json({ message: req.__("errors.invalid_payload") });
  }

  try {
    const result = await playlistService.addMusic(id, req.user.id, Number(musicId));
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.status(201).send();
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function removeMusicFromPlaylist(req, res) {
  const { playlistId, musicId } = req.params;
  const pId = parseId(playlistId);
  const mId = parseId(musicId);

  if (pId === null || mId === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await playlistService.removeMusic(pId, req.user.id, mId);
    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}
