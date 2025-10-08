import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET, JWT_REFRESH_SECRET,JWT_REFRESH_EXPIRES_IN } from "../config/env.js";
//Will change all these defaulting values to env only variables later 


/**
 * Generate access and refresh tokens for a user
 * @param {Object} user - user object with _id, role, email, isAccountVerified
 * @returns {Object} - { accessToken, refreshToken }
 */



//will make this function async later when i want to add better error handling
export const generateTokens = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
    isAccountVerified: user.isAccountVerified,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  return { accessToken, refreshToken };
};






