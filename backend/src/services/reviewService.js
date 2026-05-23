import { getUserById } from "../repositories/userRepository.js";
import { getGameById } from "../repositories/gameRepository.js";
import {
  listReviews,
  getReviewById,
  getReviewByUserAndGame,
  createReview,
  updateReview,
  removeReview,
} from "../repositories/reviewRepository.js";

function parseRating(rating) {
  const parsed = Number(rating);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return undefined;
  }

  return parsed;
}

function validateReviewPayload({ userId, gameId, rating, comment }) {
  if (!userId || !gameId || rating === undefined || comment === undefined) {
    return { errorKey: "errors.required_review_fields", status: 400 };
  }

  const parsedUserId = Number(userId);
  const parsedGameId = Number(gameId);
  const parsedRating = parseRating(rating);

  if (!Number.isInteger(parsedUserId) || !Number.isInteger(parsedGameId)) {
    return { errorKey: "errors.invalid_id", status: 400 };
  }

  if (parsedRating === undefined) {
    return { errorKey: "errors.invalid_rating", status: 400 };
  }

  if (typeof comment !== "string" || !comment.trim()) {
    return { errorKey: "errors.required_review_fields", status: 400 };
  }

  return {
    parsedUserId,
    parsedGameId,
    parsedRating,
    parsedComment: comment.trim(),
  };
}

function validateReviewUpdatePayload({ rating, comment }) {
  if (rating === undefined && comment === undefined) {
    return { errorKey: "errors.required_review_update_fields", status: 400 };
  }

  const result = {};

  if (rating !== undefined) {
    const parsedRating = parseRating(rating);
    if (parsedRating === undefined) {
      return { errorKey: "errors.invalid_rating", status: 400 };
    }
    result.rating = parsedRating;
  }

  if (comment !== undefined) {
    if (typeof comment !== "string" || !comment.trim()) {
      return { errorKey: "errors.required_review_update_fields", status: 400 };
    }
    result.comment = comment.trim();
  }

  return result;
}

export async function findAllReviews() {
  return listReviews();
}

export async function findReviewById(id) {
  return getReviewById(id);
}

export async function registerReview(payload) {
  const validation = validateReviewPayload(payload);
  if (validation.errorKey) {
    return validation;
  }

  const user = await getUserById(validation.parsedUserId);
  if (!user) {
    return { errorKey: "errors.user_not_found", status: 404 };
  }

  const game = await getGameById(validation.parsedGameId);
  if (!game) {
    return { errorKey: "errors.game_not_found", status: 404 };
  }

  const existingReview = await getReviewByUserAndGame(validation.parsedUserId, validation.parsedGameId);
  if (existingReview) {
    return { errorKey: "errors.review_already_exists", status: 409 };
  }

  const review = await createReview({
    userId: validation.parsedUserId,
    gameId: validation.parsedGameId,
    rating: validation.parsedRating,
    comment: validation.parsedComment,
  });

  return { data: review, status: 201 };
}

export async function editReview(id, payload) {
  const currentReview = await getReviewById(id);
  if (!currentReview) {
    return { errorKey: "errors.review_not_found", status: 404 };
  }

  const validation = validateReviewUpdatePayload(payload);
  if (validation.errorKey) {
    return validation;
  }

  const updated = await updateReview(id, validation);
  return { data: updated, status: 200 };
}

export async function deleteReview(id) {
  const deleted = await removeReview(id);
  if (!deleted) {
    return { errorKey: "errors.review_not_found", status: 404 };
  }

  return { status: 204 };
}