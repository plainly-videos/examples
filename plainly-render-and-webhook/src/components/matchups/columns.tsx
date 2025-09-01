"use client";

import type { Matchup } from "@/app/generated/prisma";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<Matchup>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    accessorKey: "teamA",
    header: "Team A",
  },
  {
    accessorKey: "teamB",
    header: "Team B",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={cn(row.original.status === "pending" && "animate-pulse")}
        variant={
          row.original.status === "pending"
            ? "secondary"
            : row.original.status === "completed"
              ? "default"
              : "destructive"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "videoUrl",
    header: "Video",
    cell: ({ row }) => {
      const videoUrl = row.original.videoUrl;
      const expirationDate = row.original.expirationDate;

      if (!videoUrl) {
        return "N/A";
      }
      if (expirationDate && new Date(expirationDate) < new Date()) {
        return "Expired";
      }

      return (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
        >
          Preview
        </a>
      );
    },
  },
];
