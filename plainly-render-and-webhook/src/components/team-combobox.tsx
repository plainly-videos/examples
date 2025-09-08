"use client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const teams = [
  {
    label: "NUGGETS",
    value: "NUGGETS",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/Denver_Nuggets.svg/800px-Denver_Nuggets.svg.png",
  },
  {
    label: "LAKERS",
    value: "LAKERS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1024px-Los_Angeles_Lakers_logo.svg.png",
  },
  {
    label: "BULLS",
    value: "BULLS",
    logo: "https://preview.redd.it/is-it-surprising-to-you-that-the-bulls-logo-has-stood-the-v0-yb42h26bfrfe1.png?auto=webp&s=26d90939a5574f7ecf3fc9d766a5c01a868ac074",
  },
  {
    label: "CELTICS",
    value: "CELTICS",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/1200px-Boston_Celtics.svg.png",
  },
  {
    label: "WARRIORS",
    value: "WARRIORS",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo.svg/1200px-Golden_State_Warriors_logo.svg.png",
  },
  {
    label: "HEAT",
    value: "HEAT",
    logo: "https://logos-world.net/wp-content/uploads/2020/05/Miami-Heat-Symbol.png",
  },
  {
    label: "CLIPPERS",
    value: "CLIPPERS",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/ed/Los_Angeles_Clippers_%282024%29.svg/800px-Los_Angeles_Clippers_%282024%29.svg.png",
  },
];

export function TeamCombobox({
  value,
  onChangeAction,
}: {
  value: string;
  onChangeAction: (team: string, logo: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? teams.find((team) => team.value === value)?.label
            : "Select team..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search team..." className="h-9" />
          <CommandList>
            <CommandEmpty>No teams found.</CommandEmpty>
            <CommandGroup>
              {teams.map((team) => (
                <CommandItem
                  key={team.value}
                  value={team.value}
                  onSelect={(currentValue) => {
                    setOpen(false);
                    if (value === currentValue) {
                      onChangeAction("", "");
                      return;
                    }

                    onChangeAction(team.value, team.logo);
                  }}
                >
                  {team.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === team.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
