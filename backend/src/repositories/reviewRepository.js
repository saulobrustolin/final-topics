import { Review } from "../models/Review.js";
import { getRepository } from "../config/database.js";

export async function listReviews() {
  return getRepository(Review).find({
    relations: {
      user: true,
      game: true,
    },
    order: { id: "ASC" },
  });
}

export async function getReviewById(id) {
  return getRepository(Review).findOne({
    where: { id },
    relations: {
      user: true,
      game: true,
    },
  });
}

export async function getReviewByUserAndGame(userId, gameId) {
  return getRepository(Review).findOne({
    where: { userId, gameId },
    relations: {
      user: true,
      game: true,
    },
  });
}

export async function createReview({ userId, gameId, rating, comment }) {
  const repository = getRepository(Review);
  const review = repository.create({ userId, gameId, rating, comment });
  const savedReview = await repository.save(review);
  return getReviewById(savedReview.id);
}

export async function updateReview(id, data) {
  const repository = getRepository(Review);
  const review = await repository.findOneBy({ id });

  if (!review) {
    return null;
  }

  Object.assign(review, data);
  await repository.save(review);
  return getReviewById(id);
}

export async function removeReview(id) {
  const result = await getRepository(Review).delete({ id });
  return (result.affected ?? 0) > 0;
}