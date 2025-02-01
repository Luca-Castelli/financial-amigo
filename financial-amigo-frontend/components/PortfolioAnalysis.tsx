"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AnalysisResult = {
  percentReturn: number;
  startValue: number;
  endValue: number;
  contributionAmount: number;
  withdrawalAmount: number;
  investmentReturns: number;
  dividendsReceived: number;
};

// Mock function to simulate API call
const fetchAnalysisData = async (
  startDate: string,
  endDate: string,
  account: string
): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return mock data
  return {
    percentReturn: 12.5,
    startValue: 100000,
    endValue: 115000,
    contributionAmount: 10000,
    withdrawalAmount: 2000,
    investmentReturns: 8000,
    dividendsReceived: 1000,
  };
};

// Mock analysis data
const analysisData = {
  diversification: {
    score: 75,
    description:
      "Your portfolio has good sector diversification but could be improved with international exposure.",
    sectors: [
      { name: "Technology", allocation: 45 },
      { name: "Consumer Discretionary", allocation: 30 },
      { name: "Communication Services", allocation: 25 },
    ],
  },
  risk: {
    score: 68,
    description:
      "Medium risk profile with a beta of 1.2 relative to the S&P 500.",
    metrics: [
      { name: "Beta", value: "1.2" },
      { name: "Sharpe Ratio", value: "1.8" },
      { name: "Volatility", value: "15%" },
    ],
  },
  performance: {
    ytd: "+12.5%",
    oneYear: "+18.2%",
    threeYear: "+45.6%",
    metrics: [
      { name: "Alpha", value: "+2.5%" },
      { name: "Information Ratio", value: "0.85" },
      { name: "Tracking Error", value: "4.2%" },
    ],
  },
};

export function PortfolioAnalysis() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [account, setAccount] = useState("all");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysis = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert("Start date must be before end date");
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchAnalysisData(startDate, endDate, account);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      alert(
        "An error occurred while fetching analysis data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diversification Analysis</CardTitle>
          <CardDescription>
            {analysisData.diversification.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  Diversification Score
                </span>
                <span className="text-sm font-medium">
                  {analysisData.diversification.score}/100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${analysisData.diversification.score}%`,
                  }}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Allocation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisData.diversification.sectors.map((sector) => (
                  <TableRow key={sector.name}>
                    <TableCell>{sector.name}</TableCell>
                    <TableCell className="text-right">
                      {sector.allocation}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis</CardTitle>
          <CardDescription>{analysisData.risk.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-sm font-medium">
                  {analysisData.risk.score}/100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${analysisData.risk.score}%` }}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisData.risk.metrics.map((metric) => (
                  <TableRow key={metric.name}>
                    <TableCell>{metric.name}</TableCell>
                    <TableCell className="text-right">{metric.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
          <CardDescription>
            Historical performance and key performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">YTD Return</span>
                  <span
                    className={`text-sm font-medium ${
                      analysisData.performance.ytd.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {analysisData.performance.ytd}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">1 Year Return</span>
                  <span
                    className={`text-sm font-medium ${
                      analysisData.performance.oneYear.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {analysisData.performance.oneYear}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">3 Year Return</span>
                  <span
                    className={`text-sm font-medium ${
                      analysisData.performance.threeYear.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {analysisData.performance.threeYear}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisData.performance.metrics.map((metric) => (
                    <TableRow key={metric.name}>
                      <TableCell>{metric.name}</TableCell>
                      <TableCell className="text-right">
                        {metric.value}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
