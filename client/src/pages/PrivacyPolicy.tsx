import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, Lock, Eye, Database, Mail, Phone } from "lucide-react";
import Layout from "@/components/layout/Layout";

interface PrivacyPolicyData {
  id: string;
  type: string;
  titleEnglish: string;
  titleHindi?: string;
  contentEnglish: string;
  contentHindi?: string;
  version: number;
  isActive: boolean;
  createdAt: string;
}

export default function PrivacyPolicy() {
  const { data: policy, isLoading } = useQuery<PrivacyPolicyData | null>({
    queryKey: ["/api/public/privacy-policy"],
  });

  useEffect(() => {
    document.title = "Privacy Policy - Manav Welfare Seva Society";
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-96 flex items-center justify-center" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12" data-testid="privacy-policy-page">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-primary" data-testid="icon-shield" />
            </div>
            <h1 className="text-4xl font-bold mb-4" data-testid="text-title">Privacy Policy / गोपनीयता नीति</h1>
            <p className="text-muted-foreground" data-testid="text-subtitle-english">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <p className="text-muted-foreground mt-2" data-testid="text-subtitle-hindi">
              आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। यह नीति बताती है कि हम आपकी जानकारी कैसे एकत्र, उपयोग और सुरक्षित करते हैं।
            </p>
          </div>

          {policy ? (
            <Card data-testid="card-policy-content">
              <CardHeader>
                <CardTitle data-testid="text-policy-title">{policy.titleEnglish}</CardTitle>
                {policy.titleHindi && (
                  <p className="text-muted-foreground" data-testid="text-policy-title-hindi">{policy.titleHindi}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm max-w-none dark:prose-invert" data-testid="text-policy-content">
                  <div dangerouslySetInnerHTML={{ __html: policy.contentEnglish }} />
                </div>
                
                {policy.contentHindi && (
                  <div className="mt-8 pt-8 border-t" data-testid="section-hindi-content">
                    <h3 className="text-lg font-semibold mb-4">{policy.titleHindi}</h3>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: policy.contentHindi }} />
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-8 pt-4 border-t" data-testid="text-policy-meta">
                  <p>Version: {policy.version}</p>
                  <p>Last updated: {new Date(policy.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6" data-testid="section-default-policy">
              <Card data-testid="card-info-collection">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Information We Collect / हम जो जानकारी एकत्र करते हैं
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p data-testid="text-info-intro">We collect the following types of information:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground" data-testid="list-info-types">
                    <li><strong>Personal Information:</strong> Name, email, phone number, address, date of birth</li>
                    <li><strong>Educational Information:</strong> Class, school name, roll number, exam results</li>
                    <li><strong>Payment Information:</strong> Transaction details for donations and membership fees</li>
                    <li><strong>Photos:</strong> Student photos for admit cards and identification purposes</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-muted-foreground">हम निम्नलिखित प्रकार की जानकारी एकत्र करते हैं:</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                      <li><strong>व्यक्तिगत जानकारी:</strong> नाम, ईमेल, फोन नंबर, पता, जन्म तिथि</li>
                      <li><strong>शैक्षिक जानकारी:</strong> कक्षा, स्कूल का नाम, रोल नंबर, परीक्षा परिणाम</li>
                      <li><strong>भुगतान जानकारी:</strong> दान और सदस्यता शुल्क के लिए लेनदेन विवरण</li>
                      <li><strong>फोटो:</strong> प्रवेश पत्र और पहचान उद्देश्यों के लिए छात्र फोटो</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-data-usage">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    How We Use Your Information / हम आपकी जानकारी का उपयोग कैसे करते हैं
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p data-testid="text-usage-intro">Your information is used for:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground" data-testid="list-usage-types">
                    <li>Student registration and management</li>
                    <li>Generating admit cards and roll numbers</li>
                    <li>Processing donations and membership payments</li>
                    <li>Sending important notifications about exams, results, and events</li>
                    <li>Improving our educational services</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-muted-foreground">आपकी जानकारी का उपयोग इसके लिए किया जाता है:</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                      <li>छात्र पंजीकरण और प्रबंधन</li>
                      <li>प्रवेश पत्र और रोल नंबर जारी करना</li>
                      <li>दान और सदस्यता भुगतान की प्रक्रिया</li>
                      <li>परीक्षाओं, परिणामों और कार्यक्रमों के बारे में महत्वपूर्ण सूचनाएं भेजना</li>
                      <li>हमारी शैक्षिक सेवाओं में सुधार</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-data-security">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Data Security / डेटा सुरक्षा
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p data-testid="text-security-intro">We implement appropriate security measures to protect your personal information:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground" data-testid="list-security-measures">
                    <li>Secure encrypted connections (HTTPS)</li>
                    <li>Password protection for all accounts</li>
                    <li>Limited access to personal data by authorized personnel only</li>
                    <li>Regular security audits and updates</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-muted-foreground">हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उचित सुरक्षा उपाय लागू करते हैं:</p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                      <li>सुरक्षित एन्क्रिप्टेड कनेक्शन (HTTPS)</li>
                      <li>सभी खातों के लिए पासवर्ड सुरक्षा</li>
                      <li>केवल अधिकृत कर्मियों द्वारा व्यक्तिगत डेटा तक सीमित पहुंच</li>
                      <li>नियमित सुरक्षा ऑडिट और अपडेट</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-contact">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contact Us / हमसे संपर्क करें
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p data-testid="text-contact-intro">If you have any questions about our privacy practices, please contact us:</p>
                  <div className="flex flex-col gap-2 text-muted-foreground">
                    <div className="flex items-center gap-2" data-testid="text-contact-email">
                      <Mail className="h-4 w-4" />
                      <span>info@manavwelfare.org</span>
                    </div>
                    <div className="flex items-center gap-2" data-testid="text-contact-phone">
                      <Phone className="h-4 w-4" />
                      <span>+91 98126 76818</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-muted-foreground">यदि आपको हमारी गोपनीयता प्रथाओं के बारे में कोई प्रश्न है, तो कृपया हमसे संपर्क करें।</p>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground" data-testid="text-last-updated">
                <p>Last updated: January 2026 / अंतिम अपडेट: जनवरी 2026</p>
                <p className="mt-2">Manav Welfare Seva Society, Bhuna, Haryana</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
