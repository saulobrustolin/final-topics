import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  removeUser,
  getUserByEmail,
} from "../repositories/userRepository.js";

function validateUserPayload({ name, email }) {
  if (!name || !email) {
    return "errors.required_name_email";
  }

  return null;
}

export async function findAllUsers() {
  return listUsers();
}

export async function findUserById(id) {
  return getUserById(id);
}

export async function registerUser(payload) {
  const validationError = validateUserPayload(payload);
  if (validationError) {
    return { errorKey: validationError, status: 400 };
  }

  const existingUser = await getUserByEmail(payload.email);
  if (existingUser) {
    return { errorKey: "errors.email_already_registered", status: 409 };
  }

  const user = await createUser(payload);
  return { data: user, status: 201 };
}

export async function editUser(id, payload) {
  const currentUser = await getUserById(id);
  if (!currentUser) {
    return { errorKey: "errors.user_not_found", status: 404 };
  }

  const nextName = payload.name ?? currentUser.name;
  const nextEmail = payload.email ?? currentUser.email;

  const validationError = validateUserPayload({ name: nextName, email: nextEmail });
  if (validationError) {
    return { errorKey: validationError, status: 400 };
  }

  const userWithEmail = await getUserByEmail(nextEmail);
  if (userWithEmail && userWithEmail.id !== id) {
    return { errorKey: "errors.email_already_registered", status: 409 };
  }

  const updated = await updateUser(id, {
    name: nextName,
    email: nextEmail,
  });

  return { data: updated, status: 200 };
}

export async function deleteUser(id) {
  const deleted = await removeUser(id);
  if (!deleted) {
    return { errorKey: "errors.user_not_found", status: 404 };
  }

  return { status: 204 };
}
