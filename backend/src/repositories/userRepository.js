import { User } from "../models/User.js";
import { getRepository } from "../config/database.js";

export async function listUsers() {
  return getRepository(User).find({
    order: { id: "ASC" },
  });
}

export async function getUserById(id) {
  return getRepository(User).findOneBy({ id });
}

export async function createUser({ name, email }) {
  const repository = getRepository(User);
  const user = repository.create({ name, email });
  return repository.save(user);
}

export async function updateUser(id, data) {
  const repository = getRepository(User);
  const user = await repository.findOneBy({ id });

  if (!user) {
    return null;
  }

  Object.assign(user, data);
  return repository.save(user);
}

export async function removeUser(id) {
  const result = await getRepository(User).delete({ id });
  return (result.affected ?? 0) > 0;
}

export async function getUserByEmail(email) {
  return getRepository(User).findOneBy({ email });
}
