import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Heart, CreditCard, Building, QrCode, CheckCircle, Shield, Award, Loader2, Clock, Copy, User, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
}

const impactItems = [
  { amount: "500", impact: "1 बच्चे को एक महीने की शिक्षा / Educate 1 child for a month" },
  { amount: "2,000", impact: "10 बच्चों को स्कूल सप्लाई / School supplies for 10 children" },
  { amount: "5,000", impact: "50 लोगों के लिए स्वास्थ्य शिविर / Health camp for 50 people" },
  { amount: "10,000", impact: "100 पेड़ लगाएं / Plant 100 trees" },
  { amount: "25,000", impact: "एक बच्चे की साल भर की शिक्षा / Child's education for a year" },
];

export default function Donate() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    transactionId: "",
    purpose: "",
  });

  useEffect(() => {
    fetchPaymentConfigs();
  }, []);

  const fetchPaymentConfigs = async () => {
    try {
      const res = await fetch("/api/public/payment-config/donation");
      if (res.ok) {
        const data = await res.json();
        setPaymentConfigs(data);
      }
    } catch (error) {
      console.error("Error fetching payment configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleProceedToPayment = () => {
    if (!amount || parseInt(amount) < 100) {
      toast({ title: "Error", description: "कृपया न्यूनतम Rs.100 दर्ज करें / Please enter minimum Rs.100", variant: "destructive" });
      return;
    }
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "कृपया अपना नाम दर्ज करें / Please enter your name", variant: "destructive" });
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast({ title: "Error", description: "कृपया सही फोन नंबर दर्ज करें / Please enter valid phone number", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleSubmitDonation = async () => {
    if (!formData.transactionId.trim()) {
      toast({ title: "Error", description: "कृपया UTR/Transaction ID दर्ज करें", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/public/payment-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "donation",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          amount: parseInt(amount),
          transactionId: formData.transactionId,
          paymentMethod: selectedMethod === "upi" ? "UPI" : "Bank Transfer",
          purpose: formData.purpose || "General Donation",
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        setStep(3);
        toast({ title: "सफल!", description: "आपका दान अनुरोध जमा हो गया है।" });
      } else {
        const error = await res.json();
        toast({ title: "Error", description: error.error || "कुछ गलत हो गया", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "नेटवर्क त्रुटि, कृपया पुनः प्रयास करें", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUPI = (upiId: string) => {
    navigator.clipboard.writeText(upiId);
    toast({ title: "Copied!", description: "UPI ID copied to clipboard" });
  };

  const donationConfig = paymentConfigs[0];
  const hasQR = donationConfig?.qrCodeUrl;
  const hasUPI = donationConfig?.upiId;
  const hasBank = donationConfig?.bankName;

  return (
    <Layout>
      <section className="relative py-24 bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium text-sm">हर रुपया फर्क लाता है / Every Rupee Makes a Difference</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              दान करें <span className="text-primary">जीवन बदलें</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Donate to <span className="text-primary">Transform Lives</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
                <span className="hidden sm:inline">विवरण भरें</span>
              </div>
              <div className="w-16 h-px bg-border" />
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
                <span className="hidden sm:inline">भुगतान करें</span>
              </div>
              <div className="w-16 h-px bg-border" />
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
                <span className="hidden sm:inline">पुष्टि</span>
              </div>
            </div>
          </div>

          {/* Step 1: Donor Details */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 shadow-elevated">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  दान करें / Make a Donation
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4" />
                      नाम / Name *
                    </Label>
                    <Input
                      placeholder="अपना पूरा नाम दर्ज करें"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      data-testid="input-donor-name"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" />
                      फोन नंबर / Phone *
                    </Label>
                    <Input
                      type="tel"
                      placeholder="10 अंकों का मोबाइल नंबर"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      data-testid="input-donor-phone"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      ईमेल / Email (Optional)
                    </Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      data-testid="input-donor-email"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">दान का उद्देश्य / Purpose (Optional)</Label>
                    <Input
                      placeholder="उदाहरण: शिक्षा के लिए"
                      value={formData.purpose}
                      onChange={(e) => handleChange('purpose', e.target.value)}
                      data-testid="input-purpose"
                    />
                  </div>

                  <div>
                    <Label className="mb-4 block font-semibold">राशि चुनें / Select Amount *</Label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {["500", "1000", "2000", "5000", "10000", "25000"].map((value) => (
                        <button
                          key={value}
                          onClick={() => setAmount(value)}
                          className={`py-3 rounded-xl font-medium transition-all ${
                            amount === value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground hover:bg-primary/10"
                          }`}
                          data-testid={`button-amount-${value}`}
                        >
                          Rs.{parseInt(value).toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
                      <Input
                        type="number"
                        placeholder="अन्य राशि दर्ज करें"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10"
                        data-testid="input-custom-amount"
                      />
                    </div>
                  </div>

                  <Button onClick={handleProceedToPayment} className="w-full" size="lg" data-testid="button-proceed">
                    भुगतान पर आगे बढ़ें → Rs.{amount || 0}
                  </Button>
                </div>
              </Card>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">आपका प्रभाव / Your Impact</h2>
                <div className="space-y-4">
                  {impactItems.map((item) => (
                    <div key={item.amount} className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="w-20 text-right">
                        <span className="text-xl font-bold text-primary">Rs.{item.amount}</span>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" />
                        <span className="text-foreground text-sm">{item.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-sm text-foreground">
                    <strong>80G Tax Benefit:</strong> मानव वेलफेयर सेवा सोसाइटी को दिए गए सभी दान आयकर अधिनियम की धारा 80G के तहत कर कटौती के योग्य हैं।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Card className="p-8 shadow-elevated max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <QrCode className="h-6 w-6 text-primary" />
                भुगतान करें / Make Payment
              </h2>

              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <div className="flex flex-wrap justify-between gap-2 items-center">
                  <span className="text-muted-foreground">दान राशि / Donation Amount</span>
                  <span className="text-2xl font-bold text-primary">Rs.{parseInt(amount).toLocaleString()}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  दाता / Donor: {formData.name} | {formData.phone}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Payment Methods */}
                  <div className="flex gap-4 mb-6">
                    {hasUPI && (
                      <button
                        onClick={() => setSelectedMethod("upi")}
                        className={`flex-1 flex items-center gap-3 p-4 rounded-xl transition-all ${
                          selectedMethod === "upi"
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-muted border-2 border-transparent"
                        }`}
                        data-testid="button-method-upi"
                      >
                        <QrCode className="h-5 w-5" />
                        <span className="font-medium">UPI / QR</span>
                      </button>
                    )}
                    {hasBank && (
                      <button
                        onClick={() => setSelectedMethod("bank")}
                        className={`flex-1 flex items-center gap-3 p-4 rounded-xl transition-all ${
                          selectedMethod === "bank"
                            ? "bg-primary/10 border-2 border-primary"
                            : "bg-muted border-2 border-transparent"
                        }`}
                        data-testid="button-method-bank"
                      >
                        <Building className="h-5 w-5" />
                        <span className="font-medium">Bank Transfer</span>
                      </button>
                    )}
                  </div>

                  {/* UPI Payment */}
                  {selectedMethod === "upi" && (hasQR || hasUPI) && (
                    <div className="bg-secondary/10 rounded-xl p-6">
                      {hasQR && (
                        <div className="flex justify-center mb-4">
                          <div className="w-48 h-48 bg-white rounded-xl p-2 shadow-md">
                            <img 
                              src={donationConfig.qrCodeUrl} 
                              alt="Payment QR Code" 
                              className="w-full h-full object-contain"
                              data-testid="img-qr-code"
                            />
                          </div>
                        </div>
                      )}
                      {hasUPI && (
                        <div className="flex items-center justify-center gap-2 bg-card rounded-lg px-4 py-2 border max-w-xs mx-auto">
                          <span className="font-mono text-foreground">{donationConfig.upiId}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyUPI(donationConfig.upiId!)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        PhonePe / Google Pay / Paytm / BHIM से स्कैन करें
                      </p>
                    </div>
                  )}

                  {/* Bank Transfer */}
                  {selectedMethod === "bank" && hasBank && (
                    <div className="bg-primary/10 rounded-xl p-6">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Bank Transfer Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex flex-wrap justify-between gap-1">
                          <span className="text-muted-foreground">Account Name:</span>
                          <span className="font-medium text-foreground">{donationConfig.accountHolderName}</span>
                        </div>
                        <div className="flex flex-wrap justify-between gap-1">
                          <span className="text-muted-foreground">Bank:</span>
                          <span className="font-medium text-foreground">{donationConfig.bankName}</span>
                        </div>
                        <div className="flex flex-wrap justify-between gap-1">
                          <span className="text-muted-foreground">Account No:</span>
                          <span className="font-medium text-foreground">{donationConfig.accountNumber}</span>
                        </div>
                        <div className="flex flex-wrap justify-between gap-1">
                          <span className="text-muted-foreground">IFSC Code:</span>
                          <span className="font-medium text-foreground">{donationConfig.ifscCode}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UTR Number Input */}
                  <div className="border-t border-border pt-6">
                    <Label htmlFor="transactionId" className="text-base font-semibold">
                      भुगतान के बाद UTR / Transaction ID दर्ज करें *
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      भुगतान करने के बाद आपको SMS या UPI ऐप में UTR Number मिलेगा
                    </p>
                    <Input 
                      id="transactionId"
                      placeholder="उदाहरण: 123456789012"
                      value={formData.transactionId}
                      onChange={(e) => handleChange('transactionId', e.target.value)}
                      className="text-lg"
                      data-testid="input-utr-number"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitDonation} 
                    className="w-full" 
                    size="lg"
                    disabled={isProcessing}
                    data-testid="button-submit-donation"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        जमा हो रहा है...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        दान जमा करें / Submit Donation
                      </>
                    )}
                  </Button>

                  <Button variant="outline" onClick={() => setStep(1)} className="w-full" data-testid="button-go-back">
                    ← वापस जाएं
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && isSubmitted && (
            <Card className="p-8 shadow-elevated text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                धन्यवाद! / Thank You!
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                आपका दान अनुरोध प्रशासक को भेज दिया गया है।<br />
                Your donation request has been sent for approval.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  विवरण / Details
                </h3>
                <div className="text-left text-amber-700 dark:text-amber-300 space-y-2 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>नाम / Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>राशि / Amount:</span>
                    <span className="font-medium">Rs.{parseInt(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>UTR Number:</span>
                    <span className="font-mono font-medium">{formData.transactionId}</span>
                  </div>
                </div>
              </div>
              <div className="bg-muted rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 inline mr-2 text-primary" />
                  प्रशासक आपके भुगतान की पुष्टि करेगा और आपको सूचित किया जाएगा।
                </p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = "/"} data-testid="button-go-home">
                होम पेज पर जाएं / Go to Home
              </Button>
            </Card>
          )}
        </div>
      </section>
    </Layout>
  );
}
