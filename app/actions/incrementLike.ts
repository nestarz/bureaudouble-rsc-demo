"use server";

const kv = await Deno.openKv();
export default async function incrementLike() {
  const likeCount = (await kv.get<number>(["likes"])).value ?? 0;
  await kv.set(["likes"], likeCount + 1);
  return likeCount + 1;
}
