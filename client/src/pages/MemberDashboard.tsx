import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, LogOut, Mail, Phone, MapPin, Loader2, Settings, CreditCard, CheckCircle, Clock, AlertCircle, CreditCard as ICardIcon } from "lucide-react";
import MemberICard from "@/components/member/MemberICard";

interface MemberData {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  city?: string;
  membershipNumber: string;
  createdAt?: string;
  address?: string;
}

interface PaymentTransaction {
  id: string;
  type: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  transactionId: string;
  createdAt: string;
  purpose?: string;
}

interface MemberCard {
  id: string;
  memberId: string;
  membershipNumber: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberCity?: string;
  memberAddress?: string;
  cardNumber: string;
  qrCodeUrl?: string;
  cardImageUrl?: string;
  isGenerated: boolean;
  validFrom: string;
  validUntil: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function MemberDashboard() {
  const { user, logout, isMember, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberData | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [iCard, setICard] = useState<MemberCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iCardLoading, setICardLoading] = useState(false);
  const [iCardError, setICardError] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !isMember) {
      navigate("/member/login");
      return;
    }

    if (user?.id) {
      fetchMemberData();
      fetchPaymentTransactions();
    }
  }, [isMember, user, authLoading, navigate]);

  useEffect(() => {
    if (activeTab === "icard" && user?.id) {
      fetchMemberICard();
    }
  }, [activeTab, user?.id]);

  const fetchMemberData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/auth/member/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMember({
          id: data.id || data._id,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          city: data.city,
          membershipNumber: data.membershipNumber,
          createdAt: data.createdAt,
          address: data.address,
        });
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentTransactions = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/auth/member/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions(data || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchMemberICard = async () => {
    try {
      setICardLoading(true);
      setICardError(undefined);
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/auth/member/icard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setICard(data);
      } else {
        const error = await res.json();
        setICardError(error.error || "Failed to load I-Card");
        setICard(null);
      }
    } catch (error) {
      console.error("Error fetching I-Card:", error);
      setICardError("Failed to load I-Card. Please try again later.");
    } finally {
      setICardLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/member/login");
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!member) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Member record not found. Please contact admin.</p>
          <Button onClick={handleLogout} className="mt-4">
            Logout
          </Button>
        </div>
      </Layout>
    );
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-orange-500">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const sidebarItems = [
    { id: "dashboard", icon: Users, label: "Dashboard", labelHi: "डैशबोर्ड" },
    { id: "payments", icon: CreditCard, label: "Payment Status", labelHi: "भुगतान स्थिति" },
    { id: "icard", icon: ICardIcon, label: "I-Card", labelHi: "आई-कार्ड" },
    { id: "settings", icon: Settings, label: "Settings", labelHi: "सेटिंग्स" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <div className="text-center mb-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{member.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{member.membershipNumber}</p>
                  {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
                </div>
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1 space-y-6">
            {activeTab === "dashboard" && (
              <>
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">Welcome, {member.fullName}!</h1>
                    <p className="text-muted-foreground">Member Dashboard / सदस्य डैशबोर्ड</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Membership No.</p>
                      <p className="text-lg font-bold">{member.membershipNumber}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className="bg-green-500 mt-2">Active</Badge>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="text-lg font-bold">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString("en-IN")
                          : "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="text-lg font-bold">{member.city || "Not specified"}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="text-primary" />
                      Member Details / सदस्य विवरण
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                        <p className="font-medium text-lg">{member.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </p>
                        <p className="font-medium">{member.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </p>
                        <p className="font-medium">{member.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          City
                        </p>
                        <p className="font-medium">{member.city || "-"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {member.address && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="text-blue-600" />
                        Address / पता
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground">{member.address}</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 text-blue-900 dark:text-blue-200">
                      Membership Benefits / सदस्यता लाभ
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                      <li>✓ Access to all society programs and events</li>
                      <li>✓ समाज के सभी कार्यक्रमों तक पहुंच</li>
                      <li>✓ Regular updates and newsletters</li>
                      <li>✓ नियमित अपडेट और समाचार पत्र</li>
                      <li>✓ Participation in community service activities</li>
                      <li>✓ सामुदायिक सेवा गतिविधियों में भागीदारी</li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "payments" && (
              <>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Payment Status / भुगतान स्थिति</h2>
                    <p className="text-muted-foreground">Track your registration payment status</p>
                  </div>

                  {transactions.length === 0 ? (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                      <CardContent className="p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                        <p className="font-semibold text-orange-900 dark:text-orange-200 mb-1">No Payment Transactions</p>
                        <p className="text-sm text-orange-800 dark:text-orange-300">
                          आपके कोई भुगतान लेनदेन नहीं मिले। कृपया रजिस्ट्रेशन फॉर्म फिर से भरें।
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <Card key={transaction.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-foreground">
                                    Registration Payment / रजिस्ट्रेशन भुगतान
                                  </span>
                                  {getPaymentStatusBadge(transaction.status)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Transaction ID</p>
                                    <p className="font-mono font-medium">{transaction.transactionId}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Amount</p>
                                    <p className="font-semibold">₹{transaction.amount}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Date</p>
                                    <p>{new Date(transaction.createdAt).toLocaleDateString("en-IN")}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Purpose</p>
                                    <p>{transaction.purpose || "Member Registration"}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {getPaymentStatusIcon(transaction.status)}
                              </div>
                            </div>

                            {transaction.status === "pending" && (
                              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                                <p className="text-sm text-orange-800 dark:text-orange-300">
                                  ⏳ आपका भुगतान प्रशासक द्वारा सत्यापित किया जा रहा है। कृपया 24-48 घंटों में प्रतीक्षा करें।
                                </p>
                              </div>
                            )}

                            {transaction.status === "approved" && (
                              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                <p className="text-sm text-green-800 dark:text-green-300">
                                  ✓ आपका भुगतान स्वीकृत हो गया है। आप अब अपने खाते में लॉगिन कर सकते हैं।
                                </p>
                              </div>
                            )}

                            {transaction.status === "rejected" && (
                              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-800 dark:text-red-300">
                                  ✗ आपका भुगतान अस्वीकार कर दिया गया है। कृपया सही Transaction ID के साथ फिर से प्रयास करें।
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "icard" && (
              <MemberICard
                iCard={iCard}
                isLoading={iCardLoading}
                error={iCardError}
              />
            )}

            {activeTab === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="text-blue-600" />
                    Settings / सेटिंग्स
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium mb-2">Account Security / खाता सुरक्षा</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      अपने खाते को सुरक्षित रखने के लिए अपना पासवर्ड नियमित रूप से बदलें।
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/member/forgot-password")}
                    >
                      Change Password / पासवर्ड बदलें
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
