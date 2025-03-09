"use server";

const cacheName = "likesCache";
const cache = await caches.open(cacheName);
const key = new URL("https://localhost");

export const getLikes = async () => {
  const cachedResponse = await cache.match(key);
  return await cachedResponse?.json() ?? 0;
};

export default async function incrementLike() {
  const likeCount = await getLikes();
  await cache.put(key, Response.json(likeCount + 1));
  return likeCount + 1;
}
