/**
 * 🗺️ انتخاب موقعیت مکانی از روی نقشه
 * — استفاده از OpenStreetMap (رایگان، بدون API key)
 * — امکان جستجوی آدرس
 * — نمایش نقطه انتخابی با قابلیت Drag
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, X, Navigation } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number, address?: string) => void;
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const [lat, setLat] = useState(latitude || 35.6892);
  const [lng, setLng] = useState(longitude || 51.3890);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (mapReady || typeof window === "undefined") return;
    const L = (window as any).L;
    if (L) { initMap(L); return; }

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => initMap((window as any).L);
    document.head.appendChild(script);

    function initMap(L: any) {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([lat, lng], 13);
      L.control.zoom({ position: "bottomleft" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", (e: any) => {
        const pos = e.target.getLatLng();
        setLat(pos.lat); setLng(pos.lng);
        onChange(pos.lat, pos.lng);
      });
      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat); setLng(e.latlng.lng);
        onChange(e.latlng.lat, e.latlng.lng);
      });
      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ir&limit=5`, { headers: { "Accept-Language": "fa" } });
      setSearchResults(await res.json());
    } catch { toast.error("خطا در جستجوی آدرس."); }
    finally { setIsSearching(false); }
  }, [searchQuery]);

  const selectResult = (r: any) => {
    const nLat = parseFloat(r.lat), nLng = parseFloat(r.lon);
    setLat(nLat); setLng(nLng);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([nLat, nLng], 15);
      markerRef.current.setLatLng([nLat, nLng]);
    }
    setSearchResults([]); setSearchQuery(r.display_name || "");
    onChange(nLat, nLng, r.display_name);
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) { toast.error("موقعیت‌یابی پشتیبانی نمی‌شود."); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: myLat, longitude: myLng } = pos.coords;
        setLat(myLat); setLng(myLng);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([myLat, myLng], 15);
          markerRef.current.setLatLng([myLat, myLng]);
        }
        onChange(myLat, myLng);
        toast.success("موقعیت فعلی شما دریافت شد.");
      },
      () => toast.error("دسترسی به موقعیت رد شد.")
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="جستجوی آدرس..." className="clay-input h-10 w-full pr-9 pl-9 text-sm outline-none" />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button onClick={handleSearch} disabled={isSearching} className="clay-button px-4 h-10 text-sm">
          {isSearching ? "..." : "جستجو"}
        </button>
        <button onClick={handleMyLocation} className="clay-button px-4 h-10 text-sm flex items-center gap-1 bg-primary/10 text-primary">
          <Navigation className="h-4 w-4" /> مکان من
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="clay-card max-h-48 overflow-y-auto space-y-1 p-2">
          {searchResults.map((r, i) => (
            <button key={i} onClick={() => selectResult(r)} className="w-full text-right text-xs p-2 rounded-lg hover:bg-muted/50 transition-colors leading-relaxed">
              {r.display_name}
            </button>
          ))}
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden border" style={{ height: 300 }}>
        <div ref={mapRef} className="w-full h-full" />
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="animate-pulse text-muted-foreground text-sm">بارگذاری نقشه...</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> عرض: {lat.toFixed(6)}</span>
        <span>طول: {lng.toFixed(6)}</span>
      </div>
    </div>
  );
}
