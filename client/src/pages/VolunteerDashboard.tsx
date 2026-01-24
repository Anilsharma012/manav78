import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Users, Mail, Phone, MapPin, Clock, CheckCircle, XCircle, 
  LogOut, User, Award, Calendar, AlertCircle, Loader2, Receipt 
} from "lucide-react";
import { useLocation, Link } from "wouter";

interface TransactionData {
  id: number;
  type: string;
  amount: number;
  transactionId: string;
  status: string;
  createdAt: string;
  purpose?: string;
}

interface VolunteerData {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  skills: string;
  isActive: boolean;
  isApproved: boolean;
  approvedAt: string | null;
  createdAt: string;
}

export default function VolunteerDashboard() {
  const [, setLocation] = useLocation();
  const [volunteer, setVolunteer] = useState<VolunteerData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("volunteer_token");
    const userData = localStorage.getItem("volunteer_user");

    if (!token || !userData) {
      setLocation("/volunteer/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setVolunteer(parsedUser);
      fetchTransactions(token);
    } catch (error) {
      localStorage.removeItem("volunteer_token");
      localStorage.removeItem("volunteer_user");
      setLocation("/volunteer/login");
    }

    setIsLoading(false);
  }, [setLocation]);

  const fetchTransactions = async (token: string) => {
    if (!token) return;
    
    try {
      const res = await fetch("/api/my-transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("volunteer_token");
    localStorage.removeItem("volunteer_user");
    toast({
      title: "लॉगआउट सफल",
      description: "आप सफलतापूर्वक लॉगआउट हो गए हैं।",
    });
    setLocation("/volunteer/login");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!volunteer) {
    return null;
  }

  return (
    <Layout>
      <section className="py-8 bg-gradient-to-br from-primary/5 to-secondary/5 min-h-[80vh]">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Volunteer Dashboard
              </h1>
              <p className="text-muted-foreground">
                स्वयंसेवक डैशबोर्ड
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout / लॉगआउट
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="p-6 lg:col-span-1">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">{volunteer.fullName}</h2>
                <p className="text-muted-foreground">Volunteer / स्वयंसेवक</p>
                
                <div className="mt-4">
                  {volunteer.isApproved ? (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approved / स्वीकृत
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Approval / अनुमोदन लंबित
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{volunteer.email}</span>
                </div>
                {volunteer.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{volunteer.phone}</span>
                  </div>
                )}
                {volunteer.city && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{volunteer.city}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Status & Info Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Approval Status */}
              {!volunteer.isApproved && (
                <Card className="p-6 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                        अनुमोदन लंबित / Approval Pending
                      </h3>
                      <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
                        आपका आवेदन प्रशासक के पास समीक्षा के लिए है। अनुमोदन के बाद आपको पूर्ण पहुंच मिल जाएगी।
                      </p>
                      <p className="text-amber-600 dark:text-amber-400 text-sm">
                        Your application is under review. You will get full access after approval.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Welcome Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Welcome to MWSS Volunteer Program
                </h3>
                <p className="text-muted-foreground mb-4">
                  मानव वेलफेयर सेवा सोसाइटी के स्वयंसेवक कार्यक्रम में आपका स्वागत है। 
                  आप समाज सेवा में महत्वपूर्ण योगदान दे रहे हैं।
                </p>
                
                {volunteer.skills && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Your Interest Areas / आपकी रुचि के क्षेत्र:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {volunteer.skills.split(",").map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Registration Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Registration Details / पंजीकरण विवरण
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Registration Date:</span>
                    <p className="font-medium text-foreground">
                      {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString('hi-IN') : 'N/A'}
                    </p>
                  </div>
                  {volunteer.approvedAt && (
                    <div>
                      <span className="text-muted-foreground">Approval Date:</span>
                      <p className="font-medium text-foreground">
                        {new Date(volunteer.approvedAt).toLocaleDateString('hi-IN')}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium text-foreground">
                      {volunteer.isActive ? "Active / सक्रिय" : "Inactive / निष्क्रिय"}
                    </p>
                  </div>
                  {volunteer.address && (
                    <div>
                      <span className="text-muted-foreground">Address:</span>
                      <p className="font-medium text-foreground">{volunteer.address}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Transaction History */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Transaction History / लेनदेन इतिहास
                </h3>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((t) => (
                      <div key={t.id} className="p-4 bg-muted rounded-lg" data-testid={`card-transaction-${t.id}`}>
                        <div className="flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <p className="font-medium text-foreground">{t.purpose || t.type}</p>
                            <p className="text-sm text-muted-foreground">
                              UTR: <span className="font-mono">{t.transactionId}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-primary">Rs.{t.amount}</span>
                            <Badge variant={t.status === 'approved' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'}>
                              {t.status === 'approved' ? 'Approved' : t.status === 'pending' ? 'Pending' : 'Rejected'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                    <p className="text-sm">कोई लेनदेन नहीं मिला</p>
                  </div>
                )}
              </Card>

              {/* Contact Support */}
              <Card className="p-6 bg-primary/5">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Need Help? / सहायता चाहिए?
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  किसी भी सहायता के लिए हमसे संपर्क करें।
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="tel:+919812676818">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      +91 98126 76818
                    </Button>
                  </a>
                  <a href="mailto:manavwelfare.mwss@gmail.com">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Us
                    </Button>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
