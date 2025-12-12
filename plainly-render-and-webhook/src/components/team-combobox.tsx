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
    logo: "https://content.sportslogos.net/logos/6/229/full/8926_denver_nuggets-primary-2019.png",
  },
  {
    label: "LAKERS",
    value: "LAKERS",
    logo: "https://content.sportslogos.net/logos/6/237/full/los_angeles_lakers_logo_primary_2024_sportslogosnet-7324.png",
  },
  {
    label: "BULLS",
    value: "BULLS",
    logo: "https://content.sportslogos.net/logos/6/221/full/zdrycpc7mh5teihl10gko8sgf.png",
  },
  {
    label: "CELTICS",
    value: "CELTICS",
    logo: "https://content.sportslogos.net/logos/6/213/full/boston_celtics_logo_primary_dark_19978753.png",
  },
  {
    label: "WARRIORS",
    value: "WARRIORS",
    logo: "https://content.sportslogos.net/logos/6/235/full/3152_golden_state_warriors-primary-2020.png",
  },
  {
    label: "HEAT",
    value: "HEAT",
    logo: "https://content.sportslogos.net/logos/6/214/full/6459_miami_heat-primary_dark-2000.png",
  },
  {
    label: "CLIPPERS",
    value: "CLIPPERS",
    logo: "https://content.sportslogos.net/logos/6/236/full/los_angeles_clippers_logo_primary_2025_sportslogosnet-5542.png",
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
