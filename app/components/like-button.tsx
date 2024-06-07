"use client";
import incrementLike from "@/app/actions/incrementLike.ts";
import { useState, useTransition } from "react";

export function LikeButton({ initialLikeCount }: { initialLikeCount: number }) {
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const onClick = () => {
    startTransition(async () => {
      const currentCount = await incrementLike();
      setLikeCount(currentCount);
    });
  };

  return (
    <>
      <p>Total LOL haha msaodr Lik okmdr lols ici lo2l icidad s okdsa mdr msdsddr ICI MDR lol mdra ses: {likeCount}</p>
      <button
        onClick={onClick}
        disabled={isPending}
        className="bg-black text-white p-4"
      >
        Likeok
      </button>
    </>
  );
}
