import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  id: string;
  title: string;
  titleHindi?: string;
  excerpt: string;
  excerptHindi?: string;
  content?: string;
  contentHindi?: string;
  imageUrl: string;
  category: string;
  categoryHindi?: string;
  source?: string;
  date: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const newsCategories = [
  { id: "Education", label: "Education" },
  { id: "Health", label: "Health" },
  { id: "Environment", label: "Environment" },
  { id: "Recognition", label: "Recognition" },
  { id: "Other", label: "Other" },
];

export default function AdminNews() {
  const { toast } = useToast();
  const uploadedPathRef = useRef<string>("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    titleHindi: "",
    excerpt: "",
    excerptHindi: "",
    content: "",
    contentHindi: "",
    imageUrl: "",
    category: "Education",
    categoryHindi: "",
    source: "",
    date: new Date().toISOString().split("T")[0],
    isActive: true,
    order: 0,
  });

  // ✅ FIX: apiRequest returns Response, so we must parse JSON here
  const {
    data: news = [],
    isLoading,
    isError,
    error,
  } = useQuery<NewsItem[]>({
    queryKey: ["/api/admin/news"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/news");
      const json = await res.json();
      // Safety: ensure array
      if (Array.isArray(json)) return json;
      // In case backend wraps response like { news: [...] }
      if (json && Array.isArray(json.news)) return json.news;
      return [];
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/news", formData);
      // optional parse
      try {
        return await res.json();
      } catch {
        return null;
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "News item created successfully" });
      resetForm();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to create news item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/news/${editingNews?.id}`,
        formData
      );
      try {
        return await res.json();
      } catch {
        return null;
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "News item updated successfully" });
      resetForm();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to update news item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/news/${id}`);
      // ignore body
      return res;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "News item deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete news item",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      titleHindi: "",
      excerpt: "",
      excerptHindi: "",
      content: "",
      contentHindi: "",
      imageUrl: "",
      category: "Education",
      categoryHindi: "",
      source: "",
      date: new Date().toISOString().split("T")[0],
      isActive: true,
      order: 0,
    });
    setEditingNews(null);
    uploadedPathRef.current = "";
  };

  const openEditDialog = (item: NewsItem) => {
    setEditingNews(item);
    setFormData({
      title: item.title || "",
      titleHindi: item.titleHindi || "",
      excerpt: item.excerpt || "",
      excerptHindi: item.excerptHindi || "",
      content: item.content || "",
      contentHindi: item.contentHindi || "",
      imageUrl: item.imageUrl || "",
      category: item.category || "Education",
      categoryHindi: item.categoryHindi || "",
      source: item.source || "",
      date: item.date || new Date().toISOString().split("T")[0],
      isActive: item.isActive ?? true,
      order: item.order ?? 0,
    });
    setDialogOpen(true);
  };

  const canSubmit = !!formData.title && !!formData.excerpt && !!formData.imageUrl;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">News & Media Management</h1>
            <p className="text-muted-foreground">
              Manage news articles and media coverage
            </p>
          </div>

          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add News
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNews ? "Edit News Item" : "Add News Item"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label className="block mb-2">News Image</Label>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="news-file-input"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setUploading(true);
                      try {
                        const token = localStorage.getItem("auth_token");
                        if (!token) throw new Error("Please login again");

                        const urlRes = await fetch("/api/uploads/request-url", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            name: file.name,
                            contentType: file.type,
                          }),
                        });

                        if (!urlRes.ok) {
                          const t = await urlRes.text();
                          throw new Error(t || "Failed to get upload URL");
                        }

                        const { uploadURL, fileURL } = await urlRes.json();

                        const putRes = await fetch(uploadURL, {
                          method: "PUT",
                          headers: {
                            "Content-Type":
                              file.type || "application/octet-stream",
                            Authorization: `Bearer ${token}`,
                          },
                          body: file,
                        });

                        if (!putRes.ok) {
                          throw new Error(`Upload failed (${putRes.status})`);
                        }

                        uploadedPathRef.current = fileURL;
                        setFormData((p) => ({ ...p, imageUrl: fileURL }));
                        toast({
                          title: "Success",
                          description: "Image uploaded successfully",
                        });
                        e.target.value = "";
                      } catch (err: any) {
                        toast({
                          title: "Error",
                          description:
                            err?.message || "Failed to upload image",
                          variant: "destructive",
                        });
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("news-file-input")?.click()
                      }
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" /> Choose Image
                        </>
                      )}
                    </Button>

                    {formData.imageUrl ? (
                      <span className="text-sm text-muted-foreground">
                        {formData.imageUrl.split("/").pop()}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title (English)</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Title (Hindi)</Label>
                    <Input
                      value={formData.titleHindi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleHindi: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Excerpt (English)</Label>
                    <Textarea
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Excerpt (Hindi)</Label>
                    <Textarea
                      value={formData.excerptHindi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          excerptHindi: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Content (English)</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label>Content (Hindi)</Label>
                    <Textarea
                      value={formData.contentHindi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contentHindi: e.target.value,
                        })
                      }
                      rows={6}
                    />
                  </div>
                </div>

                {/* Category, Source, Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Category</Label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {newsCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Source</Label>
                    <Input
                      value={formData.source}
                      onChange={(e) =>
                        setFormData({ ...formData, source: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Active + Order */}
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <Label>Active</Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: Number(e.target.value || 0),
                        })
                      }
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() =>
                      editingNews
                        ? updateMutation.mutate()
                        : createMutation.mutate()
                    }
                    disabled={
                      !canSubmit ||
                      createMutation.isPending ||
                      updateMutation.isPending ||
                      uploading
                    }
                    className="flex-1"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {editingNews ? "Update News" : "Create News"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-destructive">
                Failed to load: {(error as Error)?.message || "Unknown error"}
              </p>
            </CardContent>
          </Card>
        ) : news.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No news items added yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {news.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          {item.titleHindi ? (
                            <p className="text-sm text-muted-foreground">
                              {item.titleHindi}
                            </p>
                          ) : null}
                        </div>

                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.date}</span>
                        {item.source ? (
                          <>
                            <span>•</span>
                            <span>{item.source}</span>
                          </>
                        ) : null}
                      </div>

                      <p className="text-sm">{item.excerpt}</p>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
