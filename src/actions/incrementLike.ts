"use server";

let likeCount = 0;
export default async function incrementLike() {
  likeCount++;
  return likeCount;
}
