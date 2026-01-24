import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Eye, Check, X, Trash2, User, UserCheck } from "lucide-react";

interface VolunteerApplication {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  occupation?: string;
  skills?: string;
  availability?: string;
  message?: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  createdAt: string;
}

interface VolunteerAccount {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  occupation?: string;
  skills?: string;
  availability?: string;
  photoUrl?: string;
  isActive: boolean;
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
}

export default function AdminVolunteers() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplication | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<VolunteerAccount | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: applications = [], isLoading: loadingApplications } = useQuery<VolunteerApplication[]>({
    queryKey: ["/api/admin/volunteers"],
    enabled: !!token,
  });

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<VolunteerAccount[]>({
    queryKey: ["/api/admin/volunteer-accounts"],
    enabled: !!token,
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      return apiRequest("PATCH", `/api/admin/volunteers/${id}`, { status, adminNotes: notes });
    },
    onSuccess: () => {
      toast({ title: "Success / सफल", description: "Application status updated / आवेदन की स्थिति अपडेट की गई" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteers"] });
      setViewDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error / त्रुटि", description: "Failed to update status / स्थिति अपडेट करने में विफल", variant: "destructive" });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ id, isApproved, isActive }: { id: number; isApproved?: boolean; isActive?: boolean }) => {
      const payload: { isApproved?: boolean; isActive?: boolean } = {};
      if (isApproved !== undefined) payload.isApproved = isApproved;
      if (isActive !== undefined) payload.isActive = isActive;
      return apiRequest("PATCH", `/api/admin/volunteer-accounts/${id}`, payload);
    },
    onSuccess: () => {
      toast({ title: "Success / सफल", description: "Volunteer account updated / स्वयंसेवक खाता अपडेट किया गया" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteer-accounts"] });
      setAccountDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error / त्रुटि", description: "Failed to update account / खाता अपडेट करने में विफल", variant: "destructive" });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/volunteers/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success / सफल", description: "Application deleted / आवेदन हटाया गया" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteers"] });
    },
    onError: () => {
      toast({ title: "Error / त्रुटि", description: "Failed to delete / हटाने में विफल", variant: "destructive" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/volunteer-accounts/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success / सफल", description: "Volunteer account deleted / स्वयंसेवक खाता हटाया गया" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/volunteer-accounts"] });
      setAccountDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error / त्रुटि", description: "Failed to delete account / खाता हटाने में विफल", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500">Approved / स्वीकृत</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected / अस्वीकृत</Badge>;
      default: return <Badge variant="secondary">Pending / लंबित</Badge>;
    }
  };

  const getAccountStatusBadge = (account: VolunteerAccount) => {
    if (!account.isActive) {
      return <Badge variant="destructive">Inactive / निष्क्रिय</Badge>;
    }
    if (account.isApproved) {
      return <Badge className="bg-green-500">Approved / स्वीकृत</Badge>;
    }
    return <Badge variant="secondary">Pending / लंबित</Badge>;
  };

  if (!token) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground" data-testid="text-auth-required">Please log in to access this page. / कृपया इस पृष्ठ तक पहुँचने के लिए लॉगिन करें।</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Volunteers / स्वयंसेवक</h1>
        </div>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="accounts" data-testid="tab-accounts">
              <UserCheck className="w-4 h-4 mr-2" />
              Accounts ({accounts.length})
            </TabsTrigger>
            <TabsTrigger value="applications" data-testid="tab-applications">
              <User className="w-4 h-4 mr-2" />
              Applications ({applications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Volunteers / पंजीकृत स्वयंसेवक</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAccounts ? (
                  <div className="flex items-center justify-center py-12" data-testid="loading-accounts">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground" data-testid="text-no-accounts">
                    No registered volunteer accounts yet / अभी तक कोई पंजीकृत स्वयंसेवक खाता नहीं है
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="list-accounts">
                    {accounts.map((account) => (
                      <div key={account.id} className="p-4 border rounded-md bg-muted/30" data-testid={`card-account-${account.id}`}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold" data-testid={`text-account-name-${account.id}`}>{account.fullName}</span>
                              {getAccountStatusBadge(account)}
                            </div>
                            <p className="text-sm text-muted-foreground" data-testid={`text-account-email-${account.id}`}>{account.email}</p>
                            {account.phone && <p className="text-sm text-muted-foreground">{account.phone}</p>}
                            {account.city && <p className="text-sm text-muted-foreground">{account.city}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button size="icon" variant="outline" onClick={() => { setSelectedAccount(account); setAccountDialogOpen(true); }} data-testid={`button-view-account-${account.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!account.isApproved && (
                              <Button size="icon" variant="outline" className="text-green-600" onClick={() => updateAccountMutation.mutate({ id: account.id, isApproved: true })} disabled={updateAccountMutation.isPending} data-testid={`button-approve-account-${account.id}`}>
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="outline" className={account.isActive ? "text-red-600" : "text-green-600"} onClick={() => updateAccountMutation.mutate({ id: account.id, isActive: !account.isActive })} disabled={updateAccountMutation.isPending} data-testid={`button-toggle-active-${account.id}`}>
                              {account.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => { if (confirm("Are you sure? / क्या आप सुनिश्चित हैं?")) deleteAccountMutation.mutate(account.id); }} disabled={deleteAccountMutation.isPending} data-testid={`button-delete-account-${account.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Applications / स्वयंसेवक आवेदन</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingApplications ? (
                  <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground" data-testid="card-empty-state">
                    No volunteer applications yet / अभी तक कोई स्वयंसेवक आवेदन नहीं है
                  </div>
                ) : (
                  <div className="space-y-3" data-testid="list-volunteers">
                    {applications.map((volunteer) => (
                      <div key={volunteer.id} className="p-4 border rounded-md bg-muted/30" data-testid={`card-volunteer-${volunteer.id}`}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold" data-testid={`text-name-${volunteer.id}`}>{volunteer.fullName}</span>
                              {getStatusBadge(volunteer.status)}
                            </div>
                            <p className="text-sm text-muted-foreground" data-testid={`text-email-${volunteer.id}`}>{volunteer.email}</p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-phone-${volunteer.id}`}>{volunteer.phone}</p>
                            {volunteer.city && <p className="text-sm text-muted-foreground">{volunteer.city}</p>}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button size="icon" variant="outline" onClick={() => { setSelectedApplication(volunteer); setAdminNotes(volunteer.adminNotes || ""); setViewDialogOpen(true); }} data-testid={`button-view-${volunteer.id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="text-green-600" onClick={() => updateApplicationMutation.mutate({ id: volunteer.id, status: "approved" })} disabled={updateApplicationMutation.isPending} data-testid={`button-approve-${volunteer.id}`}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="text-red-600" onClick={() => updateApplicationMutation.mutate({ id: volunteer.id, status: "rejected" })} disabled={updateApplicationMutation.isPending} data-testid={`button-reject-${volunteer.id}`}>
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => { if (confirm("Are you sure? / क्या आप सुनिश्चित हैं?")) deleteApplicationMutation.mutate(volunteer.id); }} disabled={deleteApplicationMutation.isPending} data-testid={`button-delete-${volunteer.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg" data-testid="dialog-volunteer-details">
            <DialogHeader>
              <DialogTitle>Volunteer Application / स्वयंसेवक आवेदन</DialogTitle>
              <DialogDescription>View and manage volunteer application details</DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Name / नाम:</strong> <span data-testid="text-detail-name">{selectedApplication.fullName}</span></div>
                  <div><strong>Email / ईमेल:</strong> <span data-testid="text-detail-email">{selectedApplication.email}</span></div>
                  <div><strong>Phone / फोन:</strong> <span data-testid="text-detail-phone">{selectedApplication.phone}</span></div>
                  <div><strong>City / शहर:</strong> <span data-testid="text-detail-city">{selectedApplication.city || "N/A"}</span></div>
                  <div><strong>Occupation / व्यवसाय:</strong> <span data-testid="text-detail-occupation">{selectedApplication.occupation || "N/A"}</span></div>
                  <div><strong>Availability / उपलब्धता:</strong> <span data-testid="text-detail-availability">{selectedApplication.availability || "N/A"}</span></div>
                </div>
                {selectedApplication.skills && (
                  <div><strong>Skills / कौशल:</strong> <span data-testid="text-detail-skills">{selectedApplication.skills}</span></div>
                )}
                {selectedApplication.message && (
                  <div><strong>Message / संदेश:</strong> <span data-testid="text-detail-message">{selectedApplication.message}</span></div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Notes / व्यवस्थापक नोट्स</label>
                  <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add notes... / नोट्स जोड़ें..." data-testid="input-admin-notes" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" className="text-green-600" onClick={() => updateApplicationMutation.mutate({ id: selectedApplication.id, status: "approved", notes: adminNotes })} disabled={updateApplicationMutation.isPending} data-testid="button-dialog-approve">
                    <Check className="h-4 w-4 mr-2" /> Approve / स्वीकृत
                  </Button>
                  <Button variant="outline" className="text-red-600" onClick={() => updateApplicationMutation.mutate({ id: selectedApplication.id, status: "rejected", notes: adminNotes })} disabled={updateApplicationMutation.isPending} data-testid="button-dialog-reject">
                    <X className="h-4 w-4 mr-2" /> Reject / अस्वीकृत
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
          <DialogContent className="max-w-lg" data-testid="dialog-account-details">
            <DialogHeader>
              <DialogTitle>Volunteer Account / स्वयंसेवक खाता</DialogTitle>
              <DialogDescription>View and manage volunteer account details</DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {selectedAccount.photoUrl && (
                    <img src={selectedAccount.photoUrl} alt={selectedAccount.fullName} className="w-16 h-16 rounded-full object-cover" />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{selectedAccount.fullName}</h3>
                    {getAccountStatusBadge(selectedAccount)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Email / ईमेल:</strong> {selectedAccount.email}</div>
                  <div><strong>Phone / फोन:</strong> {selectedAccount.phone || "N/A"}</div>
                  <div><strong>City / शहर:</strong> {selectedAccount.city || "N/A"}</div>
                  <div><strong>Address / पता:</strong> {selectedAccount.address || "N/A"}</div>
                  <div><strong>Occupation / व्यवसाय:</strong> {selectedAccount.occupation || "N/A"}</div>
                  <div><strong>Availability / उपलब्धता:</strong> {selectedAccount.availability || "N/A"}</div>
                </div>
                {selectedAccount.skills && (
                  <div><strong>Skills / कौशल:</strong> {selectedAccount.skills}</div>
                )}
                <div className="flex gap-2 flex-wrap pt-4">
                  {!selectedAccount.isApproved && (
                    <Button variant="outline" className="text-green-600" onClick={() => updateAccountMutation.mutate({ id: selectedAccount.id, isApproved: true })} disabled={updateAccountMutation.isPending} data-testid="button-dialog-approve-account">
                      <Check className="h-4 w-4 mr-2" /> Approve / स्वीकृत
                    </Button>
                  )}
                  <Button variant="outline" className={selectedAccount.isActive ? "text-red-600" : "text-green-600"} onClick={() => updateAccountMutation.mutate({ id: selectedAccount.id, isActive: !selectedAccount.isActive })} disabled={updateAccountMutation.isPending} data-testid="button-dialog-toggle-active">
                    {selectedAccount.isActive ? (
                      <><X className="h-4 w-4 mr-2" /> Deactivate / निष्क्रिय</>
                    ) : (
                      <><Check className="h-4 w-4 mr-2" /> Activate / सक्रिय</>
                    )}
                  </Button>
                  <Button variant="destructive" onClick={() => { if (confirm("Are you sure you want to delete this volunteer account? / क्या आप इस स्वयंसेवक खाते को हटाना सुनिश्चित हैं?")) deleteAccountMutation.mutate(selectedAccount.id); }} disabled={deleteAccountMutation.isPending} data-testid="button-dialog-delete-account">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete / हटाएं
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
