"use client";

import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  TrendingUp,
  Shield,
  Search,
  Users,
  Eye,
  MousePointer,
  Clock,
  Loader2,
  Hash,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Activity,
  Link as LinkIcon,
  Award,
  MonitorPlay,
  Share2,
  ExternalLink,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { WebsiteTrafficChart } from "./WebsiteTrafficChart";
import { useWebsiteStore } from "@/store/websiteStore";
import { useCompaniesStore } from "@/store/companiesStore";
import { DemoDataWrapper } from "@/components/ui/DemoDataWrapper";
import { format } from "date-fns";

interface WebsiteTabProps {
  companySlug: string;
}

// Mock data - replace with actual API calls
const websiteAnalyticsData = {
  overview: {
    totalTraffic: 12500000,
    trustScore: 87,
    bounceRate: 42.5,
    avgSessionDuration: "3:24",
    pageViews: 45600000,
    uniqueVisitors: 8900000,
  },
  topKeywords: [
    { keyword: "coffee near me", position: 2, volume: 245000, difficulty: 78 },
    {
      keyword: "best coffee shop",
      position: 4,
      volume: 189000,
      difficulty: 72,
    },
    { keyword: "coffee delivery", position: 3, volume: 156000, difficulty: 65 },
    {
      keyword: "specialty coffee",
      position: 5,
      volume: 134000,
      difficulty: 68,
    },
    {
      keyword: "coffee beans online",
      position: 7,
      volume: 98000,
      difficulty: 61,
    },
    { keyword: "cold brew coffee", position: 6, volume: 87000, difficulty: 59 },
    {
      keyword: "coffee subscription",
      position: 8,
      volume: 76000,
      difficulty: 64,
    },
    { keyword: "organic coffee", position: 9, volume: 65000, difficulty: 57 },
  ],
  trafficSources: [
    { source: "Organic Search", visitors: 5200000, percentage: 41.6 },
    { source: "Direct", visitors: 3100000, percentage: 24.8 },
    { source: "Social Media", visitors: 2400000, percentage: 19.2 },
    { source: "Referral", visitors: 1200000, percentage: 9.6 },
    { source: "Paid Search", visitors: 600000, percentage: 4.8 },
  ],
  trafficTrend: [
    { month: "Jan", visitors: 11200000, pageViews: 42500000, bounceRate: 45 },
    { month: "Feb", visitors: 9800000, pageViews: 38200000, bounceRate: 44 },
    { month: "Mar", visitors: 12800000, pageViews: 46800000, bounceRate: 43 },
    { month: "Apr", visitors: 10500000, pageViews: 40200000, bounceRate: 43 },
    { month: "May", visitors: 13500000, pageViews: 48500000, bounceRate: 42.5 },
    { month: "Jun", visitors: 12200000, pageViews: 44600000, bounceRate: 42.5 },
  ],
  topPages: [
    { page: "/menu", views: 4500000, avgTime: "4:12", bounceRate: 38 },
    { page: "/locations", views: 3200000, avgTime: "2:45", bounceRate: 42 },
    { page: "/order-online", views: 2800000, avgTime: "5:30", bounceRate: 35 },
    { page: "/rewards", views: 2100000, avgTime: "3:18", bounceRate: 40 },
    { page: "/about", views: 1800000, avgTime: "2:55", bounceRate: 45 },
  ],
};

const COLORS = [
  "#64b5f6",
  "#81c784",
  "#ffb74d",
  "#e57373",
  "#ba68c8",
  "#4dd0e1",
  "#f06292",
  "#aed581",
  "#ff8a65",
  "#7986cb",
];

export default function WebsiteTab({ companySlug }: WebsiteTabProps) {
  const {
    keywordSuggestions,
    keywordSuggestionsLoading,
    fetchKeywordSuggestions,
    wordCountData,
    wordCountLoading,
    fetchWordCountData,
    seoData,
    seoDataLoading,
    fetchSeoData,
    clearWebsiteData,
  } = useWebsiteStore();

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

    fetchKeywordSuggestions(domain);
    fetchWordCountData(domain);
    fetchSeoData(domain);

    return () => {
      clearWebsiteData();
    };
  }, [
    companySlug,
    companies,
    fetchKeywordSuggestions,
    fetchWordCountData,
    fetchSeoData,
    clearWebsiteData,
  ]);

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatSeconds = (seconds: number | null | undefined) => {
    if (seconds === null || seconds === undefined) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrustScoreBg = (score: number) => {
    if (score >= 80) return "from-green-500/10 via-card to-card";
    if (score >= 60) return "from-yellow-500/10 via-card to-card";
    return "from-red-500/10 via-card to-card";
  };

  const trafficSourcesData = useMemo(() => {
    if (!seoData?.traffic_sources) return [];
    return seoData.traffic_sources
      .map((ts) => ({
        name: ts.source
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: ts.value,
        share: (ts.share * 100).toFixed(1),
      }))
      .sort((a, b) => b.value - a.value);
  }, [seoData]);

  const searchTrafficData = useMemo(() => {
    if (!seoData?.traffic_trend?.search_traffic_history) return [];
    return [...seoData.traffic_trend.search_traffic_history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        ...item,
        dateFormatted: format(new Date(item.date), "MMM yyyy"),
      }));
  }, [seoData]);

  const visitsData = useMemo(() => {
    if (!seoData?.traffic_trend?.visits_history) return [];
    return [...seoData.traffic_trend.visits_history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        ...item,
        dateFormatted: format(new Date(item.date), "MMM yyyy"),
      }));
  }, [seoData]);

  return (
    <div className="space-y-6">
          <div className="flex items-center justify-between mt-8">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent w-fit">
            Website & SEO Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive traffic, engagement, and visibility metrics
          </p>
        </div>
        {seoDataLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}
      </div>

      {seoDataLoading && !seoData ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : seoData ? (
        <>
          {/* SEO Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Traffic
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-foreground">
                  {formatNumber(seoData.website_overview?.total_traffic || 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Monthly visits
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-cyan-500/10 via-card to-card shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/20">
                    <Award className="h-5 w-5 text-cyan-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Domain Authority
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-cyan-600">
                  {seoData.seo_performance?.domain_authority || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  SEO strength score
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-purple-500/10 via-card to-card shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/20">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Avg. Session
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-purple-600">
                  {formatSeconds(seoData.website_overview?.avg_session_seconds || 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Time spent on site
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-orange-500/10 via-card to-card shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/20">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Bounce Rate
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-orange-600">
                  {seoData.website_overview?.bounce_rate
                    ? `${(seoData.website_overview.bounce_rate * 100).toFixed(1)}%`
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Single-page visits
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visits History Chart */}
            <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Visits Trend
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Monthly traffic over time
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visitsData}>
                      <defs>
                        <linearGradient
                          id="colorVisits"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#818cf8"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#818cf8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.2}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="dateFormatted"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatNumber(val)}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                        }}
                        formatter={(val: number) => [
                          val.toLocaleString(),
                          "Visits",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#818cf8"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorVisits)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources Pie Chart */}
            <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-cyan-500" />
                  Traffic Sources
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Distribution by channel
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSourcesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {trafficSourcesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                          color: "hsl(var(--foreground))",
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(val: number, name: string, props: any) => [
                          `${val.toLocaleString()} (${props.payload.share}%)`,
                          name,
                        ]}
                      />
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Search Traffic History */}
            <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Search className="h-5 w-5 text-purple-500" />
                  Search Traffic History
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Organic vs Paid search traffic
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={searchTrafficData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.2}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="dateFormatted"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => formatNumber(val)}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="organic_traffic"
                        name="Organic"
                        stackId="a"
                        fill="#6366f1"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar
                        dataKey="paid_traffic"
                        name="Paid"
                        stackId="a"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* SEO Performance Metrics */}
            <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-amber-500" />
                  SEO KPIs
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Technical SEO health summary
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-accent/5 border border-border/40 hover:bg-accent/10 transition-colors">
                    <div className="text-sm text-muted-foreground mb-1">
                      Backlinks
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(seoData.seo_performance?.backlinks || 0)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-border/40 hover:bg-accent/10 transition-colors">
                    <div className="text-sm text-muted-foreground mb-1">
                      Ref. Domains
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(seoData.seo_performance?.referring_domains || 0)}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-border/40 hover:bg-accent/10 transition-colors">
                    <div className="text-sm text-muted-foreground mb-1">
                      Org. Keywords
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(
                        seoData.seo_performance?.organic_keywords_count || 0,
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-border/40 hover:bg-accent/10 transition-colors">
                    <div className="text-sm text-muted-foreground mb-1">
                      Indexed Pages
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatNumber(seoData.seo_performance?.indexed_pages || 0)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-linear-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-emerald-600" />
                    <div>
                      <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Trust Score
                      </div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                        {seoData.website_overview?.trust_score || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Ranking Keywords from SEO */}
            <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Top Ranking Keywords</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Keywords driving the most engagement
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seoData.keyword_suggestions?.slice(0, 5).map((kw, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span className="font-medium">{kw.keyword}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex flex-col items-end">
                          <span className="text-muted-foreground text-xs">
                            Vol
                          </span>
                          <span className="font-semibold">
                            {formatNumber(kw.search_volume)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end w-16">
                          <span className="text-muted-foreground text-xs">
                            Share
                          </span>
                          <span className="font-semibold text-primary">
                            {(kw.traffic_share * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!seoData.keyword_suggestions ||
                    seoData.keyword_suggestions.length === 0) && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No keywords found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Pages from SEO */}
            <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Top Performing Pages</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Most visited pages by traffic share
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seoData.top_performing_pages
                    ?.slice(0, 5)
                    .map((page, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors gap-2"
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          <MonitorPlay className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span
                            className="font-medium truncate text-sm"
                            title={page.page}
                          >
                            {page.page || "/"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm shrink-0">
                          <div className="font-semibold">
                            {formatNumber(page.views)}{" "}
                            <span className="text-muted-foreground font-normal text-xs ml-1">
                              views
                            </span>
                          </div>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-6 w-6"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  {(!seoData.top_performing_pages ||
                    seoData.top_performing_pages.length === 0) && (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      No top pages found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Globe className="h-12 w-12 mb-4 opacity-20" />
          <p>No SEO data available for this company.</p>
        </div>
      )}
      <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/20">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Keyword Suggestions</CardTitle>
              <p className="text-sm text-muted-foreground">
                {keywordSuggestions.length > 0
                  ? `${keywordSuggestions.length} keyword suggestions from search data`
                  : "Highest ranking keywords driving organic traffic"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {keywordSuggestionsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : keywordSuggestions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Rank
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Keyword Suggestion
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Word Count
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Length
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keywordSuggestions.map((keyword) => (
                    <tr
                      key={keyword.rank}
                      className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                          #{keyword.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">
                            {keyword.suggestion}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-foreground font-semibold text-sm">
                          {keyword.word_count} words
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-muted-foreground">
                        {keyword.length} chars
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Fallback to mock data
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Keyword
                    </th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Position
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Search Volume
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Difficulty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {websiteAnalyticsData.topKeywords.map((keyword, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <span className="font-semibold text-foreground">
                            {keyword.keyword}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 font-semibold text-sm">
                          <TrendingUp className="h-3 w-3" />#{keyword.position}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-foreground">
                        {formatNumber(keyword.volume)}/mo
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-border/40 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                keyword.difficulty >= 70
                                  ? "bg-red-500"
                                  : keyword.difficulty >= 50
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                              style={{ width: `${keyword.difficulty}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground w-8">
                            {keyword.difficulty}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Pages */}
      {/* <DemoDataWrapper>
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Top Performing Pages</CardTitle>
            <p className="text-sm text-muted-foreground">
              Most visited pages and their performance metrics
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Page
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Views
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Avg. Time
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Bounce Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {websiteAnalyticsData.topPages.map((page, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <span className="font-semibold text-foreground font-mono text-sm">
                            {page.page}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-foreground">
                        {formatNumber(page.views)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-foreground">
                        {page.avgTime}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`font-semibold ${
                            page.bounceRate < 40
                              ? "text-green-600"
                              : page.bounceRate < 50
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {page.bounceRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </DemoDataWrapper> */}

      {/* Word Frequency by Sentiment */}
      <div>
        <div className="flex items-center gap-3 mt-8 mb-4">
          <Hash className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">
            Word Frequency Analysis
          </h2>
          {wordCountLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground ml-2" />
          )}
        </div>

        {wordCountData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Positive Words */}
            <Card className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-card to-card shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-cyan-600" />
                  <CardTitle className="text-lg text-cyan-600">
                    Positive Keywords
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Most frequent positive words
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wordCountData.positive.slice(0, 10).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground bg-accent/10 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-foreground">
                          {item.word}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-cyan-600">
                        {formatNumber(item.count)}
                      </span>
                    </div>
                  ))}
                  {wordCountData.positive.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No positive words found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Neutral Words */}
            <Card className="rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-card to-card shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Minus className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg text-purple-600">
                    Neutral Keywords
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Most frequent neutral words
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wordCountData.neutral.slice(0, 10).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground bg-accent/10 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-foreground">
                          {item.word}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {formatNumber(item.count)}
                      </span>
                    </div>
                  ))}
                  {wordCountData.neutral.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No neutral words found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Negative Words */}
            <Card className="rounded-3xl border border-slate-500/20 bg-gradient-to-br from-slate-500/5 via-card to-card shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-5 w-5 text-slate-600" />
                  <CardTitle className="text-lg text-slate-600">
                    Negative Keywords
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Most frequent negative words
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wordCountData.negative.slice(0, 10).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-accent/5 hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground bg-accent/10 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-foreground">
                          {item.word}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-600">
                        {formatNumber(item.count)}
                      </span>
                    </div>
                  ))}
                  {wordCountData.negative.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No negative words found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !wordCountLoading ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No word count analysis available for this domain yet.
          </div>
        ) : null}
      </div>

  
    </div>
  );
}
