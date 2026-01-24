import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Search, Check, X } from "lucide-react";

const feeLevels = [
  { id: "village", name: "Village Level", amount: 99 },
  { id: "block", name: "Block Level", amount: 199 },
  { id: "district", name: "District Level", amount: 299 },
  { id: "haryana", name: "Haryana Level", amount: 399 },
];

interface Student {
  id: number;
  email?: string;
  registrationNumber: string;
  fullName: string;
  feeLevel: string;
  feeAmount: number;
  feePaid: boolean;
}

interface PaymentTransaction {
  id: string;
  type: string;
  name: string;
  email?: string;
  phone: string;
  amount: number;
  transactionId: string;
  paymentMethod?: string;
  purpose?: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export default function AdminFees() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openVerifyModal = async (student: Student) => {
    setSelectedStudent(student);
    setLoadingTransactions(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/admin/payment-transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const allTransactions = await res.json();
        const studentTransactions = allTransactions.filter(
          (t: PaymentTransaction) =>
            (student.email && t.email === student.email) ||
            t.name === student.fullName ||
            t.type === 'fee'
        );
        setTransactions(studentTransactions);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast({ title: "Error", description: "Failed to load payment details" });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const confirmVerifyPayment = async () => {
    if (!selectedStudent) return;
    setVerifyingPayment(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/students/${selectedStudent.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          feePaid: true,
          paymentDate: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Failed to verify");

      setStudents(students.map(s =>
        s.id === selectedStudent.id ? { ...s, feePaid: true } : s
      ));
      toast({ title: "Payment Verified", description: "भुगतान सत्यापित" });
      setSelectedStudent(null);
      setTransactions([]);
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({ title: "Error", description: "Failed to verify payment" });
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleUpdateFeeLevel = async (studentId: string, feeLevel: string) => {
    const selectedFee = feeLevels.find(f => f.id === feeLevel);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          feeLevel,
          feeAmount: selectedFee?.amount,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setStudents(students.map(s =>
        s.id === studentId ? { ...s, feeLevel, feeAmount: selectedFee?.amount || 99 } : s
      ));
      toast({ title: "Fee Level Updated", description: `Rs.${selectedFee?.amount}` });
    } catch (error) {
      console.error("Error updating fee level:", error);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" ||
      (filterStatus === "paid" && s.feePaid) ||
      (filterStatus === "pending" && !s.feePaid);
    return matchesSearch && matchesFilter;
  });

  const totalCollected = students.filter(s => s.feePaid).reduce((acc, s) => acc + (s.feeAmount || 99), 0);
  const pendingCount = students.filter(s => !s.feePaid).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Fees Management
          </h1>
          <p className="text-muted-foreground">शुल्क प्रबंधन (Rs.99, Rs.199, Rs.299, Rs.399)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600" data-testid="text-total-collected">Rs.{totalCollected.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Collected / कुल प्राप्त</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600" data-testid="text-pending-count">{pendingCount}</div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold" data-testid="text-total-students">{students.length}</div>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40" data-testid="select-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Records ({filteredStudents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Fee Level</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} data-testid={`row-fee-${student.id}`}>
                        <TableCell className="font-medium">{student.registrationNumber}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>
                          <Select
                            value={student.feeLevel || "village"}
                            onValueChange={(v) => handleUpdateFeeLevel(student.id, v)}
                          >
                            <SelectTrigger className="w-36" data-testid={`select-fee-level-${student.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {feeLevels.map(l => (
                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>Rs.{student.feeAmount || 99}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            student.feePaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          }`}>
                            {student.feePaid ? "Paid" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {!student.feePaid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openVerifyModal(student)}
                              data-testid={`button-verify-${student.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verify Payment - {selectedStudent?.fullName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Registration Number</p>
                <p className="text-lg font-bold">{selectedStudent?.registrationNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Fee Level</p>
                <p className="text-lg font-bold">{selectedStudent?.feeLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Fee Amount</p>
                <p className="text-lg font-bold text-green-600">Rs.{selectedStudent?.feeAmount || 99}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Status</p>
                <p className="text-lg font-bold text-orange-600">Pending</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-base mb-3">Payment Transactions ({transactions.length})</h3>

              {loadingTransactions ? (
                <p className="text-center py-8 text-muted-foreground">Loading payment details...</p>
              ) : transactions.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    No payment transactions found for this student. You can still manually verify the payment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4 space-y-2 hover:bg-slate-50 transition">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Transaction ID</p>
                          <p className="font-mono text-sm font-semibold">{transaction.transactionId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Status</p>
                          <p className={`text-sm font-semibold ${
                            transaction.status === 'approved' ? 'text-green-600' :
                            transaction.status === 'rejected' ? 'text-red-600' :
                            'text-amber-600'
                          }`}>
                            {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Amount</p>
                          <p className="font-bold text-lg">Rs.{transaction.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Payment Method</p>
                          <p className="text-sm font-semibold">{transaction.paymentMethod || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Type</p>
                          <p className="text-sm font-semibold capitalize">{transaction.type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Phone</p>
                          <p className="text-sm font-semibold">{transaction.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Purpose</p>
                          <p className="text-sm">{transaction.purpose || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold">Date</p>
                          <p className="text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                        </div>
                        {transaction.email && (
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold">Email</p>
                            <p className="text-sm">{transaction.email}</p>
                          </div>
                        )}
                        {transaction.approvedAt && (
                          <div>
                            <p className="text-xs text-muted-foreground font-semibold">Approved At</p>
                            <p className="text-sm">{new Date(transaction.approvedAt).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setSelectedStudent(null)}
              disabled={verifyingPayment}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={confirmVerifyPayment}
              disabled={verifyingPayment}
            >
              <Check className="h-4 w-4 mr-2" />
              {verifyingPayment ? "Verifying..." : "Confirm Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
