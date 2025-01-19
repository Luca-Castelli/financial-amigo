"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type NewsItem = {
  title: string
  description: string
  url: string
  publishedAt: string
  source: {
    name: string
  }
}

export function NewsFeed({ symbols }: { symbols: string[] }) {
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    const fetchNews = async () => {
      // In a real application, you would fetch news from an API
      // For this example, we'll use mock data
      const mockNews: NewsItem[] = [
        {
          title: "Apple's newest iPhone breaks sales records",
          description: "The latest iPhone model has surpassed all expectations in its first week of sales.",
          url: "https://example.com/apple-news",
          publishedAt: "2023-07-01T12:00:00Z",
          source: { name: "Tech News" }
        },
        {
          title: "Google announces breakthrough in quantum computing",
          description: "Google's quantum computer has achieved quantum supremacy, performing a calculation in 200 seconds that would take a supercomputer 10,000 years.",
          url: "https://example.com/google-news",
          publishedAt: "2023-07-02T14:30:00Z",
          source: { name: "Science Daily" }
        },
        {
          title: "Microsoft's cloud business continues to grow",
          description: "Microsoft's Azure cloud platform has seen a 50% year-over-year growth in the last quarter.",
          url: "https://example.com/microsoft-news",
          publishedAt: "2023-07-03T09:15:00Z",
          source: { name: "Business Insider" }
        }
      ]
      setNews(mockNews)
    }

    fetchNews()
  }, [symbols])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
        <CardDescription>Recent news about your holdings</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {news.map((item, index) => (
            <li key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
              <h3 className="font-semibold">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {item.title}
                </a>
              </h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                {item.source.name} - {new Date(item.publishedAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

