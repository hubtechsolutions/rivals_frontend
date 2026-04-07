"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  AlertCircle,
  Eye,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Heart,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SentimentDonutChart } from "./SentimentDonutChart";
import { useSocialMediaStore, SocialPost } from "@/store/socialMediaStore";
import { useCompaniesStore } from "@/store/companiesStore";

// Platform to job_id mapping for social posts API
const platformJobIdMap: Record<string, number> = {
  Instagram: 7,
  Twitter: 8,
  YouTube: 9,
  Facebook: 10,
  LinkedIn: 11,
};

interface SocialMediaSentimentTabProps {
  companySlug: string;
}

// Mock data
const socialMediaData = {
  overview: {
    totalFollowers: 12500000,
    engagementRate: 4.8,
    postReach: 8900000,
  },
  platforms: [
    {
      name: "Instagram",
      icon: Instagram,
      followers: 5200000,
      totalPosts: 1240,
      growth: 12.5,
      color: "hsl(330, 80%, 50%)",
    },
    {
      name: "Facebook",
      icon: Facebook,
      followers: 3800000,
      totalPosts: 890,
      growth: 8.3,
      color: "hsl(221, 44%, 41%)",
    },
    {
      name: "Twitter",
      icon: Twitter,
      followers: 2100000,
      totalPosts: 2340,
      growth: 15.7,
      color: "hsl(203, 89%, 53%)",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      followers: 980000,
      totalPosts: 456,
      growth: 22.1,
      color: "hsl(201, 100%, 35%)",
    },
    {
      name: "YouTube",
      icon: Youtube,
      followers: 420000,
      totalPosts: 124,
      growth: 18.9,
      color: "hsl(0, 100%, 50%)",
    },
  ],
  growthData: [
    {
      month: "Jan",
      Instagram: 4500000,
      Facebook: 3200000,
      Twitter: 2100000,
      LinkedIn: 900000,
      YouTube: 250000,
    },
    {
      month: "Feb",
      Instagram: 3800000,
      Facebook: 3400000,
      Twitter: 2800000,
      LinkedIn: 950000,
      YouTube: 450000,
    },
    {
      month: "Mar",
      Instagram: 5200000,
      Facebook: 3300000,
      Twitter: 1900000,
      LinkedIn: 1100000,
      YouTube: 400000,
    },
    {
      month: "Apr",
      Instagram: 4900000,
      Facebook: 3600000,
      Twitter: 2400000,
      LinkedIn: 1050000,
      YouTube: 850000,
    },
    {
      month: "May",
      Instagram: 5600000,
      Facebook: 3500000,
      Twitter: 2200000,
      LinkedIn: 1250000,
      YouTube: 1400000,
    },
    {
      month: "Jun",
      Instagram: 5300000,
      Facebook: 3900000,
      Twitter: 3100000,
      LinkedIn: 1300000,
      YouTube: 1800000,
    },
  ],
  platformMetrics: {
    Instagram: {
      posts: [
        {
          month: "Jan",
          posts: 45,
          likes: 125000,
          shares: 8900,
          comments: 12400,
          saves: 15600,
        },
        {
          month: "Feb",
          posts: 48,
          likes: 132000,
          shares: 9200,
          comments: 13100,
          saves: 16200,
        },
        {
          month: "Mar",
          posts: 52,
          likes: 145000,
          shares: 10100,
          comments: 14500,
          saves: 17800,
        },
        {
          month: "Apr",
          posts: 49,
          likes: 138000,
          shares: 9800,
          comments: 13800,
          saves: 17100,
        },
        {
          month: "May",
          posts: 51,
          likes: 142000,
          shares: 10300,
          comments: 14200,
          saves: 17600,
        },
        {
          month: "Jun",
          posts: 55,
          likes: 156000,
          shares: 11200,
          comments: 15600,
          saves: 19200,
        },
      ],
      sentiment: [
        { name: "Positive", value: 68, color: "#64b5f6" },
        { name: "Neutral", value: 24, color: "#a48fff" },
        { name: "Negative", value: 8, color: "#ff79c6" },
      ],
      recentPosts: [
        {
          id: 1,
          image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
          caption: "Introducing our new seasonal blend! ☕✨ #NewFlavor",
          likes: 45200,
          comments: 892,
          shares: 234,
          date: "2 hours ago",
        },
        {
          id: 2,
          image:
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop",
          caption: "Behind the scenes at our roastery 🌟",
          likes: 38900,
          comments: 654,
          shares: 189,
          date: "1 day ago",
        },
        {
          id: 3,
          image:
            "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop",
          caption: "Perfect morning vibes ☀️☕",
          likes: 52100,
          comments: 1023,
          shares: 312,
          date: "2 days ago",
        },
      ],
    },
    Facebook: {
      posts: [
        {
          month: "Jan",
          posts: 38,
          likes: 98000,
          shares: 6700,
          comments: 8900,
          saves: 5400,
        },
        {
          month: "Feb",
          posts: 40,
          likes: 102000,
          shares: 7100,
          comments: 9300,
          saves: 5700,
        },
        {
          month: "Mar",
          posts: 42,
          likes: 108000,
          shares: 7600,
          comments: 9800,
          saves: 6100,
        },
        {
          month: "Apr",
          posts: 39,
          likes: 104000,
          shares: 7300,
          comments: 9500,
          saves: 5900,
        },
        {
          month: "May",
          posts: 41,
          likes: 106000,
          shares: 7800,
          comments: 9700,
          saves: 6000,
        },
        {
          month: "Jun",
          posts: 44,
          likes: 112000,
          shares: 8200,
          comments: 10200,
          saves: 6400,
        },
      ],
      sentiment: [
        { name: "Positive", value: 62, color: "#64b5f6" },
        { name: "Neutral", value: 28, color: "#a48fff" },
        { name: "Negative", value: 10, color: "#ff79c6" },
      ],
      recentPosts: [
        {
          id: 1,
          image:
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=400&fit=crop",
          caption: "Join us for our community event this weekend! 🎉",
          likes: 28400,
          comments: 567,
          shares: 892,
          date: "3 hours ago",
        },
        {
          id: 2,
          image:
            "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=400&fit=crop",
          caption: "Celebrating our amazing baristas! 👏",
          likes: 31200,
          comments: 623,
          shares: 445,
          date: "1 day ago",
        },
      ],
    },
    Twitter: {
      posts: [
        {
          month: "Jan",
          posts: 95,
          likes: 45000,
          shares: 12000,
          comments: 8900,
          saves: 3200,
        },
        {
          month: "Feb",
          posts: 98,
          likes: 47000,
          shares: 12500,
          comments: 9200,
          saves: 3400,
        },
        {
          month: "Mar",
          posts: 102,
          likes: 51000,
          shares: 13200,
          comments: 9800,
          saves: 3700,
        },
        {
          month: "Apr",
          posts: 99,
          likes: 48000,
          shares: 12800,
          comments: 9400,
          saves: 3500,
        },
        {
          month: "May",
          posts: 101,
          likes: 49000,
          shares: 13000,
          comments: 9600,
          saves: 3600,
        },
        {
          month: "Jun",
          posts: 105,
          likes: 53000,
          shares: 13800,
          comments: 10200,
          saves: 3900,
        },
      ],
      sentiment: [
        { name: "Positive", value: 58, color: "#64b5f6" },
        { name: "Neutral", value: 32, color: "#a48fff" },
        { name: "Negative", value: 10, color: "#ff79c6" },
      ],
      recentPosts: [
        {
          id: 1,
          image: "",
          caption:
            "Hot take: Our new blend is the best thing to happen to mornings since sunrise ☀️☕",
          likes: 8900,
          comments: 234,
          shares: 567,
          date: "1 hour ago",
        },
        {
          id: 2,
          image: "",
          caption:
            "Sustainability update: We've saved 2M plastic cups this quarter! 🌍♻️",
          likes: 12400,
          comments: 445,
          shares: 892,
          date: "5 hours ago",
        },
      ],
    },
    LinkedIn: {
      posts: [
        {
          month: "Jan",
          posts: 18,
          likes: 12000,
          shares: 3400,
          comments: 2100,
          saves: 1800,
        },
        {
          month: "Feb",
          posts: 19,
          likes: 12500,
          shares: 3600,
          comments: 2200,
          saves: 1900,
        },
        {
          month: "Mar",
          posts: 21,
          likes: 13200,
          shares: 3900,
          comments: 2400,
          saves: 2100,
        },
        {
          month: "Apr",
          posts: 20,
          likes: 12800,
          shares: 3700,
          comments: 2300,
          saves: 2000,
        },
        {
          month: "May",
          posts: 22,
          likes: 13500,
          shares: 4000,
          comments: 2500,
          saves: 2200,
        },
        {
          month: "Jun",
          posts: 24,
          likes: 14200,
          shares: 4300,
          comments: 2700,
          saves: 2400,
        },
      ],
      sentiment: [
        { name: "Positive", value: 75, color: "#64b5f6" },
        { name: "Neutral", value: 20, color: "#a48fff" },
        { name: "Negative", value: 5, color: "#ff79c6" },
      ],
      recentPosts: [
        {
          id: 1,
          image:
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
          caption:
            "We're hiring! Join our team of innovators. 200+ positions open.",
          likes: 3400,
          comments: 189,
          shares: 567,
          date: "2 days ago",
        },
      ],
    },
    YouTube: {
      posts: [
        {
          month: "Jan",
          posts: 8,
          likes: 28000,
          shares: 4200,
          comments: 3400,
          saves: 5600,
        },
        {
          month: "Feb",
          posts: 9,
          likes: 31000,
          shares: 4600,
          comments: 3700,
          saves: 6100,
        },
        {
          month: "Mar",
          posts: 10,
          likes: 34000,
          shares: 5100,
          comments: 4100,
          saves: 6700,
        },
        {
          month: "Apr",
          posts: 9,
          likes: 32000,
          shares: 4800,
          comments: 3900,
          saves: 6400,
        },
        {
          month: "May",
          posts: 11,
          likes: 36000,
          shares: 5400,
          comments: 4300,
          saves: 7100,
        },
        {
          month: "Jun",
          posts: 12,
          likes: 39000,
          shares: 5800,
          comments: 4700,
          saves: 7600,
        },
      ],
      sentiment: [
        { name: "Positive", value: 72, color: "#64b5f6" },
        { name: "Neutral", value: 22, color: "#a48fff" },
        { name: "Negative", value: 6, color: "#ff79c6" },
      ],
      recentPosts: [
        {
          id: 1,
          image:
            "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop",
          caption: "How We Source Our Coffee Beans | Behind the Scenes",
          likes: 12400,
          comments: 567,
          shares: 234,
          date: "3 days ago",
        },
      ],
    },
  },
};

export default function SocialMediaSentimentTab({
  companySlug,
}: SocialMediaSentimentTabProps) {
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");

  const {
    instagramData,
    youtubeData,
    facebookData,
    linkedinData,
    fetchAllSocialData,
    clearSocialMediaData,
    // Platform metrics from the new API
    instagramMetrics,
    twitterMetrics,
    youtubeMetrics,
    facebookMetrics,
    linkedinMetrics,
    metricsLoading,
    // Overall sentiment from review APIs (Reddit, Trustpilot, Google Reviews)
    overallSentiment,
    // Social posts list
    socialPosts,
    socialPostsLoading,
    fetchSocialPosts,
  } = useSocialMediaStore();

  const { companies } = useCompaniesStore();

  useEffect(() => {
    const matchingCompany = companies.find(
      (c) =>
        c.brand_name.toLowerCase().replace(/\s+/g, "-") ===
          companySlug.toLowerCase() ||
        c.domain.toLowerCase().includes(companySlug.toLowerCase()) ||
        companySlug.toLowerCase().includes(c.brand_name.toLowerCase()),
    );

    if (matchingCompany) {
      fetchAllSocialData(matchingCompany.domain, matchingCompany.brand_name);
    } else {
      const domain = `${companySlug.toLowerCase().replace(/-/g, "")}.com`;
      const name = companySlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      fetchAllSocialData(domain, name);
    }

    return () => {
      clearSocialMediaData();
    };
  }, [companySlug, companies, fetchAllSocialData, clearSocialMediaData]);

  // Fetch social posts when selectedPlatform changes
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

    const jobId = platformJobIdMap[selectedPlatform];
    if (jobId) {
      fetchSocialPosts(domain, jobId, 6, 0);
    }
  }, [selectedPlatform, companySlug, companies, fetchSocialPosts]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const parseFollowers = (str: string | number | null | undefined): number => {
    if (!str) return 0;
    if (typeof str === "number") return str;
    const stringValue = String(str);
    const num = parseFloat(stringValue.replace(/[^0-9.]/g, ""));
    if (stringValue.includes("M")) return num * 1000000;
    if (stringValue.includes("K")) return num * 1000;
    return num || 0;
  };

  // Build platforms array with only API data (no fallback to mock data)
  const allPlatformsRaw = [
    {
      name: "Instagram",
      icon: Instagram,
      followers: instagramData?.followersCount || null,
      totalPosts: instagramData?.postsCount || null,
      growth: instagramData ? 12.5 : null, // Only show growth if we have data
      color: "hsl(330, 80%, 50%)",
      verified: instagramData?.isVerified || false,
      profileUrl: instagramData?.profileUrl || "",
      activityLevel: instagramData?.activityLevel || "",
      hasData: !!instagramData,
    },
    {
      name: "Facebook",
      icon: Facebook,
      followers: facebookData ? parseFollowers(facebookData.followers) : null,
      totalPosts: null, // No posts count from API
      growth: facebookData ? 8.3 : null,
      color: "hsl(221, 44%, 41%)",
      verified: facebookData?.verified || false,
      profileUrl: facebookData?.url || "",
      category: facebookData?.category || "",
      hasData: !!facebookData,
    },
    {
      name: "Twitter",
      icon: Twitter,
      followers: null, // Twitter API not being fetched
      totalPosts: null,
      growth: null,
      color: "hsl(203, 89%, 53%)",
      verified: false,
      profileUrl: "",
      hasData: false,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      followers: linkedinData?.followerCount || null,
      totalPosts: null, // No posts count from API
      growth: linkedinData ? 22.1 : null,
      color: "hsl(201, 100%, 35%)",
      verified: false,
      profileUrl: linkedinData?.url || "",
      employeeCount: linkedinData?.employeeCount || 0,
      hasData: !!linkedinData,
    },
    {
      name: "YouTube",
      icon: Youtube,
      followers: youtubeData?.statistics
        ? parseInt(youtubeData.statistics.subscriberCount)
        : null,
      totalPosts: youtubeData?.statistics?.totalPosts || null,
      growth: youtubeData ? 18.9 : null,
      color: "hsl(0, 100%, 50%)",
      verified: false,
      profileUrl: youtubeData?.url || "",
      viewCount: youtubeData?.statistics?.viewCount || "0",
      hasData: !!youtubeData,
    },
  ];

  // Filter to only include platforms with actual data
  const dynamicPlatforms = allPlatformsRaw.filter((p) => p.hasData);

  // Calculate total followers from API data (only from platforms with data)
  const totalFollowers = dynamicPlatforms.reduce(
    (sum, p) => sum + (p.followers || 0),
    0,
  );

  // Check if we have any platform data at all
  const hasAnyPlatformData = dynamicPlatforms.length > 0;

  const currentPlatformData =
    socialMediaData.platformMetrics[
      selectedPlatform as keyof typeof socialMediaData.platformMetrics
    ];


  // Generate bar chart data from API metrics - showing all platforms together
  const getAllPlatformsChartData = () => {
    // Check if we have any metrics data
    const hasAnyMetrics =
      instagramMetrics ||
      twitterMetrics ||
      youtubeMetrics ||
      facebookMetrics ||
      linkedinMetrics;

    if (!hasAnyMetrics) {
      return null;
    }

    // Create data for all platforms
    return [
      {
        platform: "Instagram",
        likes: instagramMetrics?.likesCount || 0,
        comments: instagramMetrics?.commentsCount || 0,
        views: instagramMetrics?.videoViewCount || 0,
        engagement: instagramMetrics?.totalEngagement || 0,
        engagementRate: instagramMetrics?.engagementRate || 0,
      },
      {
        platform: "Twitter",
        likes: twitterMetrics?.likesCount || 0,
        comments: twitterMetrics?.commentsCount || 0,
        views: twitterMetrics?.videoViewCount || 0,
        engagement: twitterMetrics?.totalEngagement || 0,
        engagementRate: twitterMetrics?.engagementRate || 0,
      },
      {
        platform: "YouTube",
        likes: youtubeMetrics?.likesCount || 0,
        comments: youtubeMetrics?.commentsCount || 0,
        views: youtubeMetrics?.videoViewCount || 0,
        engagement: youtubeMetrics?.totalEngagement || 0,
        engagementRate: youtubeMetrics?.engagementRate || 0,
      },
      {
        platform: "Facebook",
        likes: facebookMetrics?.likesCount || 0,
        comments: facebookMetrics?.commentsCount || 0,
        shares: facebookMetrics?.sharesCount || 0,
        views: facebookMetrics?.videoViewCount || 0,
        engagement: facebookMetrics?.totalEngagement || 0,
        engagementRate: facebookMetrics?.engagementRate || 0,
      },
      {
        platform: "LinkedIn",
        likes: linkedinMetrics?.likesCount || 0,
        comments: linkedinMetrics?.commentsCount || 0,
        views: linkedinMetrics?.videoViewCount || 0,
        engagement: linkedinMetrics?.totalEngagement || 0,
        engagementRate: linkedinMetrics?.engagementRate || 0,
      },
    ];
  };

  const allPlatformsChartData = getAllPlatformsChartData();

  // Calculate aggregated metrics from all platforms
  const allPlatformMetrics = [
    instagramMetrics,
    twitterMetrics,
    youtubeMetrics,
    facebookMetrics,
    linkedinMetrics,
  ].filter(Boolean);

  const totalEngagement = allPlatformMetrics.reduce(
    (sum, m) => sum + (m?.totalEngagement || 0),
    0,
  );

  const totalVideoViews = allPlatformMetrics.reduce(
    (sum, m) => sum + (m?.videoViewCount || 0),
    0,
  );

  const averageEngagementRate =
    allPlatformMetrics.length > 0
      ? allPlatformMetrics.reduce(
          (sum, m) => sum + (m?.engagementRate || 0),
          0,
        ) / allPlatformMetrics.length
      : socialMediaData.overview.engagementRate;

  // Generate overall sentiment data from API (Reddit, Trustpilot, Google Reviews)
  const getOverallSentimentChartData = () => {
    if (overallSentiment) {
      return [
        {
          name: "Positive",
          value: overallSentiment.positive_pct,
          color: "#64b5f6",
        },
        {
          name: "Neutral",
          value: overallSentiment.neutral_pct,
          color: "#a48fff",
        },
        {
          name: "Negative",
          value: overallSentiment.negative_pct,
          color: "#ff79c6",
        },
      ];
    }
    // Fallback to mock data from the current platform
    return currentPlatformData.sentiment;
  };

  const overallSentimentChartData = getOverallSentimentChartData();

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border border-border/60 bg-linear-to-br from-primary/10 via-card to-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Total Followers
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {hasAnyPlatformData && totalFollowers > 0 ? (
              <>
                <p className="text-4xl font-bold text-foreground">
                  {formatNumber(totalFollowers)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Across {dynamicPlatforms.length} platform
                  {dynamicPlatforms.length > 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Not enough data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-linear-to-br from-accent/10 via-card to-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/30">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Engagement Rate
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {allPlatformMetrics.length > 0 ? (
              <>
                <p className="text-4xl font-bold text-foreground">
                  {averageEngagementRate.toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  From API data
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Not enough data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-linear-to-br from-primary/10 via-card to-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {totalVideoViews > 0 ? "Video Views" : "Total Engagement"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {totalVideoViews > 0 || totalEngagement > 0 ? (
              <>
                <p className="text-4xl font-bold text-foreground">
                  {formatNumber(
                    totalVideoViews > 0 ? totalVideoViews : totalEngagement,
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Aggregated from all platforms
                </p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Not enough data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview Table */}
      {dynamicPlatforms.length > 0 && (
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Platform Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Performance metrics across different social media platforms
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Platform
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Followers
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Total Posts
                    </th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dynamicPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <tr
                        key={platform.name}
                        className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${platform.color}15` }}
                            >
                              <Icon
                                className="h-5 w-5"
                                style={{ color: platform.color }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {platform.name}
                              </span>
                              {platform.verified && (
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                              )}
                              {platform.profileUrl && (
                                <a
                                  href={platform.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-foreground">
                          {platform.followers
                            ? formatNumber(platform.followers)
                            : "—"}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-foreground">
                          {platform.totalPosts
                            ? platform.totalPosts.toLocaleString()
                            : "—"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {platform.growth ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 font-semibold text-sm">
                              <TrendingUp className="h-3 w-3" />
                              {platform.growth}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Media Growth Chart */}
      {/* <DemoDataWrapper>
        <SocialMediaGrowthChart
          data={socialMediaData.growthData}
          platforms={socialMediaData.platforms}
        />
      </DemoDataWrapper> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform-Specific Metrics - 2/3 width */}
        {(metricsLoading || allPlatformsChartData) && (
          <Card className="lg:col-span-2 rounded-3xl border border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {allPlatformsChartData
                      ? "All Platforms Performance"
                      : `${selectedPlatform} Performance`}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {allPlatformsChartData
                      ? "Aggregated social media metrics across all platforms"
                      : `Detailed engagement metrics for ${selectedPlatform}`}
                  </p>
                </div>
                {allPlatformMetrics.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">
                      {averageEngagementRate.toFixed(2)}% Avg Engagement
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="flex items-center justify-center h-[350px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : allPlatformsChartData && (
                // API data chart - shows all platforms together in vertical bars
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={allPlatformsChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="platform"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="hsl(var(--chart-1))"
                      fontSize={12}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      formatter={(value: number, name: string) => [
                        formatNumber(value) + (name.includes("Rate") ? "%" : ""),
                        name,
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-sm text-foreground capitalize">
                          {value}
                        </span>
                      )}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="likes"
                      name="Likes"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="comments"
                      name="Comments"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="engagement"
                      name="Engagement"
                      fill="hsl(var(--chart-4))"
                      stroke="hsl(var(--chart-4))"
                      fillOpacity={0.1}
                      strokeWidth={1}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="views"
                      name="Views (Total)"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="engagementRate"
                      name="Eng. Rate %"
                      stroke="hsl(var(--chart-5, #22c55e))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Overall Sentiment - 1/3 width (from Reddit, Trustpilot, Google Reviews) */}
        <SentimentDonutChart data={overallSentimentChartData} />
      </div>

      {/* Platform Selector - Show all platforms for selection */}
      <div className="flex flex-wrap gap-3">
        {allPlatformsRaw.map((platform) => {
          const Icon = platform.icon;
          return (
            <button
              key={platform.name}
              onClick={() => setSelectedPlatform(platform.name)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                selectedPlatform === platform.name
                  ? "bg-linear-to-r from-primary to-accent text-white shadow-lg scale-105"
                  : "bg-card border border-border/60 text-foreground hover:border-primary/50"
              } ${!platform.hasData ? "opacity-50" : ""}`}
            >
              <Icon className="h-5 w-5" />
              {platform.name}
              {platform.verified && <CheckCircle className="h-4 w-4" />}
            </button>
          );
        })}
      </div>

      {/* Recent Posts */}
      {(socialPostsLoading || socialPosts.length > 0) && (
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">
              Recent {selectedPlatform} Posts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest posts from {selectedPlatform}
            </p>
          </CardHeader>
          <CardContent>
            {socialPostsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : socialPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {socialPosts.map((post: SocialPost) => (
                  <a
                    key={post.id}
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl border border-border/60 overflow-hidden bg-linear-to-br from-card to-accent/5 hover:shadow-lg transition-all group"
                  >
                    {post.image_url && (
                      <div className="relative w-full h-48">
                        <Image
                          src={post.image_url}
                          alt="Post"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {post.post_type}
                        </span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                        {post.caption || "No caption"}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {formatNumber(post.likes_count || 0)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {formatNumber(post.comments_count || 0)}
                        </div>
                        {post.views_count && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(post.views_count)}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.post_timestamp).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
