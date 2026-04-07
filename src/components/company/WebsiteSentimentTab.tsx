"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  TrendingUp,
  Star,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { SentimentDonutChart } from "./SentimentDonutChart";
import { DemoDataWrapper } from "@/components/ui/DemoDataWrapper";
import { useSocialMediaStore } from "@/store/socialMediaStore";
import { useCompaniesStore } from "@/store/companiesStore";
import { useEffect } from "react";
import { CheckCircle, ExternalLink, MapPin } from "lucide-react";

interface WebsiteSentimentTabProps {
  companySlug: string;
}

// Mock data - replace with actual API calls
const websiteSentimentData = {
  totalFeedback: 8450,
  sentimentBreakdown: {
    positive: 5690,
    neutral: 1920,
    negative: 840,
  },
  platforms: [
    {
      name: "Glassdoor",
      icon: "≡ƒÆ╝",
      totalReviews: 4820,
      rating: 4.2,
      positive: 3380,
      neutral: 1050,
      negative: 390,
      color: "hsl(142, 76%, 36%)",
    },
    {
      name: "Indeed",
      icon: "≡ƒöì",
      totalReviews: 3630,
      rating: 4.0,
      positive: 2310,
      neutral: 870,
      negative: 450,
      color: "hsl(221, 83%, 53%)",
    },
  ],
  feedbackTopics: [
    { topic: "Work-Life Balance", positive: 1240, neutral: 340, negative: 120 },
    { topic: "Company Culture", positive: 1580, neutral: 280, negative: 90 },
    { topic: "Career Growth", positive: 980, neutral: 520, negative: 180 },
    { topic: "Management", positive: 720, neutral: 450, negative: 280 },
    { topic: "Compensation", positive: 890, neutral: 330, negative: 170 },
    { topic: "Benefits", positive: 1120, neutral: 240, negative: 80 },
  ],
  wordFrequency: {
    positive: [
      { word: "Great", count: 1240 },
      { word: "Excellent", count: 980 },
      { word: "Amazing", count: 850 },
      { word: "Supportive", count: 720 },
      { word: "Flexible", count: 680 },
      { word: "Innovative", count: 620 },
      { word: "Professional", count: 580 },
      { word: "Collaborative", count: 540 },
    ],
    neutral: [
      { word: "Average", count: 420 },
      { word: "Standard", count: 380 },
      { word: "Typical", count: 340 },
      { word: "Moderate", count: 290 },
      { word: "Acceptable", count: 260 },
      { word: "Decent", count: 240 },
    ],
    negative: [
      { word: "Poor", count: 280 },
      { word: "Stressful", count: 240 },
      { word: "Difficult", count: 210 },
      { word: "Lacking", count: 180 },
      { word: "Limited", count: 160 },
      { word: "Disappointing", count: 140 },
    ],
  },
};

export default function WebsiteSentimentTab({
  companySlug,
}: WebsiteSentimentTabProps) {
  const {
    // Review sentiments and targets
    redditSentiment,
    redditTarget,
    redditUrls,
    trustpilotSentiment,
    trustpilotTarget,
    trustpilotUrls,
    googleReviewsSentiment,
    googleReviewsTarget,
    googleReviewsUrls,
    yelpReviewsSentiment,
    yelpReviewsTarget,
    yelpReviewsUrls,
    fetchAllReviewSentiments,
    sentimentLoading,
    overallSentiment,
  } = useSocialMediaStore();

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const sentimentData = [
    {
      name: "Positive",
      value: overallSentiment?.positive_pct || 0,
      percentage: (overallSentiment?.positive_pct || 0).toFixed(1),
      color: "#64b5f6",
    },
    {
      name: "Neutral",
      value: overallSentiment?.neutral_pct || 0,
      percentage: (overallSentiment?.neutral_pct || 0).toFixed(1),
      color: "#a48fff",
    },
    {
      name: "Negative",
      value: overallSentiment?.negative_pct || 0,
      percentage: (overallSentiment?.negative_pct || 0).toFixed(1),
      color: "#ff79c6",
    },
  ];

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
      fetchAllReviewSentiments(matchingCompany.domain);
    } else {
      const domain = `${companySlug.toLowerCase().replace(/-/g, "")}.com`;
      fetchAllReviewSentiments(domain);
    }
  }, [companySlug, companies, fetchAllReviewSentiments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent w-fit">
            Review Sentiment Analysis
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated sentiment from Reddit, Trustpilot, Google Reviews, and
            Yelp
          </p>
        </div>
        {sentimentLoading && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Total Feedback Overview (Real Data) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Total Feedback
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-foreground">
              {formatNumber(overallSentiment?.total_analyzed || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-cyan-500/10 via-card to-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <ThumbsUp className="h-5 w-5 text-cyan-600" />
              </div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Positive
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-cyan-600">
              {formatNumber(overallSentiment?.positive_count || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {overallSentiment?.total_analyzed
                ? (
                    (overallSentiment.positive_count /
                      overallSentiment.total_analyzed) *
                    100
                  ).toFixed(1)
                : "0.0"}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-purple-500/10 via-card to-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Minus className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Neutral
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">
              {formatNumber(overallSentiment?.neutral_count || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {overallSentiment?.total_analyzed
                ? (
                    (overallSentiment.neutral_count /
                      overallSentiment.total_analyzed) *
                    100
                  ).toFixed(1)
                : "0.0"}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-gradient-to-br from-slate-500/10 via-card to-card shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-500/20">
                <ThumbsDown className="h-5 w-5 text-slate-600" />
              </div>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Negative
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-600">
              {formatNumber(overallSentiment?.negative_count || 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {overallSentiment?.total_analyzed
                ? (
                    (overallSentiment.negative_count /
                      overallSentiment.total_analyzed) *
                    100
                  ).toFixed(1)
                : "0.0"}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown (Real Data) */}
      <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Platform Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            Feedback distribution across different platforms
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              {
                name: "Reddit",
                icon: MessageSquare,
                sentiment: redditSentiment,
                target: redditTarget,
                urls: redditUrls,
                color: "#FF4500",
              },
              {
                name: "Trustpilot",
                icon: Star,
                sentiment: trustpilotSentiment,
                target: trustpilotTarget,
                urls: trustpilotUrls,
                color: "#00B67A",
              },
              {
                name: "Google Reviews",
                icon: MapPin,
                sentiment: googleReviewsSentiment,
                target: googleReviewsTarget,
                urls: googleReviewsUrls,
                color: "#4285F4",
              },
              {
                name: "Yelp Reviews",
                icon: Star,
                sentiment: yelpReviewsSentiment,
                target: yelpReviewsTarget,
                urls: yelpReviewsUrls,
                color: "#D32323",
              },
            ].map((platform) => (
              <div
                key={platform.name}
                className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-border/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-xl"
                      style={{ backgroundColor: `${platform.color}20` }}
                    >
                      <platform.icon
                        className="h-5 w-5"
                        style={{ color: platform.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {platform.name}
                      </h3>
                      {platform.target && (
                        <p
                          className="text-xs text-muted-foreground truncate max-w-[150px]"
                          title={platform.target.name}
                        >
                          {platform.target.name ||
                            platform.target.sanitized_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {platform.sentiment && (
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {formatNumber(platform.sentiment.total_analyzed)}
                      </p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                  )}
                </div>

                {platform.sentiment ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Positive
                        </span>
                      </div>
                      <span className="text-sm font-bold text-cyan-600">
                        {platform.sentiment.positive_count} (
                        {platform.sentiment.positive_pct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Neutral
                        </span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {platform.sentiment.neutral_count} (
                        {platform.sentiment.neutral_pct}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Negative
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-600">
                        {platform.sentiment.negative_count} (
                        {platform.sentiment.negative_pct}%)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    No data available
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DemoDataWrapper className="lg:col-span-2">
          <Card className="h-full rounded-3xl border border-border/60 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                Feedback Topics & Themes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Common themes mentioned in employee reviews
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={websiteSentimentData.feedbackTopics}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="topic"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      padding: "12px",
                    }}
                    formatter={(value: number) => formatNumber(value)}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="rect"
                    formatter={(value) => (
                      <span className="text-sm text-foreground capitalize">
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="positive"
                    fill="#64b5f6"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar dataKey="neutral" fill="#a48fff" radius={[8, 8, 0, 0]} />
                  <Bar
                    dataKey="negative"
                    fill="#ff79c6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </DemoDataWrapper>

        {/* Overall Sentiment Distribution - 1/3 width */}
        <SentimentDonutChart data={sentimentData} />
      </div>

      {/* Word Frequency by Sentiment */}
      <DemoDataWrapper>
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
                {websiteSentimentData.wordFrequency.positive.map(
                  (item, index) => (
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
                  ),
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
                {websiteSentimentData.wordFrequency.neutral.map(
                  (item, index) => (
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
                  ),
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
                {websiteSentimentData.wordFrequency.negative.map(
                  (item, index) => (
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
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DemoDataWrapper>
    </div>
  );
}
