import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Eye, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GalleryImage {
  id: number;
  imageUrl: string;
  title: string;
  category: string;
  date?: string;
  isActive: boolean;
}

const categories = [
  { id: "events", label: "Events" },
  { id: "health", label: "Health Camps" },
  { id: "environment", label: "Tree Plantation" },
  { id: "news", label: "News Coverage" },
  { id: "education", label: "Education / GK Competitions" },
];

export default function AdminGallery() {
  const { toast } = useToast();
  const uploadedPathRef = useRef<string>("");

  const [newImage, setNewImage] = useState({
    imageUrl: "",
    title: "",
    category: "events",
    date: new Date().getFullYear().toString(),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ FIX: admin gallery list JSON properly using queryClient default queryFn
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["/api/admin/gallery"],
    staleTime: 0,
    refetchOnMount: "always",
  });

  const createMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/admin/gallery", newImage),
    onSuccess: () => {
      toast({ title: "Success", description: "Gallery image added successfully" });
      setNewImage({ imageUrl: "", title: "", category: "events", date: new Date().getFullYear().toString() });
      setDialogOpen(false);

      // ✅ refresh admin + public gallery
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/gallery"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add gallery image", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/admin/gallery/${id}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Gallery image deleted successfully" });

      // ✅ refresh admin + public gallery
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      queryClient.invalidateQueries({ queryKey: ["/api/public/gallery"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete gallery image", variant: "destructive" });
    },
  });

  const groupedImages = categories.map((cat) => ({
    ...cat,
    images: (images as GalleryImage[]).filter((img) => img.category === cat.id),
  }));

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            Gallery Management
          </h1>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-image">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>

            <DialogContent data-testid="dialog-add-image">
              <DialogHeader>
                <DialogTitle>Add Gallery Image</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Image</label>

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setUploading(true);
                        try {
                          const token = localStorage.getItem("auth_token");
                          if (!token) {
                            throw new Error("Authentication token not found. Please log in again.");
                          }

                          // Step 1: Request upload URL from server
                          const urlResponse = await fetch("/api/uploads/request-url", {
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

                          if (!urlResponse.ok) {
                            const errorData = await urlResponse.json().catch(() => ({ error: urlResponse.statusText }));
                            throw new Error(errorData.error || `Request failed with status ${urlResponse.status}`);
                          }

                          const { uploadURL, fileURL } = await urlResponse.json();

                          // Step 2: Upload file with direct fetch PUT
                          const uploadResponse = await fetch(uploadURL, {
                            method: "PUT",
                            headers: {
                              "Content-Type": file.type || "application/octet-stream",
                              Authorization: `Bearer ${token}`,
                            },
                            body: file,
                          });

                          if (!uploadResponse.ok) {
                            throw new Error(`Upload failed with status ${uploadResponse.status}`);
                          }

                          // Step 3: Store the fileURL
                          uploadedPathRef.current = fileURL;
                          setNewImage({ ...newImage, imageUrl: fileURL });
                          toast({ title: "Success", description: "Image uploaded successfully" });

                          // Reset file input
                          e.target.value = "";
                        } catch (error) {
                          console.error("Upload error:", error);
                          const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
                          toast({
                            title: "Error",
                            description: errorMessage,
                            variant: "destructive",
                          });
                        } finally {
                          setUploading(false);
                        }
                      }}
                      disabled={uploading}
                      className="hidden"
                      id="gallery-file-input"
                    />

                    <Button
                      onClick={() => document.getElementById("gallery-file-input")?.click()}
                      disabled={uploading}
                      variant="outline"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </>
                      )}
                    </Button>
                  </div>

                  {newImage.imageUrl && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Image uploaded: {newImage.imageUrl.split("/").pop()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title / Description</label>
                  <Input
                    placeholder="Event title or description"
                    value={newImage.title}
                    onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newImage.category}
                    onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                    data-testid="select-category"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Year</label>
                  <Input
                    placeholder="2024"
                    value={newImage.date}
                    onChange={(e) => setNewImage({ ...newImage, date: e.target.value })}
                    data-testid="input-year"
                  />
                </div>

                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || uploading || !newImage.imageUrl || !newImage.title}
                  className="w-full"
                  data-testid="button-submit-image"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add to Gallery
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {groupedImages.map((categoryGroup) => (
              <div key={categoryGroup.id} className="space-y-3">
                <h2 className="text-lg font-semibold" data-testid={`text-category-${categoryGroup.id}`}>
                  {categoryGroup.label} ({categoryGroup.images.length})
                </h2>

                {categoryGroup.images.length === 0 ? (
                  <p className="text-muted-foreground py-4">No images added yet</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categoryGroup.images.map((image: GalleryImage) => (
                      <div
                        key={image.id}
                        className="relative group rounded-lg overflow-hidden bg-muted"
                        data-testid={`card-image-${image.id}`}
                      >
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-40 object-cover group-hover:opacity-75 transition"
                        />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => window.open(image.imageUrl, "_blank")}
                            data-testid={`button-view-image-${image.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(image.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-image-${image.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs font-medium line-clamp-2">{image.title}</p>
                          {image.date && <p className="text-white/70 text-xs">{image.date}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
