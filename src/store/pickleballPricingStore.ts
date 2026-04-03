import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

// --- API response types ---

export interface PricingRange {
  min: number | null;
  max: number | null;
  currency: string;
  notes: string;
}

export interface ExtraFee {
  label: string;
  min: number | null;
  max: number | null;
  currency: string;
  notes: string;
}

export interface FacilityPricing {
  hourly_price: PricingRange;
  open_play: PricingRange;
  membership: PricingRange;
  extra_fee: ExtraFee;
}

export interface Facility {
  name: string;
  location: string;
  facility_website: string;
  google_maps_url: string;
  courts_count: number;
  pricing: FacilityPricing;
  source_url: string;
}

export interface PickleballPricingPayload {
  site_domain: string;
  category: string;
  region: string;
  as_of_date_utc: string;
  confidence_level: number;
  facilities: Facility[];
}

export interface PickleballPricingData {
  job_id: number;
  script_type: string;
  schema_version: string;
  generated_at: string;
  payload: PickleballPricingPayload;
}

export interface PickleballPricingRoot {
  job_id?: number;
  script_type?: string;
  domain?: string;
  data?: PickleballPricingData;
  payload?: PickleballPricingPayload;
  schema_version?: string;
  generated_at?: string;
}

// --- Store ---

interface PickleballPricingState {
  pricingData: PickleballPricingData | null;
  isLoading: boolean;
  error: string | null;
  currentDomain: string | null;
}

interface PickleballPricingActions {
  fetchPickleballPricing: (domain: string) => Promise<void>;
  clearPickleballPricing: () => void;
}

interface PickleballPricingStore
  extends PickleballPricingState,
    PickleballPricingActions {}

export const usePickleballPricingStore = create<PickleballPricingStore>(
  (set) => ({
    // State
    pricingData: null,
    isLoading: false,
    error: null,
    currentDomain: null,

    // Actions
    fetchPickleballPricing: async (domain: string) => {
      set({ isLoading: true, error: null, currentDomain: domain });

      const response = await apiClient.get<PickleballPricingRoot>(
        `/api/frontend/pickleball-pricing?domain=${encodeURIComponent(domain)}`,
      );

      if (response.error) {
        set({
          isLoading: false,
          error: response.error,
          pricingData: null,
        });
        return;
      }

      if (response.data) {
        // Handle deeply nested `data` object vs flattened object
        const extractedData = response.data.data
          ? response.data.data
          : (response.data as unknown as PickleballPricingData);

        set({
          pricingData: extractedData,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          isLoading: false,
          error: "No pickleball pricing data available",
          pricingData: null,
        });
      }
    },

    clearPickleballPricing: () => {
      set({
        pricingData: null,
        isLoading: false,
        error: null,
        currentDomain: null,
      });
    },
  }),
);
