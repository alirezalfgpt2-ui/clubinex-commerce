import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAppName() {
  const siteName = useQuery(api.settings.get, { key: "siteName" });
  return (siteName as string) || "Clubinex Commerce";
}
