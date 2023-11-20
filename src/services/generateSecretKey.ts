
// generateSecretKey
import crypto from "crypto";

const generateSecretKey = (): string => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  process.env.JWT_SECRET = secretKey;
  return secretKey;
};

export default generateSecretKey;
