import { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Download, CheckCircle, User, Mail, Phone, MapPin, IndianRupee, Award, QrCode, Upload, Copy, Building, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/logo.jpeg";

interface PaymentConfig {
  id: number;
  type: string;
  name: string;
  nameHindi: string | null;
  qrCodeUrl: string | null;
  upiId: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  isActive: boolean;
  order: number;
}

interface FormData {
  name: string;
  fatherName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadhar: string;
  interestArea: string;
  membershipLevel: string;
  transactionId: string;
}

const membershipLevels = [
  { id: "village", name: "Village Level", nameHindi: "ग्राम स्तर", price: 99 },
  { id: "block", name: "Block Level", nameHindi: "खंड स्तर", price: 199 },
  { id: "district", name: "District Level", nameHindi: "जिला स्तर", price: 299 },
  { id: "haryana", name: "Haryana Level", nameHindi: "हरियाणा स्तर", price: 499 },
];

export default function Membership() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [memberId, setMemberId] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  const { data: paymentConfigs, isLoading: isLoadingPayments } = useQuery<PaymentConfig[]>({
    queryKey: ['/api/public/payment-config/membership'],
  });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    fatherName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Haryana",
    pincode: "",
    aadhar: "",
    interestArea: "",
    membershipLevel: "village",
    transactionId: "",
  });

  const selectedLevel = membershipLevels.find(l => l.id === formData.membershipLevel) || membershipLevels[0];

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city) {
      toast({
        title: "कृपया सभी आवश्यक फ़ील्ड भरें",
        description: "नाम, फ़ोन, पता और शहर अनिवार्य हैं।",
        variant: "destructive"
      });
      return false;
    }
    if (formData.phone.length < 10) {
      toast({
        title: "अमान्य फ़ोन नंबर",
        description: "कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handlePaymentVerification = async () => {
    if (!formData.transactionId || formData.transactionId.length < 6) {
      toast({
        title: "Transaction ID आवश्यक है",
        description: "कृपया भुगतान के बाद Transaction ID / UTR नंबर दर्ज करें।",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const res = await fetch("/api/public/payment-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "membership",
          name: formData.name,
          fatherName: formData.fatherName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          amount: selectedLevel.price,
          transactionId: formData.transactionId,
          paymentMethod: "upi",
          purpose: `${selectedLevel.name} Membership`,
          membershipLevel: formData.membershipLevel,
        }),
      });

      if (res.ok) {
        setIsPendingApproval(true);
        setStep(3);
        toast({
          title: "आवेदन सफल!",
          description: "आपका भुगतान अनुरोध प्रशासक को भेज दिया गया है।",
        });
      } else {
        const data = await res.json();
        toast({
          title: "त्रुटि",
          description: data.error || "भुगतान सबमिट करने में विफल",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "त्रुटि",
        description: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUPI = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast({ title: "UPI ID कॉपी हो गई!" });
  };

  const downloadCard = () => {
    if (cardRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 600, 400);
        gradient.addColorStop(0, '#dc2626');
        gradient.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = gradient;
        ctx.roundRect(0, 0, 600, 400, 20);
        ctx.fill();
        
        // White inner card
        ctx.fillStyle = '#ffffff';
        ctx.roundRect(10, 10, 580, 380, 15);
        ctx.fill();
        
        // Header
        ctx.fillStyle = '#dc2626';
        ctx.roundRect(10, 10, 580, 90, [15, 15, 0, 0]);
        ctx.fill();
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MANAV WELFARE SEVA SOCIETY', 300, 42);
        ctx.font = '13px Arial';
        ctx.fillText('मानव वेलफेयर सेवा सोसाइटी भूना', 300, 62);
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${selectedLevel.name} (${selectedLevel.nameHindi})`, 300, 85);
        
        // Member details
        ctx.fillStyle = '#1f2937';
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('MEMBERSHIP CARD', 30, 130);
        
        ctx.font = '15px Arial';
        ctx.fillText(`Name / नाम: ${formData.name}`, 30, 165);
        ctx.fillText(`S/O: ${formData.fatherName || 'N/A'}`, 30, 195);
        ctx.fillText(`Member ID: ${memberId}`, 30, 225);
        ctx.fillText(`Phone: ${formData.phone}`, 30, 255);
        ctx.fillText(`Address: ${formData.city}, ${formData.state}`, 30, 285);
        
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#dc2626';
        ctx.fillText(`Valid: ${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`, 30, 325);
        
        // Footer info
        ctx.textAlign = 'right';
        ctx.font = '11px Arial';
        ctx.fillStyle = '#6b7280';
        ctx.fillText('Founder: Ch. Sukhvinder Bains', 570, 350);
        ctx.fillText('Reg. No: 01215 | +91 98126 76818', 570, 370);
        
        // Download
        const link = document.createElement('a');
        link.download = `MWSS_Membership_${memberId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast({
          title: "कार्ड डाउनलोड हो गया!",
          description: "आपका मेंबरशिप कार्ड सफलतापूर्वक डाउनलोड हो गया।"
        });
      }
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Membership Registration
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              सदस्यता <span className="text-primary">पंजीकरण</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              मानव वेलफेयर सेवा सोसाइटी के सदस्य बनें और समाज सेवा में योगदान दें।
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {membershipLevels.map(level => (
                <div key={level.id} className="bg-card rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-sm text-muted-foreground">{level.nameHindi}</span>
                  <span className="ml-2 font-bold text-primary">₹{level.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Steps Indicator */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="hidden sm:inline font-medium">विवरण भरें</span>
            </div>
            <div className="w-12 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="hidden sm:inline font-medium">भुगतान करें</span>
            </div>
            <div className="w-12 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="hidden sm:inline font-medium">कार्ड डाउनलोड</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            
            {/* Step 1: Form */}
            {step === 1 && (
              <Card className="p-8 shadow-elevated">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  व्यक्तिगत विवरण
                </h2>
                
                <div className="space-y-6">
                  {/* Membership Level Selection */}
                  <div>
                    <Label className="text-base font-semibold">सदस्यता स्तर चुनें / Select Membership Level *</Label>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {membershipLevels.map(level => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => handleChange('membershipLevel', level.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.membershipLevel === level.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="font-semibold text-foreground">{level.nameHindi}</div>
                          <div className="text-sm text-muted-foreground">{level.name}</div>
                          <div className="text-lg font-bold text-primary mt-1">₹{level.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">नाम / Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="आपका पूरा नाम"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fatherName">पिता का नाम / Father's Name</Label>
                      <Input 
                        id="fatherName" 
                        placeholder="पिता का नाम"
                        value={formData.fatherName}
                        onChange={(e) => handleChange('fatherName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">मोबाइल नंबर / Phone *</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        placeholder="10 अंकों का मोबाइल नंबर"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">ईमेल / Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">पता / Address *</Label>
                    <Input 
                      id="address" 
                      placeholder="घर/सड़क का पता"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">शहर/गांव / City *</Label>
                      <Input 
                        id="city" 
                        placeholder="शहर/गांव"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">राज्य / State</Label>
                      <Input 
                        id="state" 
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">पिन कोड / PIN</Label>
                      <Input 
                        id="pincode" 
                        placeholder="125111"
                        value={formData.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="interestArea">रुचि का क्षेत्र / Interest Area</Label>
                    <Select value={formData.interestArea} onValueChange={(value) => handleChange('interestArea', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="चुनें..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="education">शिक्षा / Education</SelectItem>
                        <SelectItem value="health">स्वास्थ्य / Health</SelectItem>
                        <SelectItem value="women">महिला सशक्तिकरण / Women Empowerment</SelectItem>
                        <SelectItem value="gk-exam">GK परीक्षा / GK Exam</SelectItem>
                        <SelectItem value="environment">पर्यावरण / Environment</SelectItem>
                        <SelectItem value="csc">CSC सेवाएं / CSC Services</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleProceedToPayment} className="w-full" size="lg">
                    भुगतान पर आगे बढ़ें → ₹{selectedLevel.price}
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Payment with QR */}
            {step === 2 && (
              <Card className="p-8 shadow-elevated">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <QrCode className="h-6 w-6 text-primary" />
                  भुगतान करें
                </h2>

                <div className="bg-muted/50 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">{selectedLevel.nameHindi} सदस्यता</span>
                    <span className="text-xl font-bold text-foreground">₹{selectedLevel.price}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-border pt-4">
                    <span className="font-semibold text-foreground">कुल राशि</span>
                    <span className="text-2xl font-bold text-primary">₹{selectedLevel.price}</span>
                  </div>
                </div>

                {/* Payment Methods from Admin Config */}
                <div className="space-y-6">
                  {isLoadingPayments ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : paymentConfigs && paymentConfigs.length > 0 ? (
                    <>
                      {paymentConfigs.map((config) => (
                        <div key={config.id} className="bg-secondary/10 rounded-xl p-6">
                          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                            {config.upiId ? (
                              <QrCode className="h-5 w-5 text-secondary" />
                            ) : (
                              <Building className="h-5 w-5 text-primary" />
                            )}
                            {config.nameHindi || config.name}
                          </h3>
                          
                          {config.qrCodeUrl && (
                            <div className="flex flex-col items-center mb-4">
                              <div className="w-48 h-48 bg-white rounded-xl p-2 shadow-md mb-4">
                                <img 
                                  src={config.qrCodeUrl} 
                                  alt="QR Code" 
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            </div>
                          )}
                          
                          {config.upiId && (
                            <div className="flex flex-col items-center mb-4">
                              {!config.qrCodeUrl && (
                                <div className="w-48 h-48 bg-white rounded-xl p-4 shadow-md mb-4">
                                  <div className="w-full h-full border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <QrCode className="h-16 w-16 text-primary mx-auto mb-2" />
                                      <p className="text-xs text-muted-foreground">QR Code</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center gap-2 bg-card rounded-lg px-4 py-2 border">
                                <span className="font-mono text-foreground">{config.upiId}</span>
                                <Button variant="ghost" size="sm" onClick={() => copyUPI(config.upiId!)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground text-center mt-2">
                                PhonePe / Google Pay / Paytm / BHIM से स्कैन करें
                              </p>
                            </div>
                          )}
                          
                          {config.bankName && (
                            <div className="space-y-2 text-sm">
                              {config.accountHolderName && (
                                <div className="flex flex-wrap justify-between gap-1">
                                  <span className="text-muted-foreground">Account Name:</span>
                                  <span className="font-medium text-foreground">{config.accountHolderName}</span>
                                </div>
                              )}
                              <div className="flex flex-wrap justify-between gap-1">
                                <span className="text-muted-foreground">Bank:</span>
                                <span className="font-medium text-foreground">{config.bankName}</span>
                              </div>
                              {config.accountNumber && (
                                <div className="flex flex-wrap justify-between gap-1">
                                  <span className="text-muted-foreground">Account No:</span>
                                  <span className="font-medium text-foreground">{config.accountNumber}</span>
                                </div>
                              )}
                              {config.ifscCode && (
                                <div className="flex flex-wrap justify-between gap-1">
                                  <span className="text-muted-foreground">IFSC Code:</span>
                                  <span className="font-medium text-foreground">{config.ifscCode}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>भुगतान विवरण अभी उपलब्ध नहीं है।</p>
                      <p className="text-sm">कृपया संपर्क करें: +91 98126 76818</p>
                    </div>
                  )}

                  {/* Transaction ID Input */}
                  <div className="border-t border-border pt-6">
                    <Label htmlFor="transactionId" className="text-base font-semibold">
                      भुगतान के बाद Transaction ID / UTR नंबर दर्ज करें *
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      भुगतान करने के बाद आपको SMS या UPI ऐप में Transaction ID मिलेगी
                    </p>
                    <Input 
                      id="transactionId"
                      placeholder="उदाहरण: 123456789012"
                      value={formData.transactionId}
                      onChange={(e) => handleChange('transactionId', e.target.value)}
                      className="text-lg"
                      data-testid="input-transaction-id"
                    />
                  </div>

                  <Button 
                    onClick={handlePaymentVerification} 
                    className="w-full" 
                    size="lg"
                    disabled={isProcessing}
                    data-testid="button-verify-payment"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        भुगतान सत्यापित हो रहा है...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        भुगतान सत्यापित करें
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={() => setStep(1)} className="w-full" data-testid="button-go-back">
                    ← वापस जाएं
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Pending Approval */}
            {step === 3 && isPendingApproval && (
              <Card className="p-8 shadow-elevated text-center">
                <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  आवेदन जमा हो गया!
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  आपका भुगतान अनुरोध प्रशासक को भेज दिया गया है।
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    अगले चरण / Next Steps
                  </h3>
                  <ul className="text-left text-amber-700 dark:text-amber-300 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>प्रशासक आपके भुगतान की पुष्टि करेगा (Admin will verify your payment)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>अनुमोदन के बाद आपको SMS/Email मिलेगा (You will receive SMS/Email after approval)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>सदस्यता कार्ड डाउनलोड कर सकेंगे (You can download membership card)</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Transaction ID: <span className="font-mono font-medium">{formData.transactionId}</span>
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = "/"}>
                    होम पेज पर जाएं
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Success & Download (after admin approval) */}
            {step === 3 && isSuccess && !isPendingApproval && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  बधाई हो! 🎉
                </h2>
                <p className="text-muted-foreground mb-8">
                  आपकी सदस्यता सफलतापूर्वक सक्रिय हो गई है।<br />
                  <strong>Member ID: {memberId}</strong>
                </p>

                {/* Membership Card Preview */}
                <Card ref={cardRef} className="max-w-md mx-auto mb-8 overflow-hidden shadow-elevated">
                  <div className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-foreground">
                    <div className="flex items-center gap-3">
                      <img src={logo} alt="Logo" className="w-12 h-12 rounded-full bg-white p-1" />
                      <div className="text-left">
                        <h3 className="font-bold text-sm">MANAV WELFARE SEVA SOCIETY</h3>
                        <p className="text-xs opacity-90">मानव वेलफेयर सेवा सोसाइटी भूना</p>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="bg-white/20 rounded-full px-3 py-1 text-xs">
                        {selectedLevel.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 bg-card">
                    <div className="text-left space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold text-foreground">{formData.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">S/O:</span>
                        <span className="text-foreground">{formData.fatherName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Member ID:</span>
                        <span className="font-bold text-primary">{memberId}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="text-foreground">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="text-foreground">{formData.city}, {formData.state}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                      <div>
                        <span className="text-xs text-muted-foreground">Valid:</span>
                        <span className="ml-1 text-sm font-semibold text-primary">
                          {new Date().getFullYear()} - {new Date().getFullYear() + 1}
                        </span>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>Reg. No: 01215</div>
                        <div>+91 98126 76818</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Button onClick={downloadCard} size="lg" className="gap-2">
                  <Download className="h-5 w-5" />
                  मेंबरशिप कार्ड डाउनलोड करें
                </Button>

                <p className="text-sm text-muted-foreground mt-6">
                  कार्ड की PNG इमेज आपके डिवाइस में सेव हो जाएगी।
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Authority Details */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold text-foreground mb-6">संस्था प्रबंधन</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-card">
                <Award className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-bold text-foreground">Founder & President</h4>
                <p className="text-muted-foreground">संस्थापक एवं अध्यक्ष</p>
                <p className="text-lg font-semibold text-primary mt-2">Ch. Sukhvinder Bains</p>
                <p className="text-sm text-muted-foreground">भूना, फतेहाबाद</p>
              </div>
              <div className="bg-card rounded-xl p-6 shadow-card">
                <Award className="h-10 w-10 text-secondary mx-auto mb-3" />
                <h4 className="font-bold text-foreground">Director</h4>
                <p className="text-muted-foreground">निदेशक</p>
                <p className="text-lg font-semibold text-secondary mt-2">Ch. Komal</p>
                <p className="text-sm text-muted-foreground">भूना, फतेहाबाद</p>
              </div>
            </div>
            <div className="mt-6 text-sm text-muted-foreground">
              <p>📞 +91 98126 76818 | Reg. No: 01215</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
