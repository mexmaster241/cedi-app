import jwt from "expo-jwt";

const JWT_SECRET = process.env.JWT_SECRET || "SECRETKEY";
const TOKEN_EXPIRY_TIME = 60 * 1000; // 1 minute in milliseconds


export const generateToken = (): string => {
  const now = Date.now();
  return jwt.encode({
    timestamp: now,
    exp: now + TOKEN_EXPIRY_TIME,
  }, JWT_SECRET);
};

export const getAuthToken = (): string => generateToken();

