import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";

interface ContentSection {
  id: number;
  sectionKey: string;
  title: string;
  titleHindi?: string;
  content: string;
  contentHindi?: string;
  imageUrls?: string[];
  isActive: boolean;
  order: number;
}

const sectionOptions = [
  { value: "about", label: "About Us" },
  { value: "services", label: "Services" },
  { value: "gallery", label: "Gallery" },
  { value: "events", label: "Events" },
  { value: "joinUs", label: "Join Us" },
  { value: "contact", label: "Contact" },
  { value: "volunteer", label: "Volunteer" },
];

export default function AdminContent() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [form, setForm] = useState({
    sectionKey: "about",
    title: "",
    titleHindi: "",
    content: "",
    contentHindi: "",
    isActive: true,
    order: 0
  });

  const { data: sections = [], isLoading } = useQuery<ContentSection[]>({
    queryKey: ["/api/admin/content-sections"],
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("POST", "/api/admin/content-sections", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Content section created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-sections"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create section", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof form }) => {
      return apiRequest("PATCH", `/api/admin/content-sections/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Content section updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-sections"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update section", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/content-sections/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Section deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-sections"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!form.content.trim()) {
      toast({ title: "Error", description: "Content is required", variant: "destructive" });
      return;
    }
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    deleteMutation.mutate(id);
  };

  const openEditDialog = (section: ContentSection) => {
    setEditingSection(section);
    setForm({
      sectionKey: section.sectionKey,
      title: section.title,
      titleHindi: section.titleHindi || "",
      content: section.content,
      contentHindi: section.contentHindi || "",
      isActive: section.isActive,
      order: section.order
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSection(null);
    setForm({ sectionKey: "about", title: "", titleHindi: "", content: "", contentHindi: "", isActive: true, order: 0 });
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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Content Management</h1>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-add-section">
            <Plus className="h-4 w-4 mr-2" /> Add Section
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sections.length === 0 ? (
          <Card data-testid="card-empty-state">
            <CardContent className="py-12 text-center text-muted-foreground">
              No content sections yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4" data-testid="list-sections">
            {sections.map((section) => (
              <Card key={section.id} data-testid={`card-section-${section.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg" data-testid={`text-title-${section.id}`}>{section.title}</CardTitle>
                      <span className="text-sm text-muted-foreground">({section.sectionKey})</span>
                      {!section.isActive && <span className="text-xs text-red-500">(Inactive)</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" onClick={() => openEditDialog(section)} data-testid={`button-edit-${section.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(section.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-${section.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-content-${section.id}`}>{section.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-section-form">
            <DialogHeader>
              <DialogTitle>{editingSection ? "Edit Content Section" : "Add Content Section"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-type">Section Type</Label>
                <Select value={form.sectionKey} onValueChange={(v) => setForm({ ...form, sectionKey: v })} disabled={!!editingSection}>
                  <SelectTrigger id="section-type" data-testid="select-section-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title-en">Title (English)</Label>
                  <Input id="title-en" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="input-title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title-hi">Title (Hindi)</Label>
                  <Input id="title-hi" value={form.titleHindi} onChange={(e) => setForm({ ...form, titleHindi: e.target.value })} data-testid="input-title-hindi" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-en">Content (English)</Label>
                <Textarea id="content-en" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} data-testid="input-content" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-hi">Content (Hindi)</Label>
                <Textarea id="content-hi" value={form.contentHindi} onChange={(e) => setForm({ ...form, contentHindi: e.target.value })} rows={4} data-testid="input-content-hindi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} data-testid="input-order" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch id="active" checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} data-testid="switch-active" />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !form.title.trim() || !form.content.trim()} data-testid="button-save">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingSection ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
