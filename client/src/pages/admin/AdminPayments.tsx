import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Edit, Trash2, QrCode, Building, Smartphone } from "lucide-react";

interface PaymentConfig {
  id: number;
  type: "donation" | "fee" | "membership" | "general";
  name: string;
  nameHindi?: string;
  qrCodeUrl?: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  level?: "village" | "block" | "district" | "haryana";
  isActive: boolean;
  order: number;
}

const typeOptions = [
  { value: "donation", label: "Donation" },
  { value: "fee", label: "Fee Payment" },
  { value: "membership", label: "Membership" },
  { value: "general", label: "General" },
];

const levelOptions = [
  { value: "village", label: "Village Level / ग्राम स्तर (₹99)" },
  { value: "block", label: "Block Level / ब्लॉक स्तर (₹199)" },
  { value: "district", label: "District Level / जिला स्तर (₹299)" },
  { value: "haryana", label: "Haryana Level / हरियाणा स्तर (₹399)" },
];

export default function AdminPayments() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null);
  const [form, setForm] = useState({
    type: "donation" as const,
    name: "",
    nameHindi: "",
    qrCodeUrl: "",
    upiId: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    level: "none" as "none" | "village" | "block" | "district" | "haryana",
    isActive: true,
    order: 0
  });

  const { data: configs = [], isLoading } = useQuery<PaymentConfig[]>({
    queryKey: ["/api/admin/payment-config"],
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("POST", "/api/admin/payment-config", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment config created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-config"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create payment config", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof form }) => {
      return apiRequest("PATCH", `/api/admin/payment-config/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment config updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-config"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update payment config", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/payment-config/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Payment config deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payment-config"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    // Convert "none" level to undefined for API
    const dataToSend = {
      ...form,
      level: form.level === "none" ? undefined : form.level
    };
    if (editingConfig) {
      updateMutation.mutate({ id: editingConfig.id, data: dataToSend as typeof form });
    } else {
      createMutation.mutate(dataToSend as typeof form);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this payment config?")) return;
    deleteMutation.mutate(id);
  };

  const openEditDialog = (config: PaymentConfig) => {
    setEditingConfig(config);
    setForm({
      type: config.type,
      name: config.name,
      nameHindi: config.nameHindi || "",
      qrCodeUrl: config.qrCodeUrl || "",
      upiId: config.upiId || "",
      bankName: config.bankName || "",
      accountNumber: config.accountNumber || "",
      ifscCode: config.ifscCode || "",
      accountHolderName: config.accountHolderName || "",
      level: config.level || "none",
      isActive: config.isActive,
      order: config.order
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingConfig(null);
    setForm({
      type: "donation",
      name: "",
      nameHindi: "",
      qrCodeUrl: "",
      upiId: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      level: "none",
      isActive: true,
      order: 0
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "donation": return "bg-green-500";
      case "fee": return "bg-blue-500";
      case "membership": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (!token) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground" data-testid="text-auth-required">Please log in to access this page.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Payment Configuration</h1>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-add-config">
            <Plus className="h-4 w-4 mr-2" /> Add Payment Method
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : configs.length === 0 ? (
          <Card data-testid="card-empty-state">
            <CardContent className="py-12 text-center text-muted-foreground">
              No payment configurations yet. Add QR codes, UPI IDs, or bank details.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2" data-testid="list-configs">
            {configs.map((config) => (
              <Card key={config.id} data-testid={`card-config-${config.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg" data-testid={`text-name-${config.id}`}>{config.name}</CardTitle>
                      <Badge className={getTypeColor(config.type)}>{config.type}</Badge>
                      {!config.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => openEditDialog(config)} data-testid={`button-edit-${config.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(config.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-${config.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {config.qrCodeUrl && (
                    <div className="flex items-center gap-2 text-sm" data-testid={`text-qr-${config.id}`}>
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      <span>QR Code configured</span>
                    </div>
                  )}
                  {config.upiId && (
                    <div className="flex items-center gap-2 text-sm" data-testid={`text-upi-${config.id}`}>
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span>{config.upiId}</span>
                    </div>
                  )}
                  {config.bankName && (
                    <div className="flex items-center gap-2 text-sm" data-testid={`text-bank-${config.id}`}>
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span>{config.bankName} - {config.accountNumber}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-config-form">
            <DialogHeader>
              <DialogTitle>{editingConfig ? "Edit Payment Config" : "Add Payment Method"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-type">Payment Type</Label>
                  <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                    <SelectTrigger id="payment-type" data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-level">Fee Level (if type is Fee)</Label>
                  <Select value={form.level} onValueChange={(v: any) => setForm({ ...form, level: v })}>
                    <SelectTrigger id="fee-level" data-testid="select-level">
                      <SelectValue placeholder="Select level (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {levelOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-order">Display Order</Label>
                <Input id="display-order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} data-testid="input-order" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name-en">Name (English)</Label>
                  <Input id="name-en" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="input-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name-hi">Name (Hindi)</Label>
                  <Input id="name-hi" value={form.nameHindi} onChange={(e) => setForm({ ...form, nameHindi: e.target.value })} data-testid="input-name-hindi" />
                </div>
              </div>

              <Tabs defaultValue="upi">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upi" data-testid="tab-upi">UPI</TabsTrigger>
                  <TabsTrigger value="qr" data-testid="tab-qr">QR Code</TabsTrigger>
                  <TabsTrigger value="bank" data-testid="tab-bank">Bank Transfer</TabsTrigger>
                </TabsList>
                <TabsContent value="upi" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="upi-id">UPI ID</Label>
                    <Input id="upi-id" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} placeholder="example@upi" data-testid="input-upi" />
                  </div>
                </TabsContent>
                <TabsContent value="qr" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-upload">Upload QR Code Image</Label>
                    <Input 
                      id="qr-upload" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setForm({ ...form, qrCodeUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      data-testid="input-qr-upload" 
                    />
                    <p className="text-xs text-muted-foreground">Upload QR code image (PNG, JPG) - it will be stored directly</p>
                    {form.qrCodeUrl && (
                      <div className="mt-2">
                        <img src={form.qrCodeUrl} alt="QR Preview" className="w-32 h-32 object-contain border rounded" />
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="bank" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input id="bank-name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} data-testid="input-bank" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holder-name">Account Holder Name</Label>
                      <Input id="holder-name" value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} data-testid="input-holder" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input id="account-number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} data-testid="input-account" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc-code">IFSC Code</Label>
                      <Input id="ifsc-code" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} data-testid="input-ifsc" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2">
                <Switch id="active" checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} data-testid="switch-active" />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !form.name.trim()} data-testid="button-save">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingConfig ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
