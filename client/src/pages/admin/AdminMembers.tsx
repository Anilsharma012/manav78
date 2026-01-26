import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Users, Search, CheckCircle, XCircle, Clock, Filter, Eye, Loader2, IdCard, Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Member {
  _id: string;
  id?: string;
  email: string;
  fullName: string;
  phone: string;
  address?: string;
  city?: string;
  membershipType: string;
  membershipNumber?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentTransaction {
  id: string;
  type: string;
  transactionId: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface MemberDetails {
  member: Member;
  transactions: PaymentTransaction[];
  iCard?: {
    id: string;
    cardNumber: string;
  };
}

export default function AdminMembers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerified, setFilterVerified] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<MemberDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [memberToVerify, setMemberToVerify] = useState<Member | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["/api/admin/members"],
  });

  const verifyMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest("PATCH", `/api/admin/members/${memberId}`, { isVerified: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      toast({ title: "Success", description: "Member verified successfully" });
      setIsVerifyDialogOpen(false);
      setMemberToVerify(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to verify member", variant: "destructive" });
    },
  });

  const generateICardMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest("POST", `/api/admin/members/${memberId}/generate-icard`, {});
    },
    onSuccess: (data) => {
      if (selectedMember) {
        setSelectedMember({
          ...selectedMember,
          iCard: data.iCard
        });
      }
      toast({ title: "Success", description: "I-Card generated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate I-Card", variant: "destructive" });
    },
  });

  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.membershipNumber?.includes(searchTerm);
    const matchesFilter = filterVerified === "all" || (filterVerified === "verified" ? m.isVerified : !m.isVerified);
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMembers.map(m => m._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} member(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/members/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        toast({ title: "Success", description: `${selectedIds.size} member(s) deleted successfully` });
        setSelectedIds(new Set());
        queryClient.invalidateQueries({ queryKey: ["/api/admin/members"] });
      } else {
        throw new Error("Failed to delete members");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete members", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (isVerified: boolean) => {
    if (isVerified) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  const handleViewDetails = async (member: Member) => {
    try {
      const token = localStorage.getItem("auth_token");
      const memberId = member._id || member.id;
      const res = await fetch(`/api/admin/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedMember(data);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
      toast({ title: "Error", description: "Failed to fetch member details", variant: "destructive" });
    }
  };

  const handleVerifyClick = (member: Member) => {
    setMemberToVerify(member);
    setIsVerifyDialogOpen(true);
  };

  const handleConfirmVerify = () => {
    if (memberToVerify) {
      const memberId = memberToVerify._id || memberToVerify.id;
      verifyMutation.mutate(memberId);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Members / सदस्य
            </h1>
            <p className="text-muted-foreground">Manage registered members and verify accounts</p>
          </div>
          {selectedIds.size > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isDeleting} data-testid="button-bulk-delete">
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete ({selectedIds.size})
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Member List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, phone, or membership number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterVerified} onValueChange={setFilterVerified}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={filteredMembers.length > 0 && selectedIds.size === filteredMembers.length}
                          onCheckedChange={toggleSelectAll}
                          data-testid="checkbox-select-all"
                        />
                      </TableHead>
                      <TableHead>Member Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Membership #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                          No members found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member._id || member.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedIds.has(member._id)}
                              onCheckedChange={() => toggleSelect(member._id)}
                              data-testid={`checkbox-member-${member._id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{member.fullName}</TableCell>
                          <TableCell className="text-sm">{member.email}</TableCell>
                          <TableCell className="text-sm">{member.phone}</TableCell>
                          <TableCell className="font-mono text-sm">{member.membershipNumber || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(member.isVerified)}</TableCell>
                          <TableCell className="text-sm">{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(member)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!member.isVerified && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleVerifyClick(member)}
                                className="bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
                  <div>
                    <Label className="text-muted-foreground text-sm">Name</Label>
                    <p className="font-medium">{selectedMember.member.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Email</Label>
                    <p className="font-medium text-sm">{selectedMember.member.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Phone</Label>
                    <p className="font-medium">{selectedMember.member.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">City</Label>
                    <p className="font-medium">{selectedMember.member.city || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Address</Label>
                    <p className="font-medium text-sm">{selectedMember.member.address || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Membership Number</Label>
                    <p className="font-mono font-medium">{selectedMember.member.membershipNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Status</Label>
                    <p className="font-medium">{getStatusBadge(selectedMember.member.isVerified)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Registered Date</Label>
                    <p className="font-medium text-sm">{new Date(selectedMember.member.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Payment Transactions</h3>
                {selectedMember.transactions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No payment transactions</p>
                ) : (
                  <div className="space-y-2">
                    {selectedMember.transactions.map((transaction) => (
                      <div key={transaction.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">Transaction ID: <span className="font-mono text-xs">{transaction.transactionId}</span></p>
                            <p className="text-sm text-muted-foreground">Amount: <span className="font-semibold">₹{transaction.amount}</span></p>
                            <p className="text-xs text-muted-foreground">Type: {transaction.type}</p>
                          </div>
                          <div className="text-right">
                            {getPaymentStatusBadge(transaction.status)}
                            <p className="text-xs text-muted-foreground mt-1">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedMember.member.isVerified && (
                <div>
                  <h3 className="font-semibold mb-3">I-Card Status</h3>
                  {selectedMember.iCard ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900 dark:text-green-200">I-Card Generated</p>
                          <p className="text-sm text-green-800 dark:text-green-300">Card Number: {selectedMember.iCard.cardNumber}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-900 dark:text-amber-200">I-Card Not Generated</p>
                          <p className="text-sm text-amber-800 dark:text-amber-300">Click the button below to generate the I-Card</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedMember && selectedMember.member.isVerified && !selectedMember.iCard && (
              <Button
                onClick={() => {
                  const memberId = selectedMember.member._id || selectedMember.member.id;
                  generateICardMutation.mutate(memberId);
                }}
                disabled={generateICardMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {generateICardMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <IdCard className="h-4 w-4 mr-2" />
                    Generate I-Card
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Member Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Member</DialogTitle>
          </DialogHeader>
          {memberToVerify && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><span className="font-semibold">Name:</span> {memberToVerify.fullName}</p>
                <p><span className="font-semibold">Email:</span> {memberToVerify.email}</p>
                <p><span className="font-semibold">Phone:</span> {memberToVerify.phone}</p>
                <p><span className="font-semibold">Membership #:</span> {memberToVerify.membershipNumber || 'N/A'}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to verify this member? They will be able to login with their email and password after verification.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmVerify} 
              disabled={verifyMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
