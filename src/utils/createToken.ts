import jwt from 'jsonwebtoken';

export const createToken = (user: any, secretKey: any, expiryTime: any) => {
  return jwt.sign(user, secretKey, {
    expiresIn: expiryTime,
  });
};
