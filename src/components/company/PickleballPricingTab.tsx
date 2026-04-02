"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  ExternalLink,
  Building2,
  Activity,
  AlertCircle,
  Loader2,
  DollarSign,
  Users,
  Tag,
  LayoutGrid,
} from "lucide-react";
import { usePickleballPricingStore } from "@/store/pickleballPricingStore";
import { useCompaniesStore } from "@/store/companiesStore";
import type { Facility, PricingRange, ExtraFee } from "@/store/pickleballPricingStore";

interface PickleballPricingTabProps {
  companySlug: string;
}

// ─── Helper: format a currency range ───────────────────────────────────────────
function formatRange(
  min: number | null,
  max: number | null,
  currency: string,
): string | null {
  if (min == null && max == null) return null;
  const sym = currency === "USD" ? "$" : currency;
  if (min != null && max != null && min !== max) {
    return `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()}`;
  }
  const val = min ?? max;
  return `${sym}${val!.toLocaleString()}`;
}

// ─── Individual pricing box ────────────────────────────────────────────────────
interface PricingBoxProps {
  label: string;
  icon: React.ReactNode;
  range: PricingRange | ExtraFee;
  accentClass: string;
  iconBgClass: string;
}

function PricingBox({
  label,
  icon,
  range,
  accentClass,
  iconBgClass,
}: PricingBoxProps) {
  const formatted = formatRange(range.min, range.max, range.currency);
  // Hide the whole box if no numeric info and notes are empty
  if (!formatted && !range.notes) return null;

  return (
    <div
      className={`relative rounded-2xl border border-border/50 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-border ${accentClass}`}
    >
      {/* subtle shimmer */}
      <div className="absolute inset-0 bg-linear-to-br from-white/3 to-transparent pointer-events-none" />

      <div className="p-5 relative">
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
          <p className="text-sm italic text-muted-foreground mb-2">
            See notes below
          </p>
        )}

        {range.notes && (
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {range.notes}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Single facility card ──────────────────────────────────────────────────────
function FacilityCard({ facility }: { facility: Facility }) {
  const { pricing } = facility;

  const hourlyHasData =
    pricing.hourly_price.min != null ||
    pricing.hourly_price.max != null ||
    pricing.hourly_price.notes;
  const openPlayHasData =
    pricing.open_play.min != null ||
    pricing.open_play.max != null ||
    pricing.open_play.notes;
  const membershipHasData =
    pricing.membership.min != null ||
    pricing.membership.max != null ||
    pricing.membership.notes;
  const extraFeeHasData =
    pricing.extra_fee.min != null ||
    pricing.extra_fee.max != null ||
    pricing.extra_fee.notes;

  const hasAnyPricing =
    hourlyHasData || openPlayHasData || membershipHasData || extraFeeHasData;

  return (
    <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Card header strip */}
      <div className="h-1.5 w-full bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500" />

      <CardHeader className="pb-4 pt-5 px-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="p-3 rounded-2xl bg-linear-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 shrink-0">
              <Building2 className="h-6 w-6 text-violet-500" />
            </div>

            <div>
              <CardTitle className="text-xl font-bold">{facility.name}</CardTitle>
              <div className="flex items-center gap-1.5 mt-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="text-sm">{facility.location}</span>
              </div>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {facility.courts_count > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <LayoutGrid className="h-3.5 w-3.5" />
                {facility.courts_count} Courts
              </span>
            )}
            <a
              href={facility.facility_website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              Visit Site
              <ExternalLink className="h-3 w-3" />
            </a>
            {facility.google_maps_url && (
              <a
                href={facility.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-accent/30 border border-border/50 text-foreground/70 hover:bg-accent/50 transition-colors"
              >
                Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        {hasAnyPricing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {hourlyHasData && (
              <PricingBox
                label="Hourly / Court"
                icon={<DollarSign className="h-4 w-4 text-violet-500" />}
                range={pricing.hourly_price}
                accentClass="bg-violet-500/5 hover:bg-violet-500/10"
                iconBgClass="bg-violet-500/10 border-violet-500/20"
              />
            )}
            {openPlayHasData && (
              <PricingBox
                label="Open Play"
                icon={<Users className="h-4 w-4 text-sky-500" />}
                range={pricing.open_play}
                accentClass="bg-sky-500/5 hover:bg-sky-500/10"
                iconBgClass="bg-sky-500/10 border-sky-500/20"
              />
            )}
            {membershipHasData && (
              <PricingBox
                label="Membership"
                icon={<Activity className="h-4 w-4 text-emerald-500" />}
                range={pricing.membership}
                accentClass="bg-emerald-500/5 hover:bg-emerald-500/10"
                iconBgClass="bg-emerald-500/10 border-emerald-500/20"
              />
            )}
            {extraFeeHasData && (
              <PricingBox
                label={pricing.extra_fee.label || "Extra Fee"}
                icon={<Tag className="h-4 w-4 text-amber-500" />}
                range={pricing.extra_fee}
                accentClass="bg-amber-500/5 hover:bg-amber-500/10"
                iconBgClass="bg-amber-500/10 border-amber-500/20"
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              No pricing information available for this facility.
            </p>
          </div>
        )}

        {/* Source link */}
        {facility.source_url && (
          <div className="flex items-center justify-end mt-4 pt-4 border-t border-border/40">
            <a
              href={facility.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Pricing source
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────
export default function PickleballPricingTab({
  companySlug,
}: PickleballPricingTabProps) {
  const { pricingData, isLoading, error, fetchPickleballPricing, clearPickleballPricing } =
    usePickleballPricingStore();
  const { companies } = useCompaniesStore();

  useEffect(() => {
    const matchingCompany = companies.find(
      (c) =>
        c.brand_name.toLowerCase().replace(/\s+/g, "-") ===
          companySlug.toLowerCase() ||
        c.domain.toLowerCase().includes(companySlug.toLowerCase()) ||
        companySlug.toLowerCase().includes(c.brand_name.toLowerCase()),
    );

    const domain = matchingCompany
      ? matchingCompany.domain
      : `${companySlug.toLowerCase().replace(/-/g, "")}.com`;

    fetchPickleballPricing(domain);

    return () => {
      clearPickleballPricing();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySlug, companies]);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <Loader2 className="relative h-10 w-10 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Loading pickleball pricing data…
          </p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Data Unavailable</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── No data ── */
  if (!pricingData || !pricingData.payload?.facilities?.length) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No pickleball pricing data available for this account.
          </p>
        </div>
      </div>
    );
  }

  const { payload } = pricingData;

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Pickleball Facility Pricing
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {payload.region} · As of {payload.as_of_date_utc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {payload.confidence_level && (
            <div className="flex items-center gap-2 bg-accent/30 px-3 py-1.5 rounded-full border border-border/50">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {payload.confidence_level}% Confidence
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-accent/20 px-3 py-1.5 rounded-full border border-border/50">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">
              {payload.facilities.length}{" "}
              {payload.facilities.length === 1 ? "Facility" : "Facilities"}
            </span>
          </div>
        </div>
      </div>

      {/* Facility cards */}
      <div className="space-y-6">
        {payload.facilities.map((facility, index) => (
          <FacilityCard key={`${facility.name}-${index}`} facility={facility} />
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground/60 text-center pb-4">
        Pricing data is dynamically sourced and may vary. Last generated:{" "}
        {new Date(pricingData.generated_at).toLocaleString()}
      </p>
    </div>
  );
}
