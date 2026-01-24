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
import { Loader2, Plus, Edit, Trash2, Upload, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventItem {
  id: string;
  title: string;
  titleHindi?: string;
  description: string;
  descriptionHindi?: string;
  imageUrl: string;
  category: string;
  categoryHindi?: string;
  date: string;
  time: string;
  timeHindi?: string;
  location: string;
  locationHindi?: string;
  eventType: "upcoming" | "past";
  attendees?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const eventCategories = [
  { id: "Competition", label: "Competition" },
  { id: "Health", label: "Health" },
  { id: "Environment", label: "Environment" },
  { id: "Education", label: "Education" },
  { id: "Awareness", label: "Awareness" },
  { id: "Other", label: "Other" },
];

const eventTypes = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export default function AdminEvents() {
  const { toast } = useToast();
  const uploadedPathRef = useRef<string>("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    titleHindi: "",
    description: "",
    descriptionHindi: "",
    imageUrl: "",
    category: "Competition",
    categoryHindi: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    timeHindi: "",
    location: "",
    locationHindi: "",
    eventType: "upcoming" as "upcoming" | "past",
    attendees: "",
    isActive: true,
    order: 0,
  });

  // ✅ FIX: queryFn hata diya -> default queryClient queryFn JSON return karega
  const { data: events = [], isLoading } = useQuery<EventItem[]>({
    queryKey: ["/api/admin/events"],
  });

  const createMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/admin/events", formData),
    onSuccess: () => {
      toast({ title: "Success", description: "Event created successfully" });
      resetForm();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () =>
      apiRequest("PATCH", `/api/admin/events/${editingEvent?.id}`, formData),
    onSuccess: () => {
      toast({ title: "Success", description: "Event updated successfully" });
      resetForm();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    // ✅ FIX: DELETE me {} mat bhejo
    mutationFn: async (id: string) =>
      apiRequest("DELETE", `/api/admin/events/${id}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Event deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      titleHindi: "",
      description: "",
      descriptionHindi: "",
      imageUrl: "",
      category: "Competition",
      categoryHindi: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM",
      timeHindi: "",
      location: "",
      locationHindi: "",
      eventType: "upcoming",
      attendees: "",
      isActive: true,
      order: 0,
    });
    setEditingEvent(null);
    uploadedPathRef.current = "";
  };

  const handleEditClick = (event: EventItem) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      titleHindi: event.titleHindi || "",
      description: event.description,
      descriptionHindi: event.descriptionHindi || "",
      imageUrl: event.imageUrl,
      category: event.category,
      categoryHindi: event.categoryHindi || "",
      date: event.date,
      time: event.time,
      timeHindi: event.timeHindi || "",
      location: event.location,
      locationHindi: event.locationHindi || "",
      eventType: event.eventType,
      attendees: event.attendees || "",
      isActive: event.isActive,
      order: event.order,
    });
    uploadedPathRef.current = event.imageUrl;
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetForm();
  };

  const canSubmit =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.imageUrl.trim() &&
    formData.location.trim();

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Events Management</h1>

          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? "Edit Event" : "Add Event"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload Image
                  </label>

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
                            throw new Error(
                              "Authentication token not found. Please log in again."
                            );
                          }

                          const urlResponse = await fetch(
                            "/api/uploads/request-url",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                name: file.name,
                                contentType: file.type,
                              }),
                            }
                          );

                          if (!urlResponse.ok) {
                            const errorText = await urlResponse.text();
                            throw new Error(errorText || "Failed to get upload URL");
                          }

                          const { uploadURL, fileURL } = await urlResponse.json();

                          const uploadResponse = await fetch(uploadURL, {
                            method: "PUT",
                            headers: {
                              "Content-Type":
                                file.type || "application/octet-stream",
                            },
                            body: file,
                          });

                          if (!uploadResponse.ok) {
                            throw new Error(
                              `Upload failed with status ${uploadResponse.status}`
                            );
                          }

                          uploadedPathRef.current = fileURL;
                          setFormData((p) => ({ ...p, imageUrl: fileURL }));
                          toast({
                            title: "Success",
                            description: "Image uploaded successfully",
                          });

                          e.target.value = "";
                        } catch (error) {
                          console.error("Upload error:", error);
                          const errorMessage =
                            error instanceof Error
                              ? error.message
                              : "Failed to upload image";
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
                      id="event-file-input"
                    />

                    <Button
                      onClick={() =>
                        document.getElementById("event-file-input")?.click()
                      }
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

                  {formData.imageUrl && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Image: {formData.imageUrl.split("/").pop()}
                      </p>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title (English)
                    </label>
                    <Input
                      placeholder="Event title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title (Hindi)
                    </label>
                    <Input
                      placeholder="कार्यक्रम शीर्षक"
                      value={formData.titleHindi}
                      onChange={(e) =>
                        setFormData({ ...formData, titleHindi: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (English)
                    </label>
                    <Textarea
                      placeholder="Event description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (Hindi)
                    </label>
                    <Textarea
                      placeholder="कार्यक्रम विवरण"
                      value={formData.descriptionHindi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          descriptionHindi: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {eventCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category (Hindi)
                    </label>
                    <Input
                      placeholder="श्रेणी"
                      value={formData.categoryHindi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoryHindi: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <Input
                      placeholder="10:00 AM"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Time (Hindi)
                  </label>
                  <Input
                    placeholder="10:00 AM"
                    value={formData.timeHindi}
                    onChange={(e) =>
                      setFormData({ ...formData, timeHindi: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location
                    </label>
                    <Input
                      placeholder="Event location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location (Hindi)
                    </label>
                    <Input
                      placeholder="कार्यक्रम स्थान"
                      value={formData.locationHindi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          locationHindi: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Event Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.eventType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eventType: e.target.value as "upcoming" | "past",
                        })
                      }
                    >
                      {eventTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Attendees (for past events)
                    </label>
                    <Input
                      placeholder="500+"
                      value={formData.attendees}
                      onChange={(e) =>
                        setFormData({ ...formData, attendees: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Display Order
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center gap-2 pb-1">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isActive: checked })
                        }
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() =>
                      editingEvent
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
                    {editingEvent ? "Update" : "Create"} Event
                  </Button>

                  <Button onClick={() => handleDialogOpenChange(false)} variant="outline">
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
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No events added yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          {event.titleHindi && (
                            <p className="text-sm text-muted-foreground">
                              {event.titleHindi}
                            </p>
                          )}
                        </div>
                        <Badge variant={event.isActive ? "default" : "secondary"}>
                          {event.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{event.category}</Badge>
                        <Badge variant="outline">
                          {event.eventType === "upcoming" ? "Upcoming" : "Past"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {event.date}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {event.time}
                        </span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        📍 {event.location}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(event)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(event.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
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
