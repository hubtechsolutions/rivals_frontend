"use client";

import {
  LogOut,
  MoveUpRight,
  Settings,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/store/authStore";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

interface Profile01Props {
  name?: string;
  role?: string;
  subscription?: string;
}

const defaultProfile = {
  name: "User",
  role: "Member",
  subscription: "Free Trial",
};

// Avatar fallback component that shows initials
function AvatarFallback({ name }: { name?: string }) {
  const initial = name ? name.charAt(0).toUpperCase() : <User className="w-6 h-6" />

  return (
    <div className="w-[72px] h-[72px] rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-semibold ring-4 ring-background">
      {initial}
    </div>
  )
}

export default function Profile01({
  name = defaultProfile.name,
  role = defaultProfile.role,
  subscription = defaultProfile.subscription,
}: Profile01Props = defaultProfile) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout: storeLogout } = useAuthStore();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        // If no token, just clear storage and redirect
        storeLogout();
        router.push("/login");
        return;
      }

      // Use API client for logout
      const response = await apiClient.post<{ message: string }>("/api/auth/logout");

      if (!response.error) {
        toast.success(response.data?.message || "Logged out successfully");
      } else {
        // Even if API call fails, clear local storage
        toast.error("Error during logout, but you have been signed out locally");
      }

      // Consistent logout via store (this clears localStorage/cookies as well)
      storeLogout();

      // Redirect to login page
      router.push("/login");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(errorMessage || "An error occurred during logout");
      console.error("Logout error:", error);

      // Still clear via store and redirect even on error
      storeLogout();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      label: "Subscription",
      value: subscription,
      href: "#",
      icon: <CreditCard className="w-4 h-4" />,
      external: false,
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="w-4 h-4" />,
      external: true,
    },
  ];

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className="relative px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative shrink-0">
              <AvatarFallback name={name} />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{name}</h2>
              <p className="text-muted-foreground">{role}</p>
            </div>
          </div>
          <div className="h-px bg-border my-6" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2 
                                    hover:bg-accent 
                                    rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-foreground">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center">
                  {item.value && (
                    <span className="text-sm text-muted-foreground mr-2">
                      {item.value}
                    </span>
                  )}
                  {item.external && <MoveUpRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between p-2 
                                hover:bg-accent 
                                rounded-lg transition-colors duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-foreground">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
