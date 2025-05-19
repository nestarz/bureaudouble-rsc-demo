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
      <p>Total Likes: {likeCount}</p>
      <button
        onClick={onClick}
        disabled={isPending}
        className="bg-black text-white p-4"
      >
        Like
      </button>
      <input
        type="text"
        onChange={(e) => {
          const state = null;
          const url = new URL(location.href);
          url.searchParams.delete("name");
          if (e.target.value.length > 0) {
            url.searchParams.set("name", e.target.value);
          }
          globalThis.history.pushState(null, "", url);
          const popStateEvent = new PopStateEvent("popstate", { state });
          globalThis.dispatchEvent(popStateEvent);
        }}
      />
    </>
  );
}
