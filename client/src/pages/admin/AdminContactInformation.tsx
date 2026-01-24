import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Mail, MapPin, Info, Share2 } from "lucide-react";

interface SocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
}

interface ContactInfo {
  id?: string;
  address?: string;
  phone?: string;
  email?: string;
  otherInformation?: string;
  mapEmbedUrl?: string;
  socialMedia?: SocialMedia;
}

export default function AdminContactInformation() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: "",
    phone: "",
    email: "",
    otherInformation: "",
    mapEmbedUrl: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      whatsapp: "",
    },
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/contact-info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setContactInfo({
          id: data.id,
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          otherInformation: data.otherInformation || "",
          mapEmbedUrl: data.mapEmbedUrl || "",
          socialMedia: {
            facebook: data.socialMedia?.facebook || "",
            twitter: data.socialMedia?.twitter || "",
            instagram: data.socialMedia?.instagram || "",
            linkedin: data.socialMedia?.linkedin || "",
            youtube: data.socialMedia?.youtube || "",
            whatsapp: data.socialMedia?.whatsapp || "",
          },
        });
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      toast({ title: "Error", description: "Failed to fetch contact information", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/admin/contact-info", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contactInfo),
      });

      if (!res.ok) throw new Error("Failed to save contact information");

      const data = await res.json();
      setContactInfo({
        id: data.id,
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        otherInformation: data.otherInformation || "",
        mapEmbedUrl: data.mapEmbedUrl || "",
        socialMedia: {
          facebook: data.socialMedia?.facebook || "",
          twitter: data.socialMedia?.twitter || "",
          instagram: data.socialMedia?.instagram || "",
          linkedin: data.socialMedia?.linkedin || "",
          youtube: data.socialMedia?.youtube || "",
          whatsapp: data.socialMedia?.whatsapp || "",
        },
      });

      toast({ title: "Success", description: "Contact information updated successfully" });
    } catch (error) {
      console.error("Error saving contact info:", error);
      toast({ title: "Error", description: "Failed to save contact information", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Information / संपर्क जानकारी</h1>
          <p className="text-muted-foreground">Manage organization contact details that appear on the website</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address / पता
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter complete address"
                value={contactInfo.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Phone / फोन
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +91 98126 76818"
                value={contactInfo.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email / ईमेल
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., info@example.com"
                value={contactInfo.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Other Information / अन्य जानकारी
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="otherInformation">Additional Information</Label>
              <Textarea
                id="otherInformation"
                placeholder="Add any other important contact information"
                value={contactInfo.otherInformation || ""}
                onChange={(e) => handleChange("otherInformation", e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map Embed Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="mapEmbedUrl">Google Maps Embed URL</Label>
              <Textarea
                id="mapEmbedUrl"
                placeholder="Paste the embed code from Google Maps"
                value={contactInfo.mapEmbedUrl || ""}
                onChange={(e) => handleChange("mapEmbedUrl", e.target.value)}
                rows={3}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Get the embed code from Google Maps by clicking "Share" &gt; "Embed a map"
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={fetchContactInfo}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
