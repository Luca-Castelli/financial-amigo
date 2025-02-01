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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { users, accounts } from "@/lib/api";
import type { Account } from "@/lib/api";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth-context";

type AccountType = "TFSA" | "RRSP" | "FHSA" | "NON_REGISTERED";
interface CreateAccountData {
  name: string;
  type: AccountType;
  currency: "CAD" | "USD";
  description?: string;
  broker?: string;
  account_number?: string;
}

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState<"CAD" | "USD">("CAD");

  // Account management state
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isViewingAccount, setIsViewingAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Separate state for new account form
  const emptyAccountForm: CreateAccountData = {
    name: "",
    type: "NON_REGISTERED",
    currency: "CAD",
    description: "",
    broker: "",
    account_number: "",
  };

  const [newAccount, setNewAccount] =
    useState<CreateAccountData>(emptyAccountForm);
  const [editAccount, setEditAccount] =
    useState<CreateAccountData>(emptyAccountForm);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // Fetch user settings and accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, accountsResponse] = await Promise.all([
          users.me(),
          accounts.list(),
        ]);
        setDefaultCurrency(
          (userResponse.data.default_currency as "CAD" | "USD") || "CAD"
        );
        setAccountsList(accountsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load settings");
      }
    };

    fetchData();
  }, []);

  const handleCurrencyChange = async (value: "CAD" | "USD") => {
    setIsLoading(true);
    try {
      await users.updateSettings({ default_currency: value });
      setDefaultCurrency(value);
      toast.success("Default currency updated successfully");
    } catch (error) {
      console.error("Failed to update currency:", error);
      toast.error("Failed to update currency");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newAccount.name) {
      toast.error("Account name is required");
      return;
    }

    try {
      const response = await accounts.create(newAccount);
      setAccountsList((prev: Account[]) => [...prev, response.data]);
      setIsAddingAccount(false);
      setNewAccount(emptyAccountForm);
      toast.success("Account created successfully");
    } catch (error) {
      console.error("Failed to create account:", error);
      toast.error("Failed to create account");
    }
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;
    if (!editAccount.name) {
      toast.error("Account name is required");
      return;
    }

    try {
      const response = await accounts.update(selectedAccount.id, {
        name: editAccount.name,
        description: editAccount.description,
        broker: editAccount.broker,
        account_number: editAccount.account_number,
      });
      setAccountsList((prev: Account[]) =>
        prev.map((acc: Account) =>
          acc.id === response.data.id ? response.data : acc
        )
      );
      setIsViewingAccount(false);
      setSelectedAccount(response.data);
      setEditAccount(emptyAccountForm);
      toast.success("Account updated successfully");
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account");
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    if (deleteConfirmation !== selectedAccount.name) {
      toast.error("Please type the account name correctly to confirm deletion");
      return;
    }

    try {
      await accounts.delete(selectedAccount.id);
      setAccountsList((prev: Account[]) =>
        prev.filter((acc: Account) => acc.id !== selectedAccount.id)
      );
      setIsDeletingAccount(false);
      setSelectedAccount(null);
      setDeleteConfirmation("");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
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
      <Header />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight">Settings</h1>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* User Profile Card */}
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
                      <Input id="name" value={user?.name || ""} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user?.email || ""} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select
                        value={defaultCurrency}
                        onValueChange={handleCurrencyChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAD">
                            Canadian Dollar (CAD)
                          </SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Accounts Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Accounts</CardTitle>
                    <CardDescription>
                      Manage your investment accounts
                    </CardDescription>
                  </div>
                  <Dialog
                    open={isAddingAccount}
                    onOpenChange={(open) => {
                      setIsAddingAccount(open);
                      if (!open) setNewAccount(emptyAccountForm);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button>Add Account</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Account</DialogTitle>
                        <DialogDescription>
                          Enter the details of your new investment account.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={newAccount.name}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                name: e.target.value,
                              })
                            }
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Description
                          </Label>
                          <Input
                            id="description"
                            value={newAccount.description}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                description: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Optional"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right">
                            Type
                          </Label>
                          <Select
                            value={newAccount.type}
                            onValueChange={(value: AccountType) =>
                              setNewAccount({ ...newAccount, type: value })
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TFSA">TFSA</SelectItem>
                              <SelectItem value="RRSP">RRSP</SelectItem>
                              <SelectItem value="FHSA">FHSA</SelectItem>
                              <SelectItem value="NON_REGISTERED">
                                Non-Registered
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="currency" className="text-right">
                            Currency
                          </Label>
                          <Select
                            value={newAccount.currency}
                            onValueChange={(value) =>
                              setNewAccount({ ...newAccount, currency: value })
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CAD">
                                Canadian Dollar (CAD)
                              </SelectItem>
                              <SelectItem value="USD">
                                US Dollar (USD)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="broker" className="text-right">
                            Broker
                          </Label>
                          <Input
                            id="broker"
                            value={newAccount.broker}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                broker: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Optional"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="account_number"
                            className="text-right"
                          >
                            Account #
                          </Label>
                          <Input
                            id="account_number"
                            value={newAccount.account_number}
                            onChange={(e) =>
                              setNewAccount({
                                ...newAccount,
                                account_number: e.target.value,
                              })
                            }
                            className="col-span-3"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddingAccount(false);
                            setNewAccount(emptyAccountForm);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAccount}>Create</Button>
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
                      <TableHead>Broker</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Currency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountsList.map((account) => (
                      <TableRow
                        key={account.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedAccount(account);
                          setEditAccount({
                            ...account,
                            type: account.type,
                          });
                          setIsViewingAccount(true);
                        }}
                      >
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.broker || "-"}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell>{account.currency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* View/Edit Account Dialog */}
      <Dialog
        open={isViewingAccount}
        onOpenChange={(open) => {
          setIsViewingAccount(open);
          if (!open) setEditAccount(emptyAccountForm);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="view-name" className="text-right">
                Name
              </Label>
              <Input
                id="view-name"
                value={editAccount.name}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="view-broker" className="text-right">
                Broker
              </Label>
              <Input
                id="view-broker"
                value={editAccount.broker}
                onChange={(e) =>
                  setEditAccount({ ...editAccount, broker: e.target.value })
                }
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="view-type" className="text-right">
                Type
              </Label>
              <div className="col-span-3">{editAccount.type}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="view-currency" className="text-right">
                Currency
              </Label>
              <div className="col-span-3">{editAccount.currency}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="view-account-number" className="text-right">
                Account #
              </Label>
              <Input
                id="view-account-number"
                value={editAccount.account_number}
                onChange={(e) =>
                  setEditAccount({
                    ...editAccount,
                    account_number: e.target.value,
                  })
                }
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="view-description" className="text-right">
                Description
              </Label>
              <Input
                id="view-description"
                value={editAccount.description}
                onChange={(e) =>
                  setEditAccount({
                    ...editAccount,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="destructive"
              onClick={() => {
                setIsViewingAccount(false);
                setIsDeletingAccount(true);
              }}
            >
              Delete Account
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewingAccount(false);
                  setEditAccount(emptyAccountForm);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateAccount}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeletingAccount} onOpenChange={setIsDeletingAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription className="text-destructive">
              This action cannot be undone. This will permanently delete the
              account and all associated data (holdings, transactions, etc.).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              Please type <strong>{newAccount.name}</strong> to confirm
              deletion:
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type account name to confirm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeletingAccount(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== newAccount.name}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
