import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, Copy, Loader2, QrCode, Building } from "lucide-react";
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
}

const MEMBERSHIP_FEE = 99;

export default function MemberRegistration() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [registrationData, setRegistrationData] = useState<{ email: string; membershipNumber: string } | null>(null);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signup } = useAuth();

  useEffect(() => {
    const fetchPaymentConfigs = async () => {
      try {
        const res = await fetch("/api/public/payment-config/membership");
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

  const [formData, setFormData] = useState({
    memberName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "Haryana",
    address: "",
    transactionId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Get payment config for membership
  const paymentConfig = paymentConfigs[0];
  const hasQR = paymentConfig?.qrCodeUrl;
  const hasUPI = paymentConfig?.upiId;
  const hasBank = paymentConfig?.bankName;

  const handleProceedToPayment = () => {
    if (!formData.memberName || !formData.email || !formData.password || !formData.phone) {
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

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password मेल नहीं खाते",
        description: "दोनों पासवर्ड एक जैसे होने चाहिए",
        variant: "destructive",
      });
      return;
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
        fullName: formData.memberName,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
      });

      if (result.success) {
        // Create payment transaction for admin approval
        try {
          const txResponse = await fetch("/api/public/payment-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "membership",
              name: formData.memberName,
              email: formData.email,
              phone: formData.phone,
              amount: MEMBERSHIP_FEE,
              transactionId: formData.transactionId,
              paymentMethod: "upi",
              purpose: `Member Registration - ₹${MEMBERSHIP_FEE}`,
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
          membershipNumber: result.registrationNumber || "",
        });
        setStep(3);

        toast({
          title: "रजिस्ट्रेशन सफल!",
          description: "आपका रजिस्ट्रेशन पूरा हो गया है। भुगतान की पुष्टि होने पर लॉगिन कर सकते हैं।",
        });
      } else {
        throw new Error(result.error);
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

  if (registrationData) {
    return (
      <Layout>
        <div className="min-h-[80vh] py-12 px-4">
          <div className="max-w-2xl mx-auto">
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
                    <Label className="text-muted-foreground">Membership Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold">{registrationData.membershipNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(registrationData.membershipNumber)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email / ईमेल</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold">{registrationData.email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(registrationData.email)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    आपने जो password दिया था वही use करें login के लिए
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-200">
                    ⏳ Admin Approval Pending / व्यवस्थापक की मंजूरी की प्रतीक्षा है
                  </h4>
                  <div className="text-orange-800 dark:text-orange-300 text-sm space-y-1">
                    <p><strong>Step 1:</strong> Admin will verify your payment transaction</p>
                    <p><strong>Step 2:</strong> Admin will verify and approve your membership account</p>
                    <p className="mt-2">कृपया अगले 24-48 घंटों में admin की मंजूरी के लिए प्रतीक्षा करें।</p>
                    <p>दोनों approval के बाद आप अपने Email और Password से login कर सकेंगे।</p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Important / महत्वपूर्ण:</strong> कृपया अपना Email और Password सुरक्षित रखें।
                    आप इनका उपयोग Member Portal में Login करने के लिए करेंगे।
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate("/")} className="flex-1">
                    Home / होम
                  </Button>
                  <Button onClick={() => navigate("/member/login")} className="flex-1 bg-primary">
                    Check Login Status / लॉगिन स्थिति जांचें
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 mb-4">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Member Registration
            </h1>
            <p className="text-muted-foreground mt-2">सदस्य रजिस्ट्रेशन फॉर्म</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${step > s ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle>Member Details / सदस्य जानकारी</CardTitle>
                <CardDescription>कृपया सभी जानकारी सही-सही भरें</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberName">Member Name / सदस्य का नाम *</Label>
                    <Input
                      id="memberName"
                      name="memberName"
                      value={formData.memberName}
                      onChange={handleChange}
                      placeholder="सदस्य का पूरा नाम"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email / ईमेल *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password / पासवर्ड *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="कम से कम 6 अक्षर"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password / पासवर्ड की पुष्टि करें *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="पासवर्ड फिर से दर्ज करें"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number / मोबाइल नंबर *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10 अंकों का नंबर"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City / शहर</Label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    >
                      <option value="Haryana">Haryana / हरियाणा</option>
                      <option value="Delhi">Delhi / दिल्ली</option>
                      <option value="Punjab">Punjab / पंजाब</option>
                      <option value="Himachal">Himachal Pradesh / हिमाचल प्रदेश</option>
                      <option value="Other">Other / अन्य</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address / पता</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="आपका पूरा पता"
                  />
                </div>

                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-lg font-semibold">
                    Membership Fee / सदस्यता शुल्क: <span className="text-primary">Rs.{MEMBERSHIP_FEE}</span>
                  </p>
                </div>

                <Button onClick={handleProceedToPayment} className="w-full bg-primary">
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
                <div className="bg-primary/10 p-4 rounded-lg text-center">
                  <p className="text-lg text-muted-foreground">Membership Fee / सदस्यता शुल्क</p>
                  <p className="text-3xl font-bold text-primary">Rs.{MEMBERSHIP_FEE}</p>
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
                          Amount: Rs.{MEMBERSHIP_FEE} के लिए QR Code
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                          <img
                            src={paymentConfig.qrCodeUrl}
                            alt="Payment QR Code"
                            className="w-48 h-48 object-contain"
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
                          <Input value={paymentConfig.upiId} readOnly className="bg-muted font-mono" />
                          <Button variant="outline" onClick={() => copyToClipboard(paymentConfig.upiId!)}>
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
                            <span className="font-medium">{paymentConfig.accountHolderName}</span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-muted-foreground">Bank:</span>
                            <span className="font-medium">{paymentConfig.bankName}</span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-muted-foreground">Account No:</span>
                            <span className="font-mono font-medium">{paymentConfig.accountNumber}</span>
                          </div>
                          <div className="flex flex-wrap justify-between gap-1">
                            <span className="text-muted-foreground">IFSC:</span>
                            <span className="font-mono font-medium">{paymentConfig.ifscCode}</span>
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
                  <Input
                    id="transactionId"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                    placeholder="Transaction/UTR ID दर्ज करें"
                    required
                  />
                  <p className="text-xs text-muted-foreground">भुगतान करने के बाद Transaction ID या UTR Number डालें</p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back / वापस</Button>
                  <Button onClick={handlePaymentVerification} disabled={isProcessing} className="flex-1 bg-primary">
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
                    <Label className="text-muted-foreground">Membership Number</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold">{registrationData.membershipNumber}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(registrationData.membershipNumber)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email / ईमेल</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-bold">{registrationData.email}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(registrationData.email)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    आपने जो password दिया था वही use करें login के लिए
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-200">
                    ⏳ Admin Approval Pending / व्यवस्थापक की मंजूरी की प्रतीक्षा है
                  </h4>
                  <div className="text-orange-800 dark:text-orange-300 text-sm space-y-1">
                    <p><strong>Step 1:</strong> Admin will verify your payment transaction</p>
                    <p><strong>Step 2:</strong> Admin will verify and approve your membership account</p>
                    <p className="mt-2">कृपया अगले 24-48 घंटों में admin की मंजूरी के लिए प्रतीक्षा करें।</p>
                    <p>दोनों approval के बाद आप अपने Email और Password से login कर सकेंगे।</p>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Important / महत्वपूर्ण:</strong> कृपया अपना Email और Password सुरक्षित रखें।
                    आप इनका उपयोग Member Portal में Login करने के लिए करेंगे।
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => navigate("/")} className="flex-1">Home / होम</Button>
                  <Button onClick={() => navigate("/member/login")} className="flex-1 bg-primary">
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
