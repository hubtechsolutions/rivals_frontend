"use client";

import {
  Building2,
  Settings,
  HelpCircle,
  Menu,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";

import { Home } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import AddCompetitorModal from "./AddCompetitorModal";
import DeleteCompetitorModal from "./DeleteCompetitorModal";
import { useCompaniesStore } from "@/store";

function NavItem({
  href,
  icon: Icon,
  children,
  pathname,
  onNavigate,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  pathname: string;
  onNavigate: () => void;
}) {
  const isActive =
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors relative ${isActive
        ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }`}
    >
      <Icon
        className={`h-4 w-4 mr-3 shrink-0 ${isActive ? "text-primary" : ""
          }`}
      />
      {children}
    </Link>
  );
}

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{ domain: string, id: number, brandName: string } | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  const { companies, isLoading, fetchCompanies, deleteCompany } = useCompaniesStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  function handleNavigation() {
    setIsMobileMenuOpen(false);
  }

  function getCompanySlug(brandName: string): string {
    return brandName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  function handleDeleteClick(e: React.MouseEvent, domain: string, id: number, brandName: string) {
    e.preventDefault();
    e.stopPropagation();
    setCompanyToDelete({ domain, id, brandName });
  }

  async function confirmDeleteCompany() {
    if (!companyToDelete) return;
    
    setIsDeleting(true);
    const result = await deleteCompany(companyToDelete.domain);
    setIsDeleting(false);

    if (result.success) {
      toast.success(result.message);
      
      const companySlug = getCompanySlug(companyToDelete.brandName);
      if (pathname.includes(`/dashboard/company/${companySlug}`)) {
        router.push("/dashboard");
      }
      setCompanyToDelete(null);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-70 p-2 rounded-lg bg-background shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-70 w-64 bg-background transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-border
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="h-16 px-6 flex items-center border-b border-border"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold hover:cursor-pointer text-foreground">
                Rivals
              </span>
            </div>
          </Link>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              <div>
                <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overview
                </div>
                <div className="space-y-1">
                  <NavItem
                    href="/dashboard"
                    icon={Home}
                    pathname={pathname}
                    onNavigate={handleNavigation}
                  >
                    Dashboard
                  </NavItem>
                </div>
              </div>

              <div>
                <div className="px-3 mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Competitors
                  </span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-1.5 rounded-md bg-linear-to-r from-purple-600 to-blue-600 text-white 
                      hover:from-purple-700 hover:to-blue-700 transition-all hover:scale-105 active:scale-95
                      shadow-sm hover:shadow-md cursor-pointer"
                    title="Add Competitor"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                      <p>No competitors yet.</p>
                      <p className="text-xs mt-1">Click + to add one!</p>
                    </div>
                  ) : (
                    companies.map((company) => (
                      <div key={company.id} className="relative group">
                        <NavItem
                          href={`/dashboard/company/${getCompanySlug(company.brand_name)}`}
                          icon={Building2}
                          pathname={pathname}
                          onNavigate={handleNavigation}
                        >
                          <span className="pr-6 truncate block">{company.brand_name}</span>
                        </NavItem>
                        <button
                          onClick={(e) => handleDeleteClick(e, company.domain, company.id, company.brand_name)}
                          disabled={isDeleting}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-[&:hover]:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md disabled:opacity-50"
                          title={`Delete ${company.brand_name}`}
                        >
                          {isDeleting && companyToDelete?.id === company.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t border-border">
            <div className="space-y-1">
              <NavItem
                href="/dashboard/settings"
                icon={Settings}
                pathname={pathname}
                onNavigate={handleNavigation}
              >
                Settings
              </NavItem>
              <NavItem
                href="/help"
                icon={HelpCircle}
                pathname={pathname}
                onNavigate={handleNavigation}
              >
                Help
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-65 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <AddCompetitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <DeleteCompetitorModal
        isOpen={!!companyToDelete}
        onClose={() => setCompanyToDelete(null)}
        onConfirm={confirmDeleteCompany}
        isLoading={isDeleting}
        brandName={companyToDelete?.brandName || ""}
      />
    </>
  );
}
