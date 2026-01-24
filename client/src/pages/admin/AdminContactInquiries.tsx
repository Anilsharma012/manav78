import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Eye, Mail, Trash2 } from "lucide-react";

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "pending" | "read" | "replied";
  adminNotes?: string;
  createdAt: string;
}

export default function AdminContactInquiries() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: inquiries = [], isLoading } = useQuery<ContactInquiry[]>({
    queryKey: ["/api/admin/contact-inquiries"],
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest("PATCH", `/api/admin/contact-inquiries/${id}`, { status, adminNotes: notes });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Inquiry updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-inquiries"] });
      setViewDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/contact-inquiries/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Inquiry deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-inquiries"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const updateStatus = (id: number, status: string, notes?: string) => {
    updateMutation.mutate({ id, status, notes });
  };

  const deleteInquiry = (id: number) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    deleteMutation.mutate(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "replied": return <Badge className="bg-green-500">Replied</Badge>;
      case "read": return <Badge className="bg-blue-500">Read</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const openViewDialog = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotes(inquiry.adminNotes || "");
    setViewDialogOpen(true);
    if (inquiry.status === "pending") {
      updateStatus(inquiry.id, "read");
    }
  };

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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Contact Inquiries</h1>
          <Badge variant="outline" data-testid="badge-count">{inquiries.length} Total</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : inquiries.length === 0 ? (
          <Card data-testid="card-empty-state">
            <CardContent className="py-12 text-center text-muted-foreground">
              No contact inquiries yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4" data-testid="list-inquiries">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} data-testid={`card-inquiry-${inquiry.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold" data-testid={`text-name-${inquiry.id}`}>{inquiry.name}</span>
                        {getStatusBadge(inquiry.status)}
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-email-${inquiry.id}`}>{inquiry.email}</p>
                      <p className="text-sm font-medium" data-testid={`text-subject-${inquiry.id}`}>Subject: {inquiry.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-message-${inquiry.id}`}>{inquiry.message}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="icon" variant="outline" onClick={() => openViewDialog(inquiry)} data-testid={`button-view-${inquiry.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" asChild data-testid={`button-email-${inquiry.id}`}>
                        <a href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => deleteInquiry(inquiry.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-${inquiry.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col" data-testid="dialog-inquiry-details">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl">Contact Inquiry Details</DialogTitle>
            </DialogHeader>
            {selectedInquiry && (
              <div className="flex-1 overflow-y-auto space-y-6 p-4">
                {/* Inquiry Header */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground" data-testid="text-detail-name">{selectedInquiry.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Submitted: {new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      {getStatusBadge(selectedInquiry.status)}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Email</p>
                      <a href={`mailto:${selectedInquiry.email}`} className="text-sm text-primary hover:underline break-all" data-testid="text-detail-email">{selectedInquiry.email}</a>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-sm font-medium" data-testid="text-detail-phone">
                        {selectedInquiry.phone ? (
                          <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">{selectedInquiry.phone}</a>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Subject</h4>
                  <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
                    <p className="text-sm font-medium" data-testid="text-detail-subject">{selectedInquiry.subject}</p>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Message</h4>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" data-testid="text-detail-message">{selectedInquiry.message}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-semibold text-foreground">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add your notes about this inquiry..."
                    className="bg-card border-border min-h-24"
                    data-testid="input-admin-notes"
                  />
                </div>

                {/* Status Update */}
                <div className="space-y-2 border-t pt-4">
                  <label className="text-sm font-semibold text-foreground">Update Status</label>
                  <Select defaultValue={selectedInquiry.status} onValueChange={(value) => updateStatus(selectedInquiry.id, value, adminNotes)}>
                    <SelectTrigger className="bg-card border-border" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="read">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Read
                        </div>
                      </SelectItem>
                      <SelectItem value="replied">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Replied
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 border-t pt-4">
                  <Button asChild className="flex-1" data-testid="button-reply">
                    <a href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Reply via Email
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
