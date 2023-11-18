// generateSecretKey.ts
import crypto from "crypto";

const generateSecretKey = (): string => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  console.log("JWT Secret Key:", secretKey);
  return secretKey;
};

export default generateSecretKey;
