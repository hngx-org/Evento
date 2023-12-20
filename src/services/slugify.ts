import prisma from "../utils/prisma";

export const slugify = async (string, num = 0) => {
  let newSlug = string
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/[ ]+/g, "-");
  newSlug = num > 0 ? `${newSlug}-` + num : newSlug;

  const user = await prisma.user.findUnique({
    where: {
      slug: newSlug,
    },
  });

  if (user) {
    return slugify(string, num + 1);
  } else {
    return newSlug;
  }
};

// event slug
export const eventSlugify = async (string, num = 0) => {
  let newSlug = string
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/[ ]+/g, "-");
  newSlug = num > 0 ? `${newSlug}-` + num : newSlug;

  const event = await prisma.event.findUnique({
    where: {
      eventSlug: newSlug,
    },
  });

  if (event) {
    return eventSlugify(string, num + 1);
  } else {
    return newSlug;
  }
};
