"use client";
import incrementLike from "@/src/actions/incrementLike.ts";
import { useState, useTransition } from "react";

export function LikeButton() {
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(0);

  const onClick = () => {
    startTransition(async () => {
      const currentCount = await incrementLike();
      setLikeCount(currentCount);
    });
  };

  return (
    <>
      <p>Total Likes: {likeCount}</p>
      <button
        onClick={onClick}
        disabled={isPending}
        className="bg-black text-white p-4"
      >
        Like
      </button>
    </>
  );
}
