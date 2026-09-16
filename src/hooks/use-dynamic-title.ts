import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useDynamicTitle() {
  const siteName = useQuery(api.settings.get, { key: "siteName" });
  
  useEffect(() => {
    if (siteName) {
      document.title = `${siteName} — فروشگاه آنلاین`;
    }
  }, [siteName]);
}
