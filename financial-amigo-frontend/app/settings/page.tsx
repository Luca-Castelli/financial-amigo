"use client"

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock data for user accounts
const initialAccounts = [
  { id: 1, name: 'CAD TFSA', currency: 'CAD', type: 'TFSA' },
  { id: 2, name: 'USD RRSP', currency: 'USD', type: 'RRSP' },
]

export default function Settings() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [newAccount, setNewAccount] = useState({ name: '', currency: '', type: '' })
  const [isAddingAccount, setIsAddingAccount] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAccount(prev => ({ ...prev, [name]: value }))
  }

  const handleAddAccount = () => {
    const account = {
      id: accounts.length + 1,
      ...newAccount
    }
    setAccounts(prev => [...prev, account])
    setNewAccount({ name: '', currency: '', type: '' })
    setIsAddingAccount(false)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Settings</h1>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" placeholder="john@example.com" type="email" />
                    </div>
                    <Button>Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Accounts</CardTitle>
                    <CardDescription>Manage your investment accounts</CardDescription>
                  </div>
                  <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
                    <DialogTrigger asChild>
                      <Button>Add Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Account</DialogTitle>
                        <DialogDescription>
                          Enter the details of your new account here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={newAccount.name}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="currency" className="text-right">
                            Currency
                          </Label>
                          <Input
                            id="currency"
                            name="currency"
                            value={newAccount.currency}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right">
                            Type
                          </Label>
                          <Input
                            id="type"
                            name="type"
                            value={newAccount.type}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddAccount}>Save Account</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.currency}</TableCell>
                        <TableCell>{account.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

