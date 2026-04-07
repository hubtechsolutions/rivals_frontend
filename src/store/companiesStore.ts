import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

// Types based on API response
export interface Company {
  id: number;
  user_id: number;
  domain: string;
  brand_name: string;
  color_info: string;
  is_active: boolean;
  is_favorite: boolean;
  last_scraped_at: string | null;
  total_scrapes: number;
  created_at: string;
  updated_at: string;
}

interface CompanyListResponse {
  status: string;
  message: string;
  companies: Company[];
  total_count: number;
}

interface CompaniesState {
  companies: Company[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface CompaniesActions {
  fetchCompanies: (includeInactive?: boolean) => Promise<void>;
  addCompanyToList: (company: Company) => void;
  removeCompanyFromList: (companyId: number) => void;
  deleteCompany: (domain: string) => Promise<{ success: boolean; message: string }>;
  clearCompanies: () => void;
}

interface CompaniesStore extends CompaniesState, CompaniesActions {}

export const useCompaniesStore = create<CompaniesStore>((set, get) => ({
  // State
  companies: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  // Actions
  fetchCompanies: async (includeInactive = false) => {
    set({ isLoading: true, error: null });

    const queryParam = includeInactive ? "?include_inactive=true" : "";
    const response = await apiClient.get<CompanyListResponse>(
      `/api/frontend/companies${queryParam}`
    );

    if (response.error) {
      set({
        isLoading: false,
        error: response.error,
      });
      return;
    }

    if (response.data) {
      set({
        companies: response.data.companies || [],
        totalCount: response.data.total_count || 0,
        isLoading: false,
        error: null,
        lastFetched: Date.now(),
      });
    }
  },

  addCompanyToList: (company: Company) => {
    const { companies } = get();
    set({
      companies: [company, ...companies],
      totalCount: get().totalCount + 1,
    });
  },

  removeCompanyFromList: (companyId: number) => {
    const { companies } = get();
    set({
      companies: companies.filter((c) => c.id !== companyId),
      totalCount: Math.max(0, get().totalCount - 1),
    });
  },

  deleteCompany: async (domain: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.delete<{ 
        success: boolean; 
        message: string; 
        deleted_counts: Record<string, number>;
      }>(`/api/company/${domain}`);

      if (response.error) {
        set({
          isLoading: false,
          error: response.error,
        });
        return { success: false, message: response.error };
      }

      // Automatically remove from local store on success
      const { companies } = get();
      set({
        companies: companies.filter((c) => c.domain !== domain),
        totalCount: Math.max(0, get().totalCount - 1),
        isLoading: false,
        error: null,
      });

      return { success: true, message: response.data?.message || "Company deleted successfully" };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to delete company";
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  clearCompanies: () => {
    set({
      companies: [],
      totalCount: 0,
      isLoading: false,
      error: null,
      lastFetched: null,
    });
  },
}));
