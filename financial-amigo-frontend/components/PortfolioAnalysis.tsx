"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type AnalysisResult = {
  percentReturn: number
  startValue: number
  endValue: number
  contributionAmount: number
  withdrawalAmount: number
  investmentReturns: number
  dividendsReceived: number
}

// Mock function to simulate API call
const fetchAnalysisData = async (startDate: string, endDate: string, account: string): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Return mock data
  return {
    percentReturn: 12.5,
    startValue: 100000,
    endValue: 115000,
    contributionAmount: 10000,
    withdrawalAmount: 2000,
    investmentReturns: 8000,
    dividendsReceived: 1000
  }
}

export function PortfolioAnalysis() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [account, setAccount] = useState('all')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalysis = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      alert('Start date must be before end date')
      return
    }

    setIsLoading(true)
    try {
      const result = await fetchAnalysisData(startDate, endDate, account)
      setAnalysisResult(result)
    } catch (error) {
      console.error('Error fetching analysis data:', error)
      alert('An error occurred while fetching analysis data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Analysis</CardTitle>
        <CardDescription>Analyze your portfolio performance over a specific period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="account">Account</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="tfsa">TFSA</SelectItem>
                <SelectItem value="rrsp">RRSP</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAnalysis} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </div>
        {analysisResult && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Percent Return</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analysisResult.percentReturn.toFixed(2)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Start: ${analysisResult.startValue.toLocaleString()}</p>
                <p>End: ${analysisResult.endValue.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <p>In: ${analysisResult.contributionAmount.toLocaleString()}</p>
                <p>Out: ${analysisResult.withdrawalAmount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Investment Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${analysisResult.investmentReturns.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Dividends Received</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${analysisResult.dividendsReceived.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

