import { Outlet, useLocation } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { SubNav } from "./SubNav";
import { Breadcrumb } from "./Breadcrumb";
import { LockScreen } from "@/components/LockScreen";
import { applySidebarTheme, getCurrentSidebarTheme } from "@/config/sidebar-themes";

const CHECK_INTERVAL_MS = 30000;

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const promote = useMutation(api.users.makeAdmin);

  // Auto promote user to admin in dev environment
  useEffect(() => {
    promote().catch(() => {});
  }, [promote]);

  // Read lock screen settings from DB
  const lockscreenEnabled = useQuery(api.settings.get, { key: "lockscreenEnabled" });
  const lockscreenTimeoutVal = useQuery(api.settings.get, { key: "lockscreenTimeout" });
  const lockTimeout = typeof lockscreenTimeoutVal === "number" ? lockscreenTimeoutVal : 10;

  // ── اعمال رنگ‌های ذخیره‌شده هنگام بارگذاری ──
  const customTopbar = useQuery(api.settings.get, { key: "customTopbar" });
  const customSubnav = useQuery(api.settings.get, { key: "customSubnav" });
  const customBreadcrumb = useQuery(api.settings.get, { key: "customBreadcrumb" });
  const modalOpacity = useQuery(api.settings.get, { key: "modalOpacity" });
  const cardOpacity = useQuery(api.settings.get, { key: "cardOpacity" });
  const glassEffect = useQuery(api.settings.get, { key: "glassEffect" });

  // اعمال تم سایدبار و رنگ‌های ذخیره‌شده هنگام بارگذاری
  useEffect(() => {
    applySidebarTheme(getCurrentSidebarTheme());

    const root = document.documentElement;
    if (customTopbar) root.style.setProperty("--topbar-bg", String(customTopbar));
    if (customSubnav) root.style.setProperty("--subnav-bg", String(customSubnav));
    if (customBreadcrumb) root.style.setProperty("--breadcrumb-bg", String(customBreadcrumb));
    if (modalOpacity) root.style.setProperty("--modal-opacity", String(modalOpacity) + "%");
    if (cardOpacity) root.style.setProperty("--card-opacity", String(cardOpacity) + "%");
    if (glassEffect) root.style.setProperty("--glass-blur", "12px");
  }, [customTopbar, customSubnav, customBreadcrumb, modalOpacity, cardOpacity, glassEffect]);

  // Track user activity
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach((e) => document.addEventListener(e, handleActivity, { passive: true }));
    return () => events.forEach((e) => document.removeEventListener(e, handleActivity));
  }, []);

  // Check for idle timeout
  useEffect(() => {
    if (lockscreenEnabled === false) return;
    const timer = setInterval(() => {
      const elapsed = (Date.now() - lastActivityRef.current) / (1000 * 60);
      if (elapsed >= lockTimeout && !isLocked) {
        setIsLocked(true);
      }
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isLocked, lockTimeout, lockscreenEnabled]);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
    lastActivityRef.current = Date.now();
  }, []);

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} lockTimeout={lockTimeout} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <SubNav />
        <div className="border-b px-6 bg-background/80">
          <Breadcrumb />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
