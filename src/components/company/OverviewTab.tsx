"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Users,
  TrendingUp,
  DollarSign,
  Briefcase,
  Activity,
  Loader2,
  AlertCircle,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  LayoutGrid,
} from "lucide-react";
import { ClippedAreaChart } from "./ClippedAreaChart";

import { cn } from "@/lib/utils";
import { useCompanyDataStore } from "@/store/companyDataStore";
import { useCompaniesStore } from "@/store/companiesStore";
import { useFundraisingStore } from "@/store/fundraisingStore";
import { useRevenueStore } from "@/store/revenueStore";
import { usePickleballPricingStore } from "@/store/pickleballPricingStore";
import type { PickleballPricingPayload } from "@/store/pickleballPricingStore";
import { DemoDataWrapper } from "@/components/ui/DemoDataWrapper";

interface OverviewTabProps {
  companySlug: string;
  themeGradient?: string;
}

// ─── Pickleball: helper to format a price range ───────────────────────────────
function formatPriceRange(
  min: number | null,
  max: number | null,
  currency: string,
): string | null {
  if (min == null && max == null) return null;
  const sym = currency === "USD" ? "$" : currency;
  if (min != null && max != null && min !== max)
    return `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()}`;
  const val = min ?? max;
  return `${sym}${val!.toLocaleString()}`;
}

// ─── Pricing box (one category) ───────────────────────────────────────────────
function PricingBox({
  label,
  icon,
  min,
  max,
  currency,
  notes,
  accentClass,
  iconBgClass,
}: {
  label: string;
  icon: React.ReactNode;
  min: number | null;
  max: number | null;
  currency: string;
  notes: string;
  accentClass: string;
  iconBgClass: string;
}) {
  const formatted = formatPriceRange(min, max, currency);
  if (!formatted && !notes) return null;
  return (
    <div
      className={`relative rounded-2xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border ${accentClass}`}
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl border ${iconBgClass}`}>{icon}</div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
        </div>
        {formatted ? (
          <p className="text-2xl font-bold text-foreground mb-2 tracking-tight">
            {formatted}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground mb-2">See notes</p>
        )}
        {notes && (
          <p className="text-xs text-muted-foreground/80 leading-relaxed">{notes}</p>
        )}
      </div>
    </div>
  );
}

// ─── Facility card ────────────────────────────────────────────────────────────
function FacilityCard({ facility }: { facility: PickleballPricingPayload["facilities"][number] }) {
  const { pricing } = facility;
  const boxes = [
    {
      label: "Hourly / Court",
      icon: <DollarSign className="h-4 w-4 text-violet-500" />,
      ...pricing.hourly_price,
      accentClass: "bg-violet-500/5 hover:bg-violet-500/10",
      iconBgClass: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Open Play",
      icon: <Users className="h-4 w-4 text-sky-500" />,
      ...pricing.open_play,
      accentClass: "bg-sky-500/5 hover:bg-sky-500/10",
      iconBgClass: "bg-sky-500/10 border-sky-500/20",
    },
    {
      label: "Membership",
      icon: <Activity className="h-4 w-4 text-emerald-500" />,
      ...pricing.membership,
      accentClass: "bg-emerald-500/5 hover:bg-emerald-500/10",
      iconBgClass: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: <Tag className="h-4 w-4 text-amber-500" />,
      ...pricing.extra_fee,
      label: pricing.extra_fee.label || "Extra Fee",
      accentClass: "bg-amber-500/5 hover:bg-amber-500/10",
      iconBgClass: "bg-amber-500/10 border-amber-500/20",
    },
  ];
  const hasAny = boxes.some((b) => b.min != null || b.max != null || b.notes);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 overflow-hidden">
      {/* coloured top bar */}
      <div className="h-1 w-full bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500" />
      <div className="p-5">
        {/* Facility header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 shrink-0">
              <Building2 className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{facility.name}</p>
              <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="text-xs">{facility.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {facility.courts_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <LayoutGrid className="h-3 w-3" />
                {facility.courts_count} Courts
              </span>
            )}
            <a
              href={facility.facility_website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              Visit
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Pricing boxes grid */}
        {hasAny ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {boxes.map((b) => (
              <PricingBox key={b.label} {...b} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pricing information available.
          </p>
        )}

        {facility.source_url && (
          <div className="flex justify-end mt-3 pt-3 border-t border-border/40">
            <a
              href={facility.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing source <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function PickleballPricingSection({
  payload,
  generatedAt,
}: {
  payload: PickleballPricingPayload;
  generatedAt: string;
}) {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <Activity className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-xl">Pickleball Facility Pricing</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {payload.region} · {payload.as_of_date_utc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {payload.confidence_level && (
              <div className="flex items-center gap-2 bg-accent/30 px-3 py-1.5 rounded-full border border-border/50">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium">{payload.confidence_level}% Confidence</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-accent/20 px-3 py-1.5 rounded-full border border-border/50">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">
                {payload.facilities.length} {payload.facilities.length === 1 ? "Facility" : "Facilities"}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {payload.facilities.map((facility, i) => (
          <FacilityCard key={`${facility.name}-${i}`} facility={facility} />
        ))}
        <p className="text-[11px] text-muted-foreground/50 text-center pt-2">
          Last generated: {new Date(generatedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

const getFallbackData = () => ({
  hiring: {
    activeJobs: 342,
    recentHires: 1240,
    growthRate: 15.3,
    topRoles: ["Barista", "Store Manager", "Software Engineer"],
  },
});

export default function OverviewTab({
  companySlug,
  themeGradient,
}: OverviewTabProps) {
  const { companyData, isLoading, error, fetchCompanyData, clearCompanyData } =
    useCompanyDataStore();
  const { companies } = useCompaniesStore();
  const {
    fundraisingData,
    isLoading: isFundraisingLoading,
    error: fundraisingError,
    fetchFundraising,
    clearFundraising,
  } = useFundraisingStore();
  const {
    revenueData,
    isLoading: isRevenueLoading,
    error: revenueError,
    fetchRevenue,
    clearRevenue,
  } = useRevenueStore();
  const {
    pricingData: pickleballData,
    isLoading: isPickleballLoading,
    fetchPickleballPricing,
    clearPickleballPricing,
  } = usePickleballPricingStore();
  const fallbackData = getFallbackData();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllRounds, setShowAllRounds] = useState(false);

  useEffect(() => {
    const matchingCompany = companies.find(
      (c) =>
        c.brand_name.toLowerCase().replace(/\s+/g, "-") ===
          companySlug.toLowerCase() ||
        c.domain.toLowerCase().includes(companySlug.toLowerCase()) ||
        companySlug.toLowerCase().includes(c.brand_name.toLowerCase()),
    );

    let domain: string;
    if (matchingCompany) {
      domain = matchingCompany.domain;
      fetchCompanyData(matchingCompany.domain, 1, matchingCompany.brand_name);
    } else {
      domain = `${companySlug.toLowerCase().replace(/-/g, "")}.com`;
      const name = companySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      fetchCompanyData(domain, 1, name);
    }

    // Fetch fundraising data
    fetchFundraising(domain);

    // Fetch revenue data
    // eslint-disable-next-line no-console
    console.log("[OverviewTab] Triggering fetchRevenue for:", domain);
    fetchRevenue(domain);

    // Fetch pickleball pricing
    fetchPickleballPricing(domain);

    return () => {
      clearCompanyData();
      clearFundraising();
      clearRevenue();
      clearPickleballPricing();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug, companies]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-destructive font-medium">
            Failed to load company data
          </p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const displayData = {
    name:
      companyData?.company_name ||
      companySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    industry: companyData?.industry || "Not available",
    size: companyData?.size || "Not available",
    location: companyData?.headquarters || "Not available",
    description: companyData?.description || "No description available.",
    logoUrl: companyData?.logo_url || null,
    tradingStatus: companyData?.trading_status || "Unknown",
    overallScore: companyData?.score ? companyData.score / 10 : 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-accent/5 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {displayData.logoUrl ? (
                  <img
                    src={displayData.logoUrl}
                    alt={displayData.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "p-3 rounded-2xl bg-gradient-to-br",
                      themeGradient || "from-primary to-accent",
                    )}
                  >
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {displayData.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {displayData.industry}
                    </p>
                    {displayData.tradingStatus &&
                      displayData.tradingStatus !== "Unknown" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                          {displayData.tradingStatus}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p
                className={cn(
                  "text-sm text-foreground/90 leading-relaxed",
                  !isDescriptionExpanded && "line-clamp-2",
                )}
              >
                {displayData.description}
              </p>
              {displayData.description.length > 150 && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="text-sm text-primary hover:text-primary/80 font-medium mt-1 transition-colors"
                >
                  {isDescriptionExpanded ? "Show less" : "More"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-border/40">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Company Size
                  </p>
                  <p className="text-sm font-semibold">{displayData.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-border/40">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Headquarters
                  </p>
                  <p className="text-sm font-semibold">
                    {displayData.location}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "rounded-3xl border border-border/60 text-white shadow-xl relative overflow-hidden bg-gradient-to-br",
            themeGradient || "from-primary via-primary to-accent",
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_60%)]" />
          <CardHeader className="relative">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-white/80">
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-7xl font-bold mb-2">
                {displayData.overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-white/80">out of 10</div>
              <div className="mt-6 w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${displayData.overallScore * 10}%` }}
                />
              </div>
              <p className="text-xs text-white/70 mt-4 text-center">
                Based on market performance, sentiment, and growth metrics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Pickleball Pricing ─────────────────────────────────────────── */}
      {isPickleballLoading && (
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      )}
      {!isPickleballLoading &&
        pickleballData?.payload?.facilities?.length ? (
          <PickleballPricingSection
            payload={pickleballData.payload}
            generatedAt={pickleballData.generated_at}
          />
        ) : null}

      {/* Funding & Valuation - Live API Data */}
      <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-900/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                <DollarSign className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Financial Overview</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Funding history and valuation metrics
                </p>
              </div>
            </div>
            {fundraisingData?.confidence_level && (
              <div className="flex items-center gap-2 bg-accent/30 px-3 py-1.5 rounded-full border border-border/50">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">
                  {fundraisingData.confidence_level}% Confidence
                </span>
                <span className="text-[10px] text-muted-foreground border-l border-border/50 pl-2 ml-1">
                  Updated{" "}
                  {new Date(fundraisingData.as_of_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isFundraisingLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Loader2 className="relative h-10 w-10 text-primary animate-spin" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Gathering financial data...
              </p>
            </div>
          ) : fundraisingError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Data Unavailable</p>
                <p className="text-sm text-muted-foreground">
                  Could not load fundraising information.
                </p>
              </div>
            </div>
          ) : fundraisingData ? (
            <div className="space-y-8">
              {/* Primary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Valuation - Featured */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="h-16 w-16 text-primary rotate-12" />
                  </div>
                  <p className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">
                    Est. Valuation
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-foreground tracking-tight">
                      {fundraisingData.summary.valuation || "—"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Latest post-money valuation
                  </p>
                </div>

                {/* Total Funding */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign className="h-16 w-16 text-indigo-500 -rotate-12" />
                  </div>
                  <p className="text-sm font-medium text-indigo-500 mb-1 uppercase tracking-wider">
                    Total Funding
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-foreground tracking-tight">
                      {fundraisingData.summary.total_funding}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total capital raised to date
                  </p>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-accent/5 border border-border/50 hover:bg-accent/10 transition-colors">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Latest Round Size
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {fundraisingData.summary.latest_raised}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-accent/5 border border-border/50 hover:bg-accent/10 transition-colors">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Total Rounds
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {fundraisingData.summary.total_rounds}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-accent/5 border border-border/50 hover:bg-accent/10 transition-colors">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Last Deal Date
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {fundraisingData.summary.last_round}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-accent/5 border border-border/50 hover:bg-accent/10 transition-colors">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">
                    Lead Investor
                  </p>
                  <p
                    className="text-sm font-semibold text-foreground truncate"
                    title={fundraisingData.summary.lead_investor}
                  >
                    {fundraisingData.summary.lead_investor || "—"}
                  </p>
                </div>
              </div>

              {/* Funding Rounds Timeline */}
              {fundraisingData.rounds && fundraisingData.rounds.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Investment History
                    </h3>
                    {fundraisingData.rounds.length > 3 && (
                      <button
                        onClick={() => setShowAllRounds(!showAllRounds)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                      >
                        {showAllRounds
                          ? "Show Recent"
                          : `View All ${fundraisingData.rounds.length} Rounds`}
                        {showAllRounds ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="relative pl-2">
                    {/* Vertical line running through the timeline */}
                    <div className="absolute left-[19px] top-4 bottom-8 w-px bg-gradient-to-b from-border via-border to-transparent" />

                    <div className="space-y-6">
                      {(showAllRounds
                        ? fundraisingData.rounds
                        : fundraisingData.rounds.slice(0, 3)
                      ).map((round, index) => {
                        const roundDate = round.round_date
                          ? new Date(round.round_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "Date Unknown";

                        // Determine colors based on round type string for visual variety
                        const isIPO = round.round_type
                          .toLowerCase()
                          .includes("ipo");

                        return (
                          <div key={index} className="relative group">
                            <div className="flex gap-6">
                              {/* Timeline Node */}
                              <div className="relative pt-1">
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-sm z-10 relative transition-transform group-hover:scale-110 duration-200",
                                    index === 0
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-card text-muted-foreground border-border group-hover:border-primary/50 group-hover:text-primary",
                                  )}
                                >
                                  {isIPO ? (
                                    <TrendingUp className="h-5 w-5" />
                                  ) : (
                                    <DollarSign className="h-5 w-5" />
                                  )}
                                </div>
                              </div>

                              {/* Content Card */}
                              <div className="flex-1 min-w-0">
                                <div className="p-5 rounded-2xl bg-gradient-to-r from-accent/5 to-transparent border border-border/60 hover:border-primary/20 hover:from-accent/10 hover:shadow-md transition-all duration-300">
                                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                    <div>
                                      <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-base font-bold text-foreground">
                                          {round.round_type}
                                        </h4>
                                        {index === 0 && (
                                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                                            Latest
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {roundDate}
                                      </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                      <div className="text-lg font-bold text-foreground">
                                        {round.amount || "Undisclosed Amount"}
                                      </div>
                                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
                                        Raised
                                      </div>
                                    </div>
                                  </div>

                                  {round.investors &&
                                    round.investors.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-border/40">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                                          <Users className="h-3.5 w-3.5" />
                                          Key Investors
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {round.investors.map(
                                            (investor, i) => (
                                              <span
                                                key={i}
                                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-background border border-border/60 text-foreground/80 hover:border-primary/30 hover:text-primary transition-colors cursor-default"
                                              >
                                                {investor}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {round.source_url && (
                                    <div className="mt-3 flex justify-end">
                                      <a
                                        href={round.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group/link"
                                      >
                                        Source
                                        <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <DollarSign className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                No fundraising data available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <DemoDataWrapper>
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/20">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Hiring Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-border/40">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Active Jobs
                  </p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {fallbackData.hiring.activeJobs}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-border/40">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Recent Hires
                  </p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {fallbackData.hiring.recentHires.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-border/40">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Growth Rate
                  </p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {fallbackData.hiring.growthRate}%
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-border/40">
                <p className="text-xs text-muted-foreground font-medium mb-3">
                  Top Roles
                </p>
                <div className="space-y-1">
                  {fallbackData.hiring.topRoles.map((role, index) => (
                    <div
                      key={index}
                      className="text-xs font-medium text-foreground bg-background/50 px-2 py-1 rounded"
                    >
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DemoDataWrapper>

      <ClippedAreaChart
        quarters={revenueData?.quarters}
        summary={revenueData?.summary}
        symbol={revenueData?.symbol}
        isLoading={isRevenueLoading}
        error={revenueError}
      />
    </div>
  );
}
