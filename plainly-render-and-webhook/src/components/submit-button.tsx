"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";

export function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || disabled}>
      Create Matchup
    </Button>
  );
}
