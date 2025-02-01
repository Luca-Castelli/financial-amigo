"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
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
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Transaction = {
  id: number;
  date: string;
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  type: "Buy" | "Sell" | "Dividend";
};

// Mock data for transactions
const initialTransactions: Transaction[] = [
  {
    id: 1,
    date: "2023-05-01",
    symbol: "AAPL",
    quantity: 10,
    price: 150,
    total: 1500,
    type: "Buy",
  },
  {
    id: 2,
    date: "2023-05-15",
    symbol: "GOOGL",
    quantity: 5,
    price: 2000,
    total: 10000,
    type: "Buy",
  },
  {
    id: 3,
    date: "2023-06-01",
    symbol: "MSFT",
    quantity: 15,
    price: 200,
    total: 3000,
    type: "Buy",
  },
  {
    id: 4,
    date: "2023-06-15",
    symbol: "AAPL",
    quantity: 5,
    price: 160,
    total: 800,
    type: "Sell",
  },
  {
    id: 5,
    date: "2023-07-01",
    symbol: "AAPL",
    quantity: 0,
    price: 0,
    total: 50,
    type: "Dividend",
  },
];

export default function Transactions() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState<
    Omit<Transaction, "id" | "total">
  >({
    date: "",
    symbol: "",
    quantity: 0,
    price: 0,
    type: "Buy",
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingTransaction) {
      setEditingTransaction((prev) => ({ ...prev!, [name]: value }));
    } else {
      setNewTransaction((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (value: "Buy" | "Sell" | "Dividend") => {
    if (editingTransaction) {
      setEditingTransaction((prev) => ({ ...prev!, type: value }));
    } else {
      setNewTransaction((prev) => ({ ...prev, type: value }));
    }
  };

  const handleAddTransaction = () => {
    const total =
      newTransaction.type === "Dividend"
        ? Number(newTransaction.price)
        : Number(newTransaction.quantity) * Number(newTransaction.price);
    const transaction: Transaction = {
      id: transactions.length + 1,
      ...newTransaction,
      quantity:
        newTransaction.type === "Dividend"
          ? 0
          : Number(newTransaction.quantity),
      price: Number(newTransaction.price),
      total,
    };
    setTransactions((prev) => [...prev, transaction]);
    setNewTransaction({
      date: "",
      symbol: "",
      quantity: 0,
      price: 0,
      type: "Buy",
    });
    setIsAddingTransaction(false);
    toast.success("Transaction added successfully!");
  };

  const handleEditTransaction = () => {
    if (!editingTransaction) return;
    const total =
      editingTransaction.type === "Dividend"
        ? editingTransaction.price
        : editingTransaction.quantity * editingTransaction.price;
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === editingTransaction.id ? { ...editingTransaction, total } : t
      )
    );
    setEditingTransaction(null);
    toast.success("Transaction updated successfully!");
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast.success("Transaction deleted successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster position="top-right" />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold leading-tight text-foreground">
              Transactions
            </h1>
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
                      onValueChange={handleTypeChange}
                      value={newTransaction.type}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buy">Buy</SelectItem>
                        <SelectItem value="Sell">Sell</SelectItem>
                        <SelectItem value="Dividend">Dividend</SelectItem>
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
                    <Label htmlFor="price" className="text-right">
                      {newTransaction.type === "Dividend" ? "Amount" : "Price"}
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={newTransaction.price}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTransaction}>
                    Save Transaction
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                A list of your recent transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price/Amount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.symbol}</TableCell>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>
                        {transaction.type === "Dividend"
                          ? "-"
                          : transaction.quantity}
                      </TableCell>
                      <TableCell>${transaction.price.toFixed(2)}</TableCell>
                      <TableCell>${transaction.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  setEditingTransaction(transaction)
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Transaction</DialogTitle>
                                <DialogDescription>
                                  Make changes to your transaction here. Click
                                  save when you're done.
                                </DialogDescription>
                              </DialogHeader>
                              {editingTransaction && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label
                                      htmlFor="edit-date"
                                      className="text-right"
                                    >
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
                                    <Label
                                      htmlFor="edit-symbol"
                                      className="text-right"
                                    >
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
                                    <Label
                                      htmlFor="edit-type"
                                      className="text-right"
                                    >
                                      Type
                                    </Label>
                                    <Select
                                      onValueChange={handleTypeChange}
                                      value={editingTransaction.type}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select transaction type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Buy">Buy</SelectItem>
                                        <SelectItem value="Sell">
                                          Sell
                                        </SelectItem>
                                        <SelectItem value="Dividend">
                                          Dividend
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {editingTransaction.type !== "Dividend" && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="edit-quantity"
                                        className="text-right"
                                      >
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
                                    <Label
                                      htmlFor="edit-price"
                                      className="text-right"
                                    >
                                      {editingTransaction.type === "Dividend"
                                        ? "Amount"
                                        : "Price"}
                                    </Label>
                                    <Input
                                      id="edit-price"
                                      name="price"
                                      type="number"
                                      value={editingTransaction.price}
                                      onChange={handleInputChange}
                                      className="col-span-3"
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button onClick={handleEditTransaction}>
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
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
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
