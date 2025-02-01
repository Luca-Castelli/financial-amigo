"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewsFeedProps {
  symbols: string[];
}

// Mock news data
const mockNews = [
  {
    id: 1,
    title: "Apple Reports Record Q4 Earnings",
    symbol: "AAPL",
    date: "2024-03-15",
    source: "Financial Times",
    url: "#",
  },
  {
    id: 2,
    title: "Google Announces New AI Initiatives",
    symbol: "GOOGL",
    date: "2024-03-14",
    source: "Reuters",
    url: "#",
  },
  {
    id: 3,
    title: "Microsoft Cloud Revenue Surges",
    symbol: "MSFT",
    date: "2024-03-13",
    source: "Bloomberg",
    url: "#",
  },
  {
    id: 4,
    title: "Amazon Expands Same-Day Delivery",
    symbol: "AMZN",
    date: "2024-03-12",
    source: "CNBC",
    url: "#",
  },
];

export function NewsFeed({ symbols }: NewsFeedProps) {
  // Filter news based on user's holdings
  const relevantNews = mockNews.filter((news) => symbols.includes(news.symbol));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relevantNews.map((news) => (
            <div
              key={news.id}
              className="flex flex-col space-y-1 border-b pb-4 last:border-0"
            >
              <a
                href={news.url}
                className="font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {news.title}
              </a>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{news.symbol}</span>
                <span>•</span>
                <span>{news.source}</span>
                <span>•</span>
                <span>{news.date}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
