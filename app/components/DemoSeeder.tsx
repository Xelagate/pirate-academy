"use client";
import { useEffect } from "react";

const PROGRESS_KEY = "pirate-progress";
const DEMO_IDS = [
  "crab-forge-1","crab-forge-2","crab-forge-3","crab-forge-4",
  "crab-forge-5","crab-forge-6","crab-forge-7",
  "anchor-harbor-1","anchor-harbor-2","anchor-harbor-3",
];

export function DemoSeeder() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("seed") === "demo") {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(DEMO_IDS));
      const url = new URL(window.location.href);
      url.searchParams.delete("seed");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);
  return null;
}
