import { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Edit, Trash2, ExternalLink } from "lucide-react";

interface Page {
  id: number;
  slug: string;
  title: string;
  titleHindi?: string;
  content: string;
  contentHindi?: string;
  metaDescription?: string;
  isPublished: boolean;
  order: number;
}

export default function AdminPages() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    titleHindi: "",
    content: "",
    contentHindi: "",
    metaDescription: "",
    isPublished: false,
    order: 0
  });

  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ["/api/admin/pages"],
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      return apiRequest("POST", "/api/admin/pages", data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Page created" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create page", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof form }) => {
      return apiRequest("PATCH", `/api/admin/pages/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Page updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update page", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/admin/pages/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Page deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    },
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleSave = () => {
    const slug = form.slug.trim() || generateSlug(form.title);
    if (!form.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    if (!slug) {
      toast({ title: "Error", description: "Slug is required", variant: "destructive" });
      return;
    }
    if (!form.content.trim()) {
      toast({ title: "Error", description: "Content is required", variant: "destructive" });
      return;
    }
    const data = { ...form, slug };
    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    deleteMutation.mutate(id);
  };

  const openEditDialog = (page: Page) => {
    setEditingPage(page);
    setForm({
      slug: page.slug,
      title: page.title,
      titleHindi: page.titleHindi || "",
      content: page.content,
      contentHindi: page.contentHindi || "",
      metaDescription: page.metaDescription || "",
      isPublished: page.isPublished,
      order: page.order
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPage(null);
    setForm({ slug: "", title: "", titleHindi: "", content: "", contentHindi: "", metaDescription: "", isPublished: false, order: 0 });
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
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Page Management</h1>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="button-add-page">
            <Plus className="h-4 w-4 mr-2" /> Add Page
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pages.length === 0 ? (
          <Card data-testid="card-empty-state">
            <CardContent className="py-12 text-center text-muted-foreground">
              No custom pages yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4" data-testid="list-pages">
            {pages.map((page) => (
              <Card key={page.id} data-testid={`card-page-${page.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg" data-testid={`text-title-${page.id}`}>{page.title}</CardTitle>
                      <span className="text-sm text-muted-foreground">/{page.slug}</span>
                      {page.isPublished ? (
                        <Badge className="bg-green-500">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {page.isPublished && (
                        <Button size="icon" variant="outline" asChild data-testid={`button-preview-${page.id}`}>
                          <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button size="icon" variant="outline" onClick={() => openEditDialog(page)} data-testid={`button-edit-${page.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(page.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-${page.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-content-${page.id}`}>{page.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-page-form">
            <DialogHeader>
              <DialogTitle>{editingPage ? "Edit Page" : "Create New Page"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title-en">Title (English)</Label>
                  <Input 
                    id="title-en"
                    value={form.title} 
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm({ ...form, title, slug: !editingPage ? generateSlug(title) : form.slug });
                    }} 
                    data-testid="input-title" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title-hi">Title (Hindi)</Label>
                  <Input id="title-hi" value={form.titleHindi} onChange={(e) => setForm({ ...form, titleHindi: e.target.value })} data-testid="input-title-hindi" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: generateSlug(e.target.value) })} placeholder="page-url-slug" data-testid="input-slug" />
                <p className="text-xs text-muted-foreground">Page will be accessible at: /page/{form.slug || "..."}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-en">Content (English)</Label>
                <Textarea id="content-en" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} data-testid="input-content" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content-hi">Content (Hindi)</Label>
                <Textarea id="content-hi" value={form.contentHindi} onChange={(e) => setForm({ ...form, contentHindi: e.target.value })} rows={6} data-testid="input-content-hindi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta">Meta Description (SEO)</Label>
                <Textarea id="meta" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} data-testid="input-meta" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input id="order" type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} data-testid="input-order" />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch id="published" checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} data-testid="switch-published" />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving || !form.title.trim() || !form.content.trim()} data-testid="button-save">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPage ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
