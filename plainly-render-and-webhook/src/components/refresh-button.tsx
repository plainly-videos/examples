"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function RefreshButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={`${
        isPending || disabled ? "cursor-not-allowed" : ""
      } text-sm text-muted-foreground hover:text-primary`}
      disabled={isPending || disabled}
      onClick={() => startTransition(() => router.refresh())}
    >
      {isPending ? "Refreshing..." : "Refresh"}
    </button>
  );
}
