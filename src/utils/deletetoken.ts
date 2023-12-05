// cron job to delete expired tokens every 5 minutes

import prisma from "../utils/prisma";

// Delete expired tokens (you can run this periodically, e.g., every hour)
const deleteExpiredTokens = async () => {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() - 5); // Tokens older than 5 minutes
  await prisma.oTP.deleteMany({
    where: {
      createdAt: {
        lt: expirationTime,
      },
    },
  });
};

export default deleteExpiredTokens;
