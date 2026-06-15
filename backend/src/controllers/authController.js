import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { S3Service } from '../services/S3Service.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '1d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'listener'
    });

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser.id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    }

    return res.status(200).json({
      token: generateToken(user.id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao realizar login.', error: error.message });
  }
};

export const authController = { register, login };
