import * as searchService from "../services/searchService.js";

export async function search(req, res) {
  try {
    const q = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const result = await searchService.search(q, page, size);

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: req.__("errors.internal_server"), error: error.message });
  }
}
