"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

export function SubmitButton({
  disabled,
  loading,
}: {
  disabled?: boolean;
  loading: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || disabled}>
      {loading ? "Creating..." : "Create Matchup"}
    </Button>
  );
}
