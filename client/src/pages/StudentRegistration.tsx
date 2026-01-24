import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, CheckCircle, Copy, Loader2, QrCode, Building, Upload, X } from "lucide-react";
import logo from "@/assets/logo.jpeg";

interface PaymentConfig {
  id: number;
  type: string;
  name: string;
  nameHindi?: string;
  qrCodeUrl?: string;
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  isActive: boolean;
  level?: "village" | "block" | "district" | "haryana";
}

const feeLevels = [
  { id: "village", name: "Village Level / ग्राम स्तर", amount: 99 },
  { id: "block", name: "Block Level / ब्लॉक स्तर", amount: 199 },
  { id: "district", name: "District Level / जिला स्तर", amount: 299 },
  { id: "haryana", name: "Haryana Level / हरियाणा स्तर", amount: 399 },
];

export default function StudentRegistration() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationData, setRegistrationData] = useState<{ email: string; registrationNumber: string } | null>(null);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsContent, setTermsContent] = useState<string>("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();

  useEffect(() => {
    const fetchPaymentConfigs = async () => {
      try {
        const res = await fetch("/api/public/payment-config/fee");
        if (res.ok) {
          const data = await res.json();
          setPaymentConfigs(data);
        }
      } catch (error) {
        console.error("Error fetching payment configs:", error);
      } finally {
        setPaymentLoading(false);
      }
    };
    fetchPaymentConfigs();
  }, []);

  useEffect(() => {
    const fetchTermsAndConditions = async () => {
      try {
        const res = await fetch("/api/public/terms-and-conditions/student");
        if (res.ok) {
          const data = await res.json();
          setTermsContent(data.contentEnglish || "");
        }
      } catch (error) {
        console.error("Error fetching terms and conditions:", error);
      }
    };
    fetchTermsAndConditions();
  }, []);

  const [formData, setFormData] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    email: "",
    password: "",
    class: "",
    phone: "",
    address: "",
    village: "",
    city: "",
    dateOfBirth: "",
    gender: "",
    feeLevel: "village",
    transactionId: "",
    photoUrl: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Get payment config for selected fee level
  const feeConfig = paymentConfigs.find(config =>
    config.level === formData.feeLevel
  ) || paymentConfigs.find(config => config.type === 'fee') || paymentConfigs[0];

  const hasQR = feeConfig?.qrCodeUrl;
  const hasUPI = feeConfig?.upiId;
  const hasBank = feeConfig?.bankName;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "कृपया केवल छवि फ़ाइल चुनें",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "फ़ाइल का आकार 5MB से कम होना चाहिए",
        variant: "destructive",
      });
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    setIsUploadingPhoto(true);
    try {
      // Generate unique filename with timestamp and random ID
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      // Use .jpg extension for consistency
      const fileExtension = photoFile.type === 'image/png' ? '.png' :
                           photoFile.type === 'image/webp' ? '.webp' :
                           photoFile.type === 'image/gif' ? '.gif' : '.jpg';
      const fileName = `student_photo_${timestamp}_${randomId}${fileExtension}`;

      // Upload file to the server
      const uploadResponse = await fetch(`/api/uploads/put/${encodeURIComponent(fileName)}`, {
        method: "PUT",
        headers: {
          "Content-Type": photoFile.type,
        },
        body: photoFile,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload error response:", errorText);
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      const photoUrl = uploadResult.fileURL || `/uploads/${fileName}`;

      // Update form data with the uploaded photo URL
      setFormData(prev => ({ ...prev, photoUrl }));

      toast({
        title: "Photo Uploaded Successfully",
        description: "आपकी फोटो सफलतापूर्वक अपलोड हो गई है",
      });

      return photoUrl;
    } catch (error: any) {
      console.error("Photo upload error:", error);
      const errorMessage = error?.message || "फोटो अपलोड करने में विफल";
      toast({
        title: "Upload Failed",
        description: `${errorMessage}। कृपया पुनः प्रयास करें।`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview("");
    setFormData({ ...formData, photoUrl: "" });
  };

  const selectedFeeLevel = feeLevels.find(f => f.id === formData.feeLevel);

  const handleProceedToPayment = async () => {
    if (!formData.studentName || !formData.fatherName || !formData.class || !formData.phone || !formData.email || !formData.password) {
      toast({
        title: "कृपया सभी जानकारी भरें",
        description: "सभी आवश्यक फ़ील्ड भरें",
        variant: "destructive",
      });
      return;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Password बहुत छोटा है",
        description: "कम से कम 6 अक्षर होने चाहिए",
        variant: "destructive",
      });
      return;
    }
    if (!termsAccepted) {
      toast({
        title: "Terms & Conditions आवश्यक है",
        description: "कृपया Terms & Conditions को स्वीकार करें",
        variant: "destructive",
      });
      return;
    }

    // Upload photo if selected
    if (photoFile) {
      setIsUploadingPhoto(true);
      const photoUrl = await uploadPhoto();
      if (!photoUrl) {
        toast({
          title: "फोटो अपलोड विफल",
          description: "कृपया फोटो अपलोड करने का प्रयास फिर से करें",
          variant: "destructive",
        });
        return;
      }
    }

    setStep(2);
  };

  const handlePaymentVerification = async () => {
    if (!formData.transactionId) {
      toast({
        title: "Transaction ID आवश्यक है",
        description: "कृपया Transaction ID दर्ज करें",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await signup({
        email: formData.email,
        password: formData.password,
        fullName: formData.studentName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        class: formData.class,
        feeLevel: formData.feeLevel,
        photoUrl: formData.photoUrl,
        termsAccepted: termsAccepted,
        termsAcceptedAt: new Date(),
      });

      if (result.success) {
        // Create payment transaction for admin approval
        try {
          const txResponse = await fetch("/api/public/payment-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "fee",
              name: formData.studentName,
              email: formData.email,
              phone: formData.phone,
              amount: selectedFeeLevel?.amount || 0,
              transactionId: formData.transactionId,
              paymentMethod: "upi",
              purpose: `Student Registration - ${selectedFeeLevel?.name || formData.feeLevel}`,
              fatherName: formData.fatherName,
              address: formData.address,
              city: formData.city,
            }),
          });

          if (!txResponse.ok) {
            try {
              const txErrorText = await txResponse.text();
              if (txErrorText) {
                const txError = JSON.parse(txErrorText);
                console.warn("Payment transaction creation warning:", txError);
              }
            } catch (parseErr) {
              console.warn("Could not parse payment error response:", parseErr);
            }
          }
        } catch (txError) {
          console.error("Payment transaction creation failed:", txError);
        }

        setRegistrationData({
          email: formData.email,
          registrationNumber: result.registrationNumber || ""
        });
        setStep(3);

        toast({
          title: "रजिस्ट्रेशन सफल!",
          description: "आपका रजिस्ट्रेशन पूरा हो गया है। भुगतान की पुष्टि होने पर लॉगिन कर सकते हैं।",
        });
      } else {
        throw new Error(result.error || "रजिस्ट्रेशन विफल रहा");
      }
    } catch (error: any) {
      console.error("Registration error details:", error);
      const errorMessage = error?.message || "कुछ गलत हो गया। कृपया फिर से प्रयास करें।";
      toast({
        title: "रजिस्ट्रेशन विफल",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Clipboard में कॉपी हो गया" });
  };

  return (
    <Layout>
      <div className="min-h-[80vh] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-4 border-secondary/20 mb-4">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <GraduationCap className="h-8 w-8 text-secondary" />
              Student Registration
            </h1>
            <p className="text-muted-foreground mt-2">छात्र रजिस्ट्रेशन फॉर्म</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${step > s ? "bg-secondary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Student Details / छात्र जानकारी</CardTitle>
                <CardDescription>कृपया सभी जानकारी सही-सही भरें</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name / छात्र का नाम *</Label>
                    <Input id="studentName" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="छात्र का पूरा नाम" required data-testid="input-student-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name / पिता का नाम *</Label>
                    <Input id="fatherName" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="पिता का नाम" required data-testid="input-father-name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name / माता का नाम</Label>
                    <Input id="motherName" name="motherName" value={formData.motherName} onChange={handleChange} placeholder="माता का नाम" data-testid="input-mother-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth / जन्म तिथि</Label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} data-testid="input-dob" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email / ईमेल *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your.email@example.com" required data-testid="input-email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password / पासवर्ड *</Label>
                    <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="कम से कम 6 अक्षर" required data-testid="input-password" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class">Class / कक्षा *</Label>
                    <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                      <SelectTrigger data-testid="select-class"><SelectValue placeholder="कक्षा चुनें" /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                          <SelectItem key={c} value={c.toString()}>Class {c} / कक्षा {c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number / मोबाइल नंबर *</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="10 अंकों का नंबर" maxLength={10} required data-testid="input-phone" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender / लिंग</Label>
                    <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                      <SelectTrigger data-testid="select-gender"><SelectValue placeholder="चुनें" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male / पुरुष</SelectItem>
                        <SelectItem value="female">Female / महिला</SelectItem>
                        <SelectItem value="other">Other / अन्य</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City / शहर</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="शहर का नाम" data-testid="input-city" />
                  </div>
                </div>

                <div className="border-2 border-dashed border-secondary rounded-lg p-6 bg-secondary/5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                      <Upload className="h-5 w-5 text-secondary" />
                      Passport Size Photo / पासपोर्ट साइज फोटो
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      अपनी पासपोर्ट साइज फोटो अपलोड करें (यह फोटो admit card में दिखेगी)
                    </p>
                  </div>

                  {!photoPreview ? (
                    <div>
                      <label htmlFor="photo-input" className="cursor-pointer">
                        <div className="border-2 border-dashed border-secondary rounded-lg p-8 text-center hover:bg-secondary/5 transition-colors">
                          <Upload className="h-12 w-12 text-secondary mx-auto mb-3 opacity-50" />
                          <p className="font-medium text-foreground mb-1">Click to upload photo</p>
                          <p className="text-xs text-muted-foreground">फोटो अपलोड करने के लिए क्लिक करें</p>
                          <p className="text-xs text-muted-foreground mt-2">Maximum file size: 5MB | Format: JPG, PNG</p>
                        </div>
                      </label>
                      <input
                        id="photo-input"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                        data-testid="input-photo"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative w-32 h-40 mx-auto border-2 border-secondary rounded-lg overflow-hidden bg-gray-100">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          data-testid="button-remove-photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-600 flex items-center justify-center gap-2">
                          ✓ Photo uploaded successfully
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removePhoto}
                          className="mt-2"
                          data-testid="button-change-photo"
                        >
                          Change Photo / फोटो बदलें
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Registration Level / रजिस्ट्रेशन स्तर *</Label>
                  <Select value={formData.feeLevel} onValueChange={(v) => setFormData({ ...formData, feeLevel: v })}>
                    <SelectTrigger data-testid="select-fee-level"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {feeLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>{level.name} - Rs.{level.amount}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address / पूरा पता</Label>
                  <Textarea id="address" name="address" value={formData.address} onChange={handleChange} placeholder="पूरा पता लिखें" rows={3} data-testid="input-address" />
                </div>

                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="text-lg font-semibold">
                    Registration Fee / रजिस्ट्रेशन शुल्क: <span className="text-secondary">Rs.{selectedFeeLevel?.amount}</span>
                  </p>
                </div>

                <div className="flex items-start space-x-3 border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                    data-testid="checkbox-terms"
                  />
                  <div className="flex-1">
                    <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                      मैंने Terms & Conditions को पढ़ा और स्वीकार किया हूं / I have read and agree to Terms & Conditions *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-xs text-secondary hover:underline mt-1"
                    >
                      View Terms & Conditions
                    </button>
                  </div>
                </div>

                <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Terms & Conditions / शर्तें और शैतियां</DialogTitle>
                    </DialogHeader>
                    <div className="prose prose-sm max-w-none text-sm space-y-4">
                      {termsContent ? (
                        <div dangerouslySetInnerHTML={{ __html: termsContent }} />
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <p>Loading Terms & Conditions...</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Button onClick={handleProceedToPayment} className="w-full bg-secondary" data-testid="button-proceed-payment">
                  Proceed to Payment / भुगतान करें
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Payment / भुगतान</CardTitle>
                <CardDescription>QR Code स्कैन करें या UPI ID पर भुगतान करें</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-secondary/10 p-4 rounded-lg text-center">
                  <p className="text-lg text-muted-foreground">Registration Fee / रजिस्ट्रेशन शुल्क</p>
                  <p className="text-3xl font-bold text-secondary">Rs.{selectedFeeLevel?.amount}</p>
                </div>

                {paymentLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* QR Code Section */}
                    {hasQR && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <QrCode className="h-5 w-5 text-primary" />
                          <span className="font-medium">Scan QR Code / QR स्कैन करें</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 font-medium">
                          Amount: Rs.{selectedFeeLevel?.amount} के लिए QR Code
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                          <img
                            src={feeConfig.qrCodeUrl}
                            alt="Payment QR Code"
                            className="w-48 h-48 object-contain"
                            data-testid="img-qr-code"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          PhonePe / Google Pay / Paytm / BHIM से स्कैन करें
                        </p>
                      </div>
                    )}

                    {/* UPI ID Section */}
                    {hasUPI && (
                      <div className="space-y-2">
                        <Label>UPI ID</Label>
                        <div className="flex gap-2">
                          <Input value={feeConfig.upiId} readOnly className="bg-muted font-mono" data-testid="input-upi" />
                          <Button variant="outline" onClick={() => copyToClipboard(feeConfig.upiId!)} data-testid="button-copy-upi">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Bank Details Section */}
                    {hasBank && (
                      <div className="border-t pt-4 space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Bank Details / बैंक विवरण
                        </h4>
                        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-muted-foreground">Account Name:</span>
                            <span className="font-medium">{feeConfig.accountHolderName}</span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-muted-foreground">Bank:</span>
                            <span className="font-medium">{feeConfig.bankName}</span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-muted-foreground">Account No:</span>
                            <span className="font-mono font-medium">{feeConfig.accountNumber}</span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-muted-foreground">IFSC:</span>
                            <span className="font-mono font-medium">{feeConfig.ifscCode}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* No Payment Config Warning */}
                    {!hasQR && !hasUPI && !hasBank && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg text-center">
                        <p className="text-amber-700 dark:text-amber-300 text-sm">
                          Payment configuration not available. Please contact admin.
                          <br />
                          भुगतान सेटिंग उपलब्ध नहीं है। कृपया एडमिन से संपर्क करें।
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID / UTR Number *</Label>
                  <Input id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleChange} placeholder="Transaction/UTR ID दर्ज करें" required data-testid="input-transaction-id" />
                  <p className="text-xs text-muted-foreground">भुगतान करने के बाद Transaction ID या UTR Number डालें</p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1" data-testid="button-back">Back / वापस</Button>
                  <Button onClick={handlePaymentVerification} disabled={isProcessing} className="flex-1 bg-secondary" data-testid="button-complete-registration">
                    {isProcessing ? "Processing..." : "Complete Registration"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && registrationData && (
            <Card className="shadow-elevated">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-green-600">Registration Successful!</CardTitle>
                <CardDescription>आपका रजिस्ट्रेशन सफलतापूर्वक हो गया है</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-6 rounded-lg space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Registration Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold" data-testid="text-registration-number">{registrationData.registrationNumber}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(registrationData.registrationNumber)} data-testid="button-copy-reg">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email / ईमेल</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold">{registrationData.email}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(registrationData.email)} data-testid="button-copy-email">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    आपने जो password दिया था वही use करें login के लिए
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">
                    ⏳ Admin Approval Pending / व्यवस्थापक की मंजूरी की प्रतीक्षा है
                  </h4>
                  <p className="text-orange-800 dark:text-orange-300 text-sm mb-2">
                    आपका भुगतान अभी सत्यापन के तहत है। कृपया अगले 24-48 घंटों में admin की मंजूरी के लिए प्रतीक्षा करें।
                  </p>
                  <p className="text-orange-800 dark:text-orange-300 text-sm">
                    Approval के बाद आप अपने Registration Number और Password से login कर सकेंगे।
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Important / महत्वपूर्ण:</strong> कृपया अपना Email और Password सुरक्षित रखें।
                    Approval के बाद आप Student Portal में login कर सकेंगे।
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate("/")} className="flex-1" data-testid="button-home">Home / होम</Button>
                  <Button onClick={() => navigate("/student/login")} className="flex-1 bg-secondary" data-testid="button-go-dashboard">
                    Check Login Status / लॉगिन स्थिति जांचें
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
