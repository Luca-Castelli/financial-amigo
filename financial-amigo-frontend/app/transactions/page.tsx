"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import api, {
  Account,
  Currency,
  Transaction,
  TransactionType,
  transactions as transactionsApi,
} from "@/lib/api";

export default function Transactions() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTransaction, setNewTransaction] = useState<
    Omit<Transaction, "id" | "total_native">
  >({
    date: new Date().toISOString().split("T")[0],
    symbol: "",
    quantity: 0,
    price_native: 0,
    commission_native: 0,
    currency: "CAD" as Currency,
    type: "Buy" as TransactionType,
    description: "",
    account_id: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchTransactions();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions();
    }
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get("/api/accounts");
      setAccounts(data);
      if (data.length > 0 && !selectedAccount) {
        setSelectedAccount(data[0].id);
        setNewTransaction((prev) => ({
          ...prev,
          account_id: data[0].id,
          currency: data[0].currency,
        }));
      }
    } catch (error) {
      toast.error("Failed to fetch accounts");
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data } = await transactionsApi.list(selectedAccount);
      setTransactionList(data);
    } catch (error) {
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (editingTransaction) {
      setEditingTransaction((prev) => ({ ...prev!, [name]: value }));
    } else {
      setNewTransaction((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (value: TransactionType) => {
    if (editingTransaction) {
      setEditingTransaction((prev) => ({ ...prev!, type: value }));
    } else {
      setNewTransaction((prev) => ({ ...prev, type: value }));
    }
  };

  const handleCurrencyChange = (value: Currency) => {
    if (editingTransaction) {
      setEditingTransaction((prev) => ({ ...prev!, currency: value }));
    } else {
      setNewTransaction((prev) => ({ ...prev, currency: value }));
    }
  };

  const handleAccountChange = (value: string) => {
    const account = accounts.find((a) => a.id === value);
    setSelectedAccount(value);
    if (!editingTransaction && account) {
      setNewTransaction((prev) => ({
        ...prev,
        account_id: value,
        currency: account.currency,
      }));
    }
  };

  const handleAddTransaction = async () => {
    try {
      await transactionsApi.create(newTransaction);
      setIsAddingTransaction(false);
      toast.success("Transaction added successfully!");
      fetchTransactions();
      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        symbol: "",
        quantity: 0,
        price_native: 0,
        commission_native: 0,
        currency:
          accounts.find((a) => a.id === selectedAccount)?.currency ||
          ("CAD" as Currency),
        type: "Buy" as TransactionType,
        description: "",
        account_id: selectedAccount,
      });
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  const handleEditTransaction = async () => {
    if (!editingTransaction) return;
    try {
      const { id, total_native, account_id, ...updateData } =
        editingTransaction;
      await transactionsApi.update(id, updateData);
      setEditingTransaction(null);
      toast.success("Transaction updated successfully!");
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to update transaction");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionsApi.delete(id);
      toast.success("Transaction deleted successfully!");
      fetchTransactions();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold leading-tight text-foreground">
              Transactions
            </h1>
            <div className="flex gap-4 items-center">
              <Select
                value={selectedAccount}
                onValueChange={handleAccountChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog
                open={isAddingTransaction}
                onOpenChange={setIsAddingTransaction}
              >
                <DialogTrigger asChild>
                  <Button>Add Transaction</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                      Enter the details of your new transaction here. Click save
                      when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={newTransaction.date}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="symbol" className="text-right">
                        Symbol
                      </Label>
                      <Input
                        id="symbol"
                        name="symbol"
                        value={newTransaction.symbol}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={newTransaction.type}
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Buy">Buy</SelectItem>
                          <SelectItem value="Sell">Sell</SelectItem>
                          <SelectItem value="Dividend">Dividend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="currency" className="text-right">
                        Currency
                      </Label>
                      <Select
                        value={newTransaction.currency}
                        onValueChange={handleCurrencyChange}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newTransaction.type !== "Dividend" && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          value={newTransaction.quantity}
                          onChange={handleInputChange}
                          className="col-span-3"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price_native" className="text-right">
                        {newTransaction.type === "Dividend"
                          ? "Amount"
                          : "Price"}
                      </Label>
                      <Input
                        id="price_native"
                        name="price_native"
                        type="number"
                        value={newTransaction.price_native}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="commission_native" className="text-right">
                        Commission
                      </Label>
                      <Input
                        id="commission_native"
                        name="commission_native"
                        type="number"
                        value={newTransaction.commission_native}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        value={newTransaction.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingTransaction(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddTransaction}>
                      Add Transaction
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View and manage your investment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-lg">Loading transactions...</div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactionList.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.symbol}</TableCell>
                          <TableCell>{transaction.type}</TableCell>
                          <TableCell>{transaction.currency}</TableCell>
                          <TableCell>
                            {transaction.type === "Dividend"
                              ? "-"
                              : transaction.quantity}
                          </TableCell>
                          <TableCell>
                            {transaction.type === "Dividend"
                              ? "-"
                              : `$${transaction.price_native.toFixed(2)}`}
                          </TableCell>
                          <TableCell>
                            ${transaction.commission_native.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            ${transaction.total_native.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setEditingTransaction(transaction)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteTransaction(transaction.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog
        open={!!editingTransaction}
        onOpenChange={() => setEditingTransaction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Make changes to your transaction here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          {editingTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">
                  Date
                </Label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  value={editingTransaction.date}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-symbol" className="text-right">
                  Symbol
                </Label>
                <Input
                  id="edit-symbol"
                  name="symbol"
                  value={editingTransaction.symbol}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Type
                </Label>
                <Select
                  value={editingTransaction.type}
                  onValueChange={handleTypeChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Buy</SelectItem>
                    <SelectItem value="Sell">Sell</SelectItem>
                    <SelectItem value="Dividend">Dividend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-currency" className="text-right">
                  Currency
                </Label>
                <Select
                  value={editingTransaction.currency}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingTransaction.type !== "Dividend" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id="edit-quantity"
                    name="quantity"
                    type="number"
                    value={editingTransaction.quantity}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  {editingTransaction.type === "Dividend" ? "Amount" : "Price"}
                </Label>
                <Input
                  id="edit-price"
                  name="price_native"
                  type="number"
                  value={editingTransaction.price_native}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-commission" className="text-right">
                  Commission
                </Label>
                <Input
                  id="edit-commission"
                  name="commission_native"
                  type="number"
                  value={editingTransaction.commission_native}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  name="description"
                  value={editingTransaction.description || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingTransaction(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTransaction}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
