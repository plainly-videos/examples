"use client";

import { useState } from "react";
import { SubmitButton } from "./submit-button";
import { TeamCombobox } from "./team-combobox";
import { Label } from "./ui/label";
import { render } from "@/actions/render";

export default function MatchupForm() {
  const [data, setData] = useState({
    team1: "",
    team1logo: "",
    team2: "",
    team2logo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("team1", data.team1);
    formData.append("team1logo", data.team1logo);
    formData.append("team2", data.team2);
    formData.append("team2logo", data.team2logo);

    await render(formData);
    setData({ team1: "", team1logo: "", team2: "", team2logo: "" });
  };

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex divide-x">
          <div className="grid gap-2 flex-1 pr-4">
            <Label htmlFor="team1">Team A</Label>
            <TeamCombobox
              value={data.team1}
              onChangeAction={(team, logo) => {
                setData((prev) => ({ ...prev, team1: team, team1logo: logo }));
              }}
            />
          </div>
          <div className="grid gap-2 flex-1 pl-4">
            <Label htmlFor="team1">Team B</Label>
            <TeamCombobox
              value={data.team2}
              onChangeAction={(team, logo) => {
                setData((prev) => ({ ...prev, team2: team, team2logo: logo }));
              }}
            />
          </div>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}
