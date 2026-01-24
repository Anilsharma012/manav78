import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, FileText, Award, Receipt, LogOut, Download, IdCard, Users, Hash, Loader2 } from "lucide-react";

interface StudentData {
  id: number;
  registrationNumber: string;
  class: string;
  rollNumber?: string;
  feeLevel: string;
  feeAmount: number;
  feePaid: boolean;
  fullName: string;
  fatherName?: string;
  phone?: string;
  email?: string;
}

interface ResultData {
  id: number;
  examName: string;
  marksObtained?: number;
  totalMarks: number;
  grade?: string;
  rank?: number;
}

interface AdmitCardData {
  _id?: string;
  id?: number;
  examName: string;
  fileUrl: string;
  fileName: string;
  studentPhotoUrl?: string;
}

interface MembershipCardData {
  id?: string;
  _id?: string;
  cardNumber: string;
  memberName: string;
  memberPhoto?: string;
  validFrom: string;
  validUntil: string;
  paymentStatus?: string;
  isGenerated?: boolean;
  memberEmail?: string;
  memberPhone?: string;
}

interface TransactionData {
  id: number;
  type: string;
  amount: number;
  transactionId: string;
  status: string;
  createdAt: string;
  purpose?: string;
}

export default function StudentDashboard() {
  const { user, logout, isStudent, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [results, setResults] = useState<ResultData[]>([]);
  const [admitCards, setAdmitCards] = useState<AdmitCardData[]>([]);
  const [membershipCard, setMembershipCard] = useState<MembershipCardData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !isStudent) {
      navigate("/student/login");
      return;
    }
    
    if (user?.id) {
      fetchStudentData();
      fetchMembershipCard();
      fetchTransactions();
    }
  }, [isStudent, user, authLoading, navigate]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem("auth_token");
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

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/my-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        setResults(data.results || []);
        setAdmitCards(data.admitCards || []);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembershipCard = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/my-membership-card", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembershipCard(data);
      }
    } catch (error) {
      console.error("Error fetching membership card:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/student/login");
  };

  const downloadAdmitCard = (card: AdmitCardData) => {
    try {
      let admitData = { examName: card.examName };

      // Try to parse fileUrl as JSON if it contains data
      try {
        if (card.fileUrl.startsWith('{') || card.fileUrl.startsWith('[')) {
          admitData = JSON.parse(card.fileUrl);
        }
      } catch {
        // fileUrl is not JSON, will use it as-is
      }

      const admitCardHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Admit Card - ${student?.fullName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px 20px;
      max-width: 900px;
      margin: 0 auto;
      background: #f5f5f5;
    }
    .admit-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 4px solid #c00;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .title {
      color: #c00;
      font-size: 26px;
      font-weight: bold;
      margin: 10px 0;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
      margin: 5px 0;
    }
    .admit-title {
      background: #c00;
      color: white;
      padding: 15px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      margin: 25px 0;
      border-radius: 4px;
    }
    .details-section {
      margin: 25px 0;
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
    }
    .detail-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-label {
      font-weight: bold;
      width: 200px;
      color: #333;
    }
    .detail-value {
      flex: 1;
      color: #666;
      word-break: break-word;
    }
    .exam-info {
      background: #f9f9f9;
      padding: 20px;
      margin: 25px 0;
      border-left: 4px solid #c00;
      border-radius: 4px;
    }
    .exam-info h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 16px;
    }
    .terms-section {
      margin-top: 25px;
      border: 2px solid #c00;
      padding: 20px;
      border-radius: 4px;
      background: #fff9f9;
    }
    .terms-header {
      background: #c00;
      color: white;
      padding: 10px 15px;
      margin: -20px -20px 15px -20px;
      border-radius: 2px 2px 0 0;
      font-weight: bold;
      font-size: 16px;
    }
    .terms-section ol {
      margin: 0;
      padding-left: 20px;
    }
    .terms-section li {
      margin-bottom: 8px;
      line-height: 1.6;
      font-size: 13px;
      color: #555;
    }
    .signature {
      margin-top: 35px;
      text-align: right;
      padding-top: 20px;
    }
    .signature-line {
      border-top: 2px solid #333;
      width: 180px;
      margin-left: auto;
      margin-bottom: 5px;
    }
    .signature-text {
      font-weight: bold;
      color: #333;
    }
    @media print {
      body {
        padding: 0;
        background: white;
      }
      .admit-container {
        box-shadow: none;
        padding: 20px;
      }
      .terms-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="admit-container">
    <div class="header">
      <div class="title">Manav Welfare Seva Society</div>
      <div class="subtitle">मानव वेलफेयर सेवा सोसाइटी</div>
      <div class="subtitle">Reg. No: 01215 | Phone: +91 98126 76818</div>
      <div class="subtitle">Bhuna, Haryana</div>
    </div>

    <div class="admit-title">ADMIT CARD / प्रवेश पत्र</div>

    <div style="display: flex; gap: 30px; margin: 25px 0;">
      <div style="flex: 1;">
        <div class="details-section">
          <div class="detail-row">
            <span class="detail-label">Roll Number / रोल नंबर:</span>
            <span class="detail-value">${student?.rollNumber || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Registration No / पंजीकरण:</span>
            <span class="detail-value">${student?.registrationNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Student Name / छात्र का नाम:</span>
            <span class="detail-value">${student?.fullName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Father's Name / पिता का नाम:</span>
            <span class="detail-value">${student?.fatherName || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Class / कक्षा:</span>
            <span class="detail-value">${student?.class}</span>
          </div>
        </div>
      </div>
      ${student?.photoUrl ? `
      <div style="flex-shrink: 0;">
        <div style="border: 2px solid #999; border-radius: 4px; width: 120px; height: 150px; overflow: hidden; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
          <img src="${student.photoUrl}" alt="Student Photo" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <p style="text-align: center; font-size: 11px; margin-top: 8px; color: #666; font-weight: bold;">Photo</p>
      </div>
      ` : `
      <div style="flex-shrink: 0;">
        <div style="border: 2px dashed #999; border-radius: 4px; width: 120px; height: 150px; overflow: hidden; background: #f9f9f9; display: flex; align-items: center; justify-content: center; color: #999; text-align: center; font-size: 12px;">
          No Photo
        </div>
      </div>
      `}
    </div>

    <div class="exam-info">
      <h3>Exam Details / परीक्षा विवरण</h3>
      <div class="detail-row" style="border: none; padding: 8px 0;">
        <span class="detail-label" style="width: auto; margin-right: 20px;">Exam Name / परीक्षा:</span>
        <span class="detail-value">${admitData?.examName || card.examName || 'To be announced'}</span>
      </div>
      <div class="detail-row" style="border: none; padding: 8px 0;">
        <span class="detail-label" style="width: auto; margin-right: 20px;">Date / तारीख:</span>
        <span class="detail-value">${admitData?.examDate || 'To be announced / घोषित किया जाएगा'}</span>
      </div>
      <div class="detail-row" style="border: none; padding: 8px 0;">
        <span class="detail-label" style="width: auto; margin-right: 20px;">Time / समय:</span>
        <span class="detail-value">${admitData?.examTime || 'To be announced / घोषित किया जाएगा'}</span>
      </div>
      <div class="detail-row" style="border: none; padding: 8px 0;">
        <span class="detail-label" style="width: auto; margin-right: 20px;">Center / केंद्र:</span>
        <span class="detail-value">${admitData?.examCenter || 'To be announced / घोषित किया जाएगा'}</span>
      </div>
    </div>

    <div class="terms-section">
      <div class="terms-header">Terms & Conditions / नियम एवं शर्तें</div>
      <ol>
        <li>Bring this admit card to the examination center. / यह प्रवेश पत्र परीक्षा केंद्र पर लाएं।</li>
        <li>Bring a valid photo ID (Aadhar/School ID). / वैध फोटो पहचान पत्र (आधार/स्कूल आईडी) लाएं।</li>
        <li>Arrive 30 minutes before exam time. / परीक्षा समय से 30 मिनट पहले पहुंचें।</li>
        <li>Electronic devices are strictly prohibited. / इलेक्ट्रॉनिक उपकरण सख्त वर्जित हैं।</li>
        <li>No candidate will be allowed after exam starts. / परीक्षा शुरू होने के बाद प्रवेश नहीं मिलेगा।</li>
        <li>Maintain silence and discipline in exam hall. / परीक्षा हॉल में शांति और अनुशासन बनाए रखें।</li>
        <li>Use of unfair means will result in disqualification. / अनुचित साधनों का प्रयोग अयोग्यता का कारण बनेगा।</li>
        <li>Follow all instructions given by invigilators. / निरीक्षकों द्वारा दिए गए सभी निर्देशों का पालन करें।</li>
        <li>Do not leave exam hall without permission. / बिना अनुमति परीक्षा हॉल न छोड़ें।</li>
        <li>Society's decision on all matters is final. / सभी मामलों में सोसाइटी का निर्णय अंतिम होगा।</li>
      </ol>
    </div>

    <div class="signature">
      <div class="signature-line"></div>
      <div class="signature-text">Authorized Signature / अधिकृत हस्ताक्षर</div>
      <div style="margin-top: 30px; font-size: 12px; color: #999;">
        <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([admitCardHTML], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `admit_card_${student?.rollNumber || student?.registrationNumber || 'student'}_${new Date().getTime()}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading admit card:', error);
      // Fallback: try to open fileUrl if it's a valid URL
      if (card.fileUrl && (card.fileUrl.startsWith('http') || card.fileUrl.startsWith('/'))) {
        window.open(card.fileUrl, '_blank');
      } else {
        alert('Error downloading admit card. Please try again or contact support.');
      }
    }
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

  if (!student) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Student record not found. Please contact admin.</p>
          <Button onClick={handleLogout} className="mt-4" data-testid="button-logout">Logout</Button>
        </div>
      </Layout>
    );
  }

  const sidebarItems = [
    { id: "dashboard", icon: GraduationCap, label: "Dashboard", labelHi: "डैशबोर्ड" },
    { id: "admit-card", icon: IdCard, label: "Admit Card", labelHi: "प्रवेश पत्र" },
    { id: "roll-number", icon: Hash, label: "Roll Number", labelHi: "रोल नंबर" },
    { id: "membership", icon: Users, label: "Membership", labelHi: "सदस्यता" },
    { id: "results", icon: Award, label: "Results", labelHi: "परिणाम" },
    { id: "transactions", icon: Receipt, label: "Transactions", labelHi: "लेनदेन" },
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
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground" data-testid="text-student-name">{student.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{student.registrationNumber}</p>
                  {student.email && <p className="text-xs text-muted-foreground">{student.email}</p>}
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
                      data-testid={`button-nav-${item.id}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors"
                    data-testid="button-logout"
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
                    <h1 className="text-2xl font-bold" data-testid="text-welcome">Welcome, {student.fullName}!</h1>
                    <p className="text-muted-foreground">Student Dashboard / छात्र डैशबोर्ड</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Registration No.</p>
                      <p className="text-lg font-bold" data-testid="text-registration-number">{student.registrationNumber}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-secondary">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Roll Number</p>
                      <p className="text-lg font-bold" data-testid="text-roll-number">{student.rollNumber || "Not Assigned"}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Class</p>
                      <p className="text-lg font-bold" data-testid="text-class">{student.class}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Fee Status</p>
                      <Badge variant={student.feePaid ? "default" : "secondary"} className={student.feePaid ? "bg-green-500" : "bg-orange-500"}>
                        {student.feePaid ? "Paid" : "Pending"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="text-secondary" />
                      Student Details / छात्र विवरण
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{student.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Father's Name</p>
                      <p className="font-medium">{student.fatherName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fee Level</p>
                      <p className="font-medium capitalize">{student.feeLevel} Level</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fee Amount</p>
                      <p className="font-medium">Rs.{student.feeAmount}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "admit-card" && (
              <div className="space-y-6">
                {admitCards.length > 0 ? (
                  admitCards.map((card) => {
                    const admitData = JSON.parse(card.fileUrl);
                    const cardId = card._id || card.id;
                    return (
                      <div key={cardId} data-testid={`card-admit-${cardId}`}>
                        {/* Admit Card Preview */}
                        <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          {/* Header */}
                          <div className="border-b-4 border-red-600 p-6 text-center bg-gray-50">
                            <h2 className="text-red-600 font-bold text-2xl mb-2">Manav Welfare Seva Society</h2>
                            <p className="text-gray-600 text-sm mb-1">मानव वेलफेयर सेवा सोसाइटी</p>
                            <p className="text-gray-600 text-xs mb-2">Reg. No: 01215 | Phone: +91 98126 76818</p>
                            <p className="text-gray-600 text-xs">Bhuna, Haryana</p>
                          </div>

                          {/* Title */}
                          <div className="bg-red-600 text-white text-center py-3 font-bold text-lg">
                            ADMIT CARD / प्रवेश पत्र
                          </div>

                          {/* Content */}
                          <div className="p-8">
                            {/* Student Info and Photo */}
                            <div className="flex gap-8 mb-8">
                              <div className="flex-1">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-gray-600 text-sm font-semibold">Roll Number / रोल नंबर</p>
                                    <p className="text-gray-900 font-medium">{student?.rollNumber || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-sm font-semibold">Registration No / पंजीकरण</p>
                                    <p className="text-gray-900 font-medium">{student?.registrationNumber}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-sm font-semibold">Student Name / नाम</p>
                                    <p className="text-gray-900 font-medium">{student?.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-sm font-semibold">Father's Name / पिता</p>
                                    <p className="text-gray-900 font-medium">{student?.fatherName || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-sm font-semibold">Class / कक्षा</p>
                                    <p className="text-gray-900 font-medium">{student?.class}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Photo Area */}
                              <div className="flex-shrink-0">
                                <div className="w-32 h-40 border-2 border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                  {student?.photoUrl || card.studentPhotoUrl ? (
                                    <img
                                      src={student?.photoUrl || card.studentPhotoUrl}
                                      alt="Student Photo"
                                      className="w-full h-full object-cover"
                                      data-testid="img-student-photo"
                                    />
                                  ) : (
                                    <div className="text-center text-gray-400">
                                      <GraduationCap className="h-8 w-8 mx-auto mb-2" />
                                      <p className="text-xs">No Photo</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Exam Details */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                              <h3 className="font-bold text-gray-900 mb-4 text-lg">Exam Details / परीक्षा विवरण</h3>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-gray-600 text-sm font-semibold">Exam Name / परीक्षा</p>
                                  <p className="text-gray-900">{admitData?.examName || card.examName}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-sm font-semibold">Date / तारीख</p>
                                  <p className="text-gray-900">{admitData?.examDate || 'To be announced / घोषित किया जाएगा'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-sm font-semibold">Time / समय</p>
                                  <p className="text-gray-900">{admitData?.examTime || 'To be announced / घोषित किया जाएगा'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-sm font-semibold">Center / केंद्र</p>
                                  <p className="text-gray-900">{admitData?.examCenter || 'To be announced / घोषित किया जाएगा'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="border-2 border-red-600 rounded-lg p-6">
                              <h3 className="font-bold text-red-600 mb-4">Terms & Conditions / नियम एवं शर्तें</h3>
                              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                                <div>
                                  <ol className="space-y-2 list-decimal list-inside">
                                    <li>Bring this admit card to the examination center.</li>
                                    <li>Bring a valid photo ID (Aadhar/School ID).</li>
                                    <li>Arrive 30 minutes before exam time.</li>
                                    <li>Electronic devices are strictly prohibited.</li>
                                    <li>No candidate will be allowed after exam starts.</li>
                                  </ol>
                                </div>
                                <div>
                                  <ol className="space-y-2 list-decimal list-inside">
                                    <li>इस प्रवेश पत्र को परीक्षा केंद्र पर लाएं।</li>
                                    <li>वैध फोटो आईडी (आधार/स्कूल आईडी) लाएं।</li>
                                    <li>परीक्षा समय से 30 मिनट पहले पहुंचें।</li>
                                    <li>इलेक्ट्रॉनिक उपकरण सख्त वर्जित हैं।</li>
                                    <li>परीक्षा शुरू होने के बाद प्रवेश नहीं मिलेगा।</li>
                                  </ol>
                                </div>
                              </div>
                            </div>

                            {/* Signature */}
                            <div className="mt-8 text-right">
                              <p className="border-t border-gray-400 pt-4 inline-block px-4">___________________</p>
                              <p className="text-gray-600 text-sm mt-1">Authorized Signature / अधिकृत हस्ताक्षर</p>
                            </div>
                          </div>
                        </div>

                        {/* Download Button */}
                        <div className="mt-6 flex justify-center">
                          <Button onClick={() => downloadAdmitCard(card)} size="lg" data-testid={`button-download-admit-${cardId}`}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Admit Card
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="text-center py-8 text-muted-foreground">
                      <IdCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Admit card not generated yet</p>
                      <p className="text-sm">प्रवेश पत्र अभी उपलब्ध नहीं है</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "roll-number" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="text-blue-600" />
                    Roll Number / रोल नंबर
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student.rollNumber ? (
                    <div className="text-center py-8">
                      <div className="inline-block bg-primary/10 rounded-2xl p-8">
                        <p className="text-sm text-muted-foreground mb-2">Your Roll Number</p>
                        <p className="text-5xl font-bold text-primary" data-testid="text-roll-number-display">{student.rollNumber}</p>
                      </div>
                      <p className="mt-4 text-muted-foreground">
                        Use this roll number for all exams and official communications.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Hash className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Roll number not assigned yet</p>
                      <p className="text-sm">रोल नंबर अभी आवंटित नहीं हुआ है</p>
                      <p className="text-sm mt-2">Please ensure your fee is paid and contact admin.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "membership" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="text-green-600" />
                    Membership Card / सदस्यता कार्ड
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {membershipCard && membershipCard.isGenerated ? (
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                          {membershipCard.memberPhoto ? (
                            <img src={membershipCard.memberPhoto} alt="Member" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Users className="h-12 w-12 text-primary" />
                          )}
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-sm text-muted-foreground">Member Name</p>
                          <p className="text-xl font-bold" data-testid="text-member-name">{membershipCard.memberName}</p>
                          <p className="text-sm text-muted-foreground mt-2">Card Number</p>
                          <p className="font-mono font-bold text-primary" data-testid="text-card-number">{membershipCard.cardNumber}</p>
                        </div>
                        <div className="md:ml-auto text-center md:text-right">
                          <p className="text-sm text-muted-foreground">Valid Until</p>
                          <p className="font-bold">{new Date(membershipCard.validUntil).toLocaleDateString()}</p>
                          <Badge className="mt-2 bg-green-500">Active</Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No membership card found</p>
                      <p className="text-sm">सदस्यता कार्ड उपलब्ध नहीं है</p>
                      <Button className="mt-4" onClick={() => navigate("/membership")} data-testid="button-get-membership">
                        Get Membership
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "results" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Award className="text-green-600" />
                      Results / परिणाम
                    </h2>
                    <p className="text-muted-foreground mt-1">View your exam results and performance</p>
                  </div>
                </div>

                {results.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {results.map((r) => {
                      const percentage = ((r.marksObtained || 0) / r.totalMarks) * 100;
                      const performanceColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-blue-600' : 'text-orange-600';
                      const performanceBg = percentage >= 80 ? 'bg-green-50' : percentage >= 60 ? 'bg-blue-50' : 'bg-orange-50';
                      const badgeVariant = percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'outline';

                      return (
                        <Card key={r.id} className={`overflow-hidden border-l-4 ${percentage >= 80 ? 'border-l-green-600' : percentage >= 60 ? 'border-l-blue-600' : 'border-l-orange-600'}`} data-testid={`card-result-${r.id}`}>
                          <CardContent className="p-6">
                            <div className={`rounded-lg p-4 mb-4 ${performanceBg}`}>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-lg text-gray-900">{r.examName}</h3>
                                <div className="flex items-center gap-2">
                                  {r.rank && (
                                    <Badge className="bg-yellow-500 text-white">
                                      🏆 Rank: {r.rank}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">Score</span>
                                  <span className={`font-bold text-lg ${performanceColor}`}>
                                    {r.marksObtained}/{r.totalMarks}
                                  </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${percentage >= 80 ? 'bg-green-600' : percentage >= 60 ? 'bg-blue-600' : 'bg-orange-600'}`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>

                                <div className="flex justify-between items-center text-xs text-gray-600 mt-2">
                                  <span>{percentage.toFixed(1)}%</span>
                                  <span>{percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Average'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              {r.grade && (
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                  <p className="text-xs text-muted-foreground mb-1">Grade</p>
                                  <Badge variant={badgeVariant} className="text-base px-3 py-1">
                                    {r.grade}
                                  </Badge>
                                </div>
                              )}
                              <div className="bg-gray-50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <Badge variant={percentage >= 40 ? 'default' : 'destructive'} className="text-base px-3 py-1">
                                  {percentage >= 40 ? 'Pass ✓' : 'Fail ✗'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="text-center py-12">
                      <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                      <p className="text-lg font-medium text-muted-foreground">No results available yet</p>
                      <p className="text-sm text-muted-foreground mt-2">अभी कोई परिणाम उपलब्ध नहीं है</p>
                      <p className="text-xs text-muted-foreground mt-3">Your exam results will appear here once they are published</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "transactions" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="text-blue-600" />
                    Transaction History / लेनदेन इतिहास
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((t) => (
                        <div key={t.id} className="p-4 bg-muted rounded-lg" data-testid={`card-transaction-${t.id}`}>
                          <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                              <p className="font-medium">{t.purpose || t.type}</p>
                              <p className="text-sm text-muted-foreground">
                                UTR/Transaction ID: <span className="font-mono">{t.transactionId}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-primary">Rs.{t.amount}</span>
                              <Badge variant={t.status === 'approved' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'}>
                                {t.status === 'approved' ? 'Approved / स्वीकृत' : t.status === 'pending' ? 'Pending / लंबित' : 'Rejected / अस्वीकृत'}
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
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
