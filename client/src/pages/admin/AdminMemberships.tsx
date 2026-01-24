import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Search, Check, Download, X } from "lucide-react";

const membershipLevels = [
  { id: "regular", name: "Village Level / ग्राम स्तर", amount: 99 },
  { id: "block", name: "Block Level / ब्लॉक स्तर", amount: 199 },
  { id: "district", name: "District Level / जिला स्तर", amount: 299 },
  { id: "haryana", name: "Haryana Level / हरियाणा स्तर", amount: 399 },
];

interface Membership {
  id: number;
  memberName: string;
  memberPhone: string;
  memberEmail?: string;
  memberAddress?: string;
  membershipType?: string;
  membershipNumber?: string;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
}

export default function AdminMemberships() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    memberName: "",
    phone: "",
    email: "",
    address: "",
    membershipLevel: "regular",
    isActive: true,
  });

  useEffect(() => {
    loadMemberships();
  }, []);

  const loadMemberships = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/memberships", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMemberships(data);
      }
    } catch (error) {
      console.error("Error loading memberships:", error);
      toast({ title: "Error", description: "Failed to load memberships", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const validFrom = new Date().toISOString().split('T')[0];
      const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          memberName: formData.memberName,
          memberPhone: formData.phone,
          memberEmail: formData.email || null,
          memberAddress: formData.address || null,
          membershipType: formData.membershipLevel,
          isActive: formData.isActive,
          validFrom,
          validUntil,
        }),
      });

      if (!res.ok) throw new Error("Failed to create membership");

      const data = await res.json();
      toast({ title: "Membership Created", description: `Number: ${data.membershipNumber}` });
      setIsAddDialogOpen(false);
      setFormData({
        memberName: "", phone: "", email: "", address: "",
        membershipLevel: "regular", isActive: true
      });
      loadMemberships();
    } catch (error) {
      console.error("Error creating membership:", error);
      toast({ title: "Error", description: "Failed to create membership", variant: "destructive" });
    }
  };

  const handleVerify = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/memberships/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ isActive: true }),
      });

      if (!res.ok) throw new Error("Failed to verify");
      
      toast({ title: "Membership Verified", description: "सदस्यता सत्यापित" });
      loadMemberships();
    } catch (error) {
      console.error("Error verifying membership:", error);
      toast({ title: "Error", description: "Failed to verify membership", variant: "destructive" });
    }
  };

  const getAmount = (type?: string) => {
    const level = membershipLevels.find(l => l.id === type);
    return level?.amount || 99;
  };

  const filteredMemberships = memberships.filter(m => 
    m.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.membershipNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.memberPhone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600" />
              Memberships
            </h1>
            <p className="text-muted-foreground">सदस्यता प्रबंधन</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-membership"><Plus className="h-4 w-4 mr-2" />Add Membership</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Membership / नई सदस्यता</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Member Name / नाम *</Label>
                    <Input name="memberName" value={formData.memberName} onChange={handleChange} placeholder="सदस्य का नाम" data-testid="input-member-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone / मोबाइल *</Label>
                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="मोबाइल नंबर" data-testid="input-phone" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" data-testid="input-email" />
                </div>
                <div className="space-y-2">
                  <Label>Address / पता</Label>
                  <Textarea name="address" value={formData.address} onChange={handleChange} placeholder="पूरा पता" data-testid="input-address" />
                </div>
                <div className="space-y-2">
                  <Label>Membership Level</Label>
                  <Select value={formData.membershipLevel} onValueChange={(v) => setFormData({ ...formData, membershipLevel: v })}>
                    <SelectTrigger data-testid="select-membership-level"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {membershipLevels.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.name} - Rs.{l.amount}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSubmit} className="w-full" data-testid="button-create-membership">Create Membership</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, number or phone..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Memberships ({filteredMemberships.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membership No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMemberships.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No memberships found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMemberships.map((m) => (
                      <TableRow key={m.id} data-testid={`row-membership-${m.id}`}>
                        <TableCell className="font-medium">{m.membershipNumber}</TableCell>
                        <TableCell>{m.memberName}</TableCell>
                        <TableCell>{m.memberPhone}</TableCell>
                        <TableCell className="capitalize">{m.membershipType}</TableCell>
                        <TableCell>Rs.{getAmount(m.membershipType)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            m.isActive ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          }`}>
                            {m.isActive ? "Active" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!m.isActive && (
                              <Button size="sm" variant="outline" onClick={() => handleVerify(m.id)} data-testid={`button-verify-${m.id}`}>
                                <Check className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" data-testid={`button-download-${m.id}`}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
