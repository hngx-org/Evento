import prisma from "../utils/prisma";
import { Prisma } from "@prisma/client";

// upload profile picture controller
export const uploadProfileImageService = async (
  userId: string,
  urls: string[]
): Promise<{ profileImage: string }> => {
  const user = await prisma.user.update({
    where: { userID: userId },
    data: { profileImage: urls[0] },
  });
  return { profileImage: urls[0] };
};
