"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import Loading from "@/components/Loading";
import { NewsFeed } from "@/components/NewsFeed";
import { PortfolioAnalysis } from "@/components/PortfolioAnalysis";

// Mock data for holdings
const holdingsData = [
  {
    id: 1,
    symbol: "AAPL",
    name: "Apple Inc.",
    quantity: 10,
    averageCost: 150,
    currentPrice: 175,
    currentValue: 1750,
    unrealizedPL: 250,
  },
  {
    id: 2,
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    quantity: 5,
    averageCost: 2000,
    currentPrice: 2100,
    currentValue: 10500,
    unrealizedPL: 500,
  },
  {
    id: 3,
    symbol: "MSFT",
    name: "Microsoft Corporation",
    quantity: 15,
    averageCost: 200,
    currentPrice: 220,
    currentValue: 3300,
    unrealizedPL: 300,
  },
  {
    id: 4,
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    quantity: 8,
    averageCost: 3000,
    currentPrice: 3200,
    currentValue: 25600,
    unrealizedPL: 1600,
  },
];

// Mock data for portfolio allocation
const portfolioAllocationData = [
  { name: "AAPL", value: 1750 },
  { name: "GOOGL", value: 10500 },
  { name: "MSFT", value: 3300 },
  { name: "AMZN", value: 25600 },
];

// Mock data for historical performance
const historicalPerformanceData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4800 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
];

// Mock data for dividends
const dividendsData = [
  { id: 1, date: "2023-01-15", symbol: "AAPL", amount: 82 },
  { id: 2, date: "2023-02-10", symbol: "MSFT", amount: 62 },
  { id: 3, date: "2023-03-05", symbol: "GOOGL", amount: 45 },
  { id: 4, date: "2023-04-20", symbol: "AAPL", amount: 82 },
  { id: 5, date: "2023-05-15", symbol: "MSFT", amount: 68 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return null;
  }

  const totalPortfolioValue = holdingsData.reduce(
    (sum, holding) => sum + holding.currentValue,
    0
  );
  const totalUnrealizedPL = holdingsData.reduce(
    (sum, holding) => sum + holding.unrealizedPL,
    0
  );
  const percentageChange =
    (totalUnrealizedPL / (totalPortfolioValue - totalUnrealizedPL)) * 100;
  const totalDividends = dividendsData.reduce(
    (sum, dividend) => sum + dividend.amount,
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="dividends">Dividends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Portfolio Value
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalPortfolioValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{percentageChange.toFixed(2)}% from average cost
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unrealized P/L
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalUnrealizedPL.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {percentageChange > 0 ? "+" : ""}
                  {percentageChange.toFixed(2)}% overall
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Dividends
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalDividends.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Year-to-date</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioAllocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioAllocationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Historical Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={historicalPerformanceData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="holdings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Holdings</CardTitle>
              <CardDescription>
                A list of your current stock holdings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Avg. Cost</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Unrealized P/L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holdingsData.map((holding) => (
                    <TableRow key={holding.id}>
                      <TableCell className="font-medium">
                        {holding.symbol}
                      </TableCell>
                      <TableCell>{holding.name}</TableCell>
                      <TableCell>{holding.quantity}</TableCell>
                      <TableCell>${holding.averageCost.toFixed(2)}</TableCell>
                      <TableCell>${holding.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>${holding.currentValue.toFixed(2)}</TableCell>
                      <TableCell
                        className={
                          holding.unrealizedPL >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        ${holding.unrealizedPL.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="dividends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dividends</CardTitle>
              <CardDescription>
                A list of your received dividends.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dividendsData.map((dividend) => (
                    <TableRow key={dividend.id}>
                      <TableCell>{dividend.date}</TableCell>
                      <TableCell>{dividend.symbol}</TableCell>
                      <TableCell>${dividend.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>
                Your portfolio's performance over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={historicalPerformanceData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analysis" className="mt-6">
          <PortfolioAnalysis />
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <NewsFeed symbols={holdingsData.map((holding) => holding.symbol)} />
      </div>
    </div>
  );
}
