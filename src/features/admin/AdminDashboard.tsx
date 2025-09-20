import React, { useEffect, useMemo, useState } from "react";
import axios from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import {
  Sun, Cloud, CloudRain, Snowflake, ThermometerSun, MapPin
} from "lucide-react";

/** Types coming from your backend */
type OverviewMetrics = {
  totalVisitors: number;
  onlineVisitors: number;
  totalCompanies: number;
  totalEmployees: number;
};

type GeoInfo = {
  country: string;   // e.g. "Türkiye"
  city?: string;     // optional
  lat?: number;
  lon?: number;
};

type WeatherInfo = {
  tempC: number;        // rounded °C
  condition: string;    // "Clear", "Clouds", "Rain", "Snow", ...
  locationLabel: string; // "İstanbul, Türkiye"
};

function MetricCard({ title, value, hint }: { title: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

function WeatherCard({ weather, loading }: { weather: WeatherInfo | null; loading: boolean }) {
  const Icon = useMemo(() => {
    const c = (weather?.condition || "").toLowerCase();
    if (c.includes("snow")) return Snowflake;
    if (c.includes("rain") || c.includes("drizzle")) return CloudRain;
    if (c.includes("cloud")) return Cloud;
    return Sun;
  }, [weather?.condition]);

  return (
    <div className="rounded-2xl border bg-white p-6 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ThermometerSun className="h-4 w-4" />
          <span>Today</span>
        </div>
        {weather?.locationLabel && (
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            <span>{weather.locationLabel}</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="rounded-xl bg-indigo-50 p-4">
          <Icon className="h-10 w-10 text-indigo-600" />
        </div>
        <div>
          <div className="text-4xl font-bold">
            {loading ? "—" : `${weather?.tempC ?? "—"}°C`}
          </div>
          <div className="text-sm text-slate-500 capitalize">
            {loading ? "Loading..." : weather?.condition || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper: format big numbers
  const nf = useMemo(() => new Intl.NumberFormat(), []);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        // 1) Overview metrics (adjust endpoints to your backend)
        const metricsRes = await axios
          .get<OverviewMetrics>("/admin/metrics/overview")
          .catch(() => ({
            // graceful fallback data if API is not ready
            data: {
              totalVisitors: 61344,
              onlineVisitors: 4006,
              totalCompanies: 128,
              totalEmployees: 47033,
            } as OverviewMetrics,
          }));
        if (!alive) return;
        setMetrics(metricsRes.data);

        // 2) Location of the admin (country/city). Replace with what you have.
        const geoRes = await axios
          .get<GeoInfo>("/utils/my-location")
          .catch(() => ({ data: { country: "Türkiye", city: "İstanbul" } as GeoInfo }));
        const geo = geoRes.data;

        // 3) Weather (prefer asking your backend, not the browser, to hide keys)
        const weatherRes = await axios
          .get<{ tempC: number; condition: string }>("/utils/weather", {
            params: geo.lat && geo.lon ? { lat: geo.lat, lon: geo.lon } : { q: `${geo.city ?? ""},${geo.country}` },
          })
          .catch(() => ({ data: { tempC: 31, condition: "Clear" } }));
        if (!alive) return;

        setWeather({
          tempC: Math.round(weatherRes.data.tempC),
          condition: weatherRes.data.condition,
          locationLabel: [geo.city, geo.country].filter(Boolean).join(", "),
        });
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Title bar – for admin, avoid personal name */}
      

      {/* Layout similar to your reference: weather big on the left, four small cards on the right */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Weather (2 columns on large screens) */}
        <div className="lg:col-span-2">
          <WeatherCard weather={weather} loading={loading} />
        </div>

        {/* 4 metrics (2x2 grid) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MetricCard
            title="Total Visitors"
            value={metrics ? nf.format(metrics.totalVisitors) : "—"}
            hint="Last 30 days"
          />
          <MetricCard
            title="Online Visitors"
            value={metrics ? nf.format(metrics.onlineVisitors) : "—"}
            hint="Live right now"
          />
          <MetricCard
            title="Total Companies"
            value={metrics ? nf.format(metrics.totalCompanies) : "—"}
          />
          <MetricCard
            title="Total Employees"
            value={metrics ? nf.format(metrics.totalEmployees) : "—"}
          />
        </div>
      </div>
    </div>
  );
}
