import { toast } from "sonner";

const API_BASE_URL = "https://api.rivalis.ai";

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const tokenType =
      typeof window !== "undefined"
        ? localStorage.getItem("token_type")
        : "Bearer";

    if (token) {
      return {
        Authorization: `${tokenType || "Bearer"} ${token}`,
      };
    }

    return {};
  }

  private handleUnauthorized(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
      // Also clear the auth cookie used by middleware
      document.cookie =
        "auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
    }
  }

  async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = true, headers = {}, ...restConfig } = config;

    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
      ...(requiresAuth ? this.getAuthHeaders() : {}),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...restConfig,
        headers: requestHeaders,
      });

      if (response.status === 401) {
        if (requiresAuth) {
          this.handleUnauthorized();
        }
        const errorData = await response.json().catch(() => ({}));
        return {
          data: null,
          error: errorData.message || errorData.detail || "Invalid credentials",
          status: 401,
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            const errorMessages = errorData.detail
              .map((err: { msg: string }) => err.msg)
              .join(", ");
            return {
              data: null,
              error: errorMessages || "Validation error",
              status: response.status,
            };
          }
        }

        let parsedError = errorData.message || errorData.detail;
        if (typeof parsedError === "object" && parsedError !== null) {
          parsedError =
            parsedError.error ||
            parsedError.message ||
            JSON.stringify(parsedError);
        }

        return {
          data: null,
          error:
            typeof parsedError === "string"
              ? parsedError
              : `Request failed with status ${response.status}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        error: null,
        status: response.status,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error";
      return {
        data: null,
        error: errorMessage,
        status: 0,
      };
    }
  }

  async get<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export type { ApiResponse, RequestConfig };
