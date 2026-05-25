import jwt from 'jsonwebtoken';
import { userRepository } from "../repositories/userRepository.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      req.user = await userRepository.findById(decoded.id); 
      
      if (!req.user) {
        return res.status(401).json({ message: 'Usuário não encontrado.' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Não autorizado, token ausente.' });
  }
};

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Você não tem permissão para realizar esta ação.' });
    }
    next();
  };
};
