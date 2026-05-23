import {
  findAllReviews,
  findReviewById,
  registerReview,
  editReview,
  deleteReview,
} from "../services/reviewService.js";

function parseId(idParam) {
  const id = Number(idParam);
  if (Number.isNaN(id)) {
    return null;
  }
  return id;
}

export async function getReviews(req, res) {
  try {
    const reviews = await findAllReviews();
    return res.json(reviews);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function getReview(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const review = await findReviewById(id);
    if (!review) {
      return res.status(404).json({ message: req.__("errors.review_not_found") });
    }

    return res.json(review);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function createNewReview(req, res) {
  try {
    const result = await registerReview(req.body);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function updateExistingReview(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await editReview(id, req.body);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).json(result.data);
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}

export async function deleteExistingReview(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ message: req.__("errors.invalid_id") });
  }

  try {
    const result = await deleteReview(id);

    if (result.errorKey) {
      return res.status(result.status).json({ message: req.__(result.errorKey) });
    }

    return res.status(result.status).send();
  } catch {
    return res.status(500).json({ message: req.__("errors.internal_server") });
  }
}