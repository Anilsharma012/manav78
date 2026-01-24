import { useEffect, useState, useRef } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { IdCard, Plus, Search, Download, Loader2, Users, Upload, X, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Student {
  id: number;
  registrationNumber: string;
  rollNumber?: string;
  fullName: string;
  fatherName?: string;
  class: string;
  feePaid: boolean;
}

interface AdmitCard {
  id: number;
  studentId: {
    id: number;
    fullName: string;
    fatherName?: string;
    rollNumber?: string;
    registrationNumber: string;
    class: string;
  };
  examName: string;
  fileUrl: string;
  fileName: string;
  studentPhotoUrl?: string;
  uploadedAt: string;
}

export default function AdminAdmitCards() {
  const [students, setStudents] = useState<Student[]>([]);
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const admitCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    studentId: "",
    examName: "Haryana GK Exam 2025",
    examDate: "",
    examTime: "10:00 AM - 12:00 PM",
    examCenter: "",
    studentPhotoUrl: "",
  });

  const [bulkFormData, setBulkFormData] = useState({
    targetClass: "all",
    examName: "Haryana GK Exam 2025",
    examDate: "",
    examTime: "10:00 AM - 12:00 PM",
    examCenter: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      
      const studentsRes = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData);
      }

      const admitCardsRes = await fetch("/api/admit-cards", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (admitCardsRes.ok) {
        const admitCardsData = await admitCardsRes.json();
        setAdmitCards(admitCardsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const student = students.find(s => s.id === formData.studentId);
      if (!student) return;

      const fileData = JSON.stringify({
        examName: formData.examName,
        examDate: formData.examDate,
        examTime: formData.examTime,
        examCenter: formData.examCenter,
        generatedAt: new Date().toISOString(),
      });

      const res = await fetch("/api/admit-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: formData.studentId,
          examName: formData.examName,
          fileUrl: fileData,
          fileName: `admit_card_${student.rollNumber || student.registrationNumber}.json`,
          studentPhotoUrl: formData.studentPhotoUrl || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create admit card");

      toast({ title: "Admit Card Generated", description: `${student.fullName}` });
      setIsAddDialogOpen(false);
      setFormData({ studentId: "", examName: "Haryana GK Exam 2025", examDate: "", examTime: "10:00 AM - 12:00 PM", examCenter: "", studentPhotoUrl: "" });
      loadData();
    } catch (error) {
      console.error("Error generating admit card:", error);
      toast({ title: "Error", description: "Failed to generate admit card", variant: "destructive" });
    }
  };

  const handleBulkGenerate = async () => {
    setGenerating(true);
    const token = localStorage.getItem("auth_token");
    
    const targetStudents = students.filter(s => {
      if (!s.rollNumber) return false;
      if (bulkFormData.targetClass === "all") return true;
      return s.class === bulkFormData.targetClass;
    });

    const existingStudentIds = new Set(admitCards.map(ac => ac.studentId?.id));
    const studentsToGenerate = targetStudents.filter(s => !existingStudentIds.has(s.id));

    let generated = 0;
    let failed = 0;

    for (const student of studentsToGenerate) {
      const fileData = JSON.stringify({
        examName: bulkFormData.examName,
        examDate: bulkFormData.examDate,
        examTime: bulkFormData.examTime,
        examCenter: bulkFormData.examCenter,
        generatedAt: new Date().toISOString(),
      });

      try {
        const res = await fetch("/api/admit-cards", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            studentId: student.id,
            examName: bulkFormData.examName,
            fileUrl: fileData,
            fileName: `admit_card_${student.rollNumber || student.registrationNumber}.json`,
          }),
        });

        if (res.ok) generated++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setGenerating(false);
    toast({ 
      title: "Bulk Generation Complete", 
      description: `Generated: ${generated}, Failed: ${failed}` 
    });
    
    setIsBulkDialogOpen(false);
    setBulkFormData({ targetClass: "all", examName: "Haryana GK Exam 2025", examDate: "", examTime: "10:00 AM - 12:00 PM", examCenter: "" });
    loadData();
  };

  const handleDownload = async (ac: AdmitCard) => {
    const admitData = parseAdmitCardData(ac.fileUrl);
    const student = ac.studentId;

    toast({ title: "Generating PDF...", description: "Please wait while your admit card is being prepared." });

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.backgroundColor = 'white';
    container.style.padding = '30px';
    container.style.fontFamily = 'Arial, sans-serif';

    container.innerHTML = `
      <div style="text-align: center; border-bottom: 2px solid #c00; padding-bottom: 15px; margin-bottom: 20px;">
        <div style="color: #c00; font-size: 22px; font-weight: bold; margin: 10px 0;">MANAV WELFARE SEWA SOCIETY, BHUNA</div>
        <div style="color: #666; font-size: 13px;">मानव वेलफेयर सेवा सोसायटी, भुना (हरियाणा)</div>
        <div style="color: #666; font-size: 12px;">Reg. No: HR/01/2024/01215 | DARPAN ID: HR/2025/0866027</div>
        <div style="color: #666; font-size: 12px;">Laxmi Mata Mandir Wali Gali, Uklana Road, Shastri Mandi, Bhuna, Fatehabad - 125111</div>
        <div style="color: #666; font-size: 12px;">Phone: +91 98126 76818</div>
      </div>
      
      <div style="background: #c00; color: white; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;">
        ADMIT CARD / प्रवेश पत्र
      </div>
      
      <div style="display: flex; gap: 30px; margin: 20px 0;">
        <div style="flex: 1;">
          <div style="display: flex; margin: 8px 0;"><span style="font-weight: bold; width: 150px;">Roll Number:</span><span>${student.rollNumber || 'N/A'}</span></div>
          <div style="display: flex; margin: 8px 0;"><span style="font-weight: bold; width: 150px;">Registration No:</span><span>${student.registrationNumber}</span></div>
          <div style="display: flex; margin: 8px 0;"><span style="font-weight: bold; width: 150px;">Student Name:</span><span>${student.fullName}</span></div>
          <div style="display: flex; margin: 8px 0;"><span style="font-weight: bold; width: 150px;">Father's Name:</span><span>${student.fatherName || 'N/A'}</span></div>
          <div style="display: flex; margin: 8px 0;"><span style="font-weight: bold; width: 150px;">Class:</span><span>${student.class}</span></div>
        </div>
        <div style="width: 100px; height: 120px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px;">
          ${ac.studentPhotoUrl ? `<img src="${ac.studentPhotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />` : 'Photo'}
        </div>
      </div>
      
      <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
        <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px;">Exam Details / परीक्षा विवरण</div>
        <div style="display: flex; margin: 6px 0;"><span style="font-weight: bold; width: 150px;">Exam Name:</span><span>${admitData?.examName || ac.examName}</span></div>
        <div style="display: flex; margin: 6px 0;"><span style="font-weight: bold; width: 150px;">Exam Date:</span><span>${admitData?.examDate || 'To be announced'}</span></div>
        <div style="display: flex; margin: 6px 0;"><span style="font-weight: bold; width: 150px;">Exam Time:</span><span>${admitData?.examTime || 'To be announced'}</span></div>
        <div style="display: flex; margin: 6px 0;"><span style="font-weight: bold; width: 150px;">Exam Center:</span><span>${admitData?.examCenter || 'To be announced'}</span></div>
      </div>
      
      <div style="margin-top: 15px; padding: 12px; border: 1px solid #ddd;">
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 13px;">Terms & Conditions / नियम एवं शर्तें:</div>
        <div style="display: flex; font-size: 10px; line-height: 1.4;">
          <div style="flex: 1; padding-right: 10px;">
            <div style="font-weight: bold; margin-bottom: 4px;">English:</div>
            <div>1. Bring this admit card to the examination center.</div>
            <div>2. Carry a valid photo ID for verification.</div>
            <div>3. Arrive at least 30 minutes before exam time.</div>
            <div>4. Mobile phones are strictly prohibited.</div>
            <div>5. Malpractice leads to disqualification.</div>
          </div>
          <div style="flex: 1; padding-left: 10px; border-left: 1px solid #ddd;">
            <div style="font-weight: bold; margin-bottom: 4px;">हिंदी:</div>
            <div>1. इस प्रवेश पत्र को परीक्षा केंद्र पर लाएं।</div>
            <div>2. पहचान हेतु वैध फोटो आईडी साथ लाएं।</div>
            <div>3. परीक्षा से 30 मिनट पहले पहुंचें।</div>
            <div>4. मोबाइल फोन सख्त वर्जित है।</div>
            <div>5. नकल पर अयोग्य घोषित किया जाएगा।</div>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 30px; text-align: right;">
        <div>_____________________</div>
        <div style="font-size: 12px;">Authorized Signature</div>
        <div style="font-size: 11px;">अधिकृत हस्ताक्षर</div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666;">
        <div>This is a computer generated admit card / यह कंप्यूटर जनित प्रवेश पत्र है</div>
        <div style="margin-top: 3px;">MANAV WELFARE SEWA SOCIETY, BHUNA | Reg: HR/01/2024/01215 | DARPAN: HR/2025/0866027</div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));
      pdf.save(`admit_card_${student.rollNumber || student.registrationNumber}.pdf`);

      toast({ title: "PDF Downloaded", description: "Admit card has been saved as PDF." });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ title: "Error", description: "Failed to generate PDF. Please try again.", variant: "destructive" });
    } finally {
      document.body.removeChild(container);
    }
  };

  const handlePrint = (ac: AdmitCard) => {
    const admitData = parseAdmitCardData(ac.fileUrl);
    const student = ac.studentId;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: "Error", description: "Please allow popups to print admit card.", variant: "destructive" });
      return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Admit Card - ${student.fullName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #c00; padding-bottom: 15px; margin-bottom: 20px; }
    .title { color: #c00; font-size: 22px; font-weight: bold; margin: 10px 0; }
    .subtitle { color: #666; font-size: 13px; }
    .admit-title { background: #c00; color: white; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
    .details { display: flex; gap: 30px; margin: 20px 0; }
    .details-left { flex: 1; }
    .details-right { width: 100px; height: 120px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; color: #999; }
    .row { display: flex; margin: 8px 0; }
    .label { font-weight: bold; width: 150px; }
    .value { flex: 1; }
    .exam-info { background: #f5f5f5; padding: 15px; margin: 20px 0; }
    .exam-info h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; }
    .instructions { margin-top: 15px; padding: 12px; border: 1px solid #ddd; }
    .instructions h3 { margin: 0 0 8px 0; font-size: 13px; }
    .instructions-grid { display: flex; font-size: 10px; line-height: 1.4; }
    .instructions-col { flex: 1; }
    .instructions-col:last-child { padding-left: 10px; border-left: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
    .signature { margin-top: 30px; text-align: right; }
    @media print { body { padding: 10px; } @page { margin: 1cm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">MANAV WELFARE SEWA SOCIETY, BHUNA</div>
    <div class="subtitle">मानव वेलफेयर सेवा सोसायटी, भुना (हरियाणा)</div>
    <div class="subtitle">Reg. No: HR/01/2024/01215 | DARPAN ID: HR/2025/0866027</div>
    <div class="subtitle">Laxmi Mata Mandir Wali Gali, Uklana Road, Shastri Mandi, Bhuna, Fatehabad - 125111</div>
    <div class="subtitle">Phone: +91 98126 76818</div>
  </div>
  
  <div class="admit-title">ADMIT CARD / प्रवेश पत्र</div>
  
  <div class="details">
    <div class="details-left">
      <div class="row"><span class="label">Roll Number:</span><span class="value">${student.rollNumber || 'N/A'}</span></div>
      <div class="row"><span class="label">Registration No:</span><span class="value">${student.registrationNumber}</span></div>
      <div class="row"><span class="label">Student Name:</span><span class="value">${student.fullName}</span></div>
      <div class="row"><span class="label">Father's Name:</span><span class="value">${student.fatherName || 'N/A'}</span></div>
      <div class="row"><span class="label">Class:</span><span class="value">${student.class}</span></div>
    </div>
    <div class="details-right">${ac.studentPhotoUrl ? `<img src="${ac.studentPhotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Photo" />` : 'Photo'}</div>
  </div>
  
  <div class="exam-info">
    <h3>Exam Details / परीक्षा विवरण</h3>
    <div class="row"><span class="label">Exam Name:</span><span class="value">${admitData?.examName || ac.examName}</span></div>
    <div class="row"><span class="label">Exam Date:</span><span class="value">${admitData?.examDate || 'To be announced'}</span></div>
    <div class="row"><span class="label">Exam Time:</span><span class="value">${admitData?.examTime || 'To be announced'}</span></div>
    <div class="row"><span class="label">Exam Center:</span><span class="value">${admitData?.examCenter || 'To be announced'}</span></div>
  </div>
  
  <div class="instructions">
    <h3>Terms & Conditions / नियम एवं शर्तें:</h3>
    <div class="instructions-grid">
      <div class="instructions-col">
        <strong>English:</strong>
        <div>1. Bring this admit card to the examination center.</div>
        <div>2. Carry a valid photo ID for verification.</div>
        <div>3. Arrive at least 30 minutes before exam time.</div>
        <div>4. Mobile phones are strictly prohibited.</div>
        <div>5. Malpractice leads to disqualification.</div>
      </div>
      <div class="instructions-col">
        <strong>हिंदी:</strong>
        <div>1. इस प्रवेश पत्र को परीक्षा केंद्र पर लाएं।</div>
        <div>2. पहचान हेतु वैध फोटो आईडी साथ लाएं।</div>
        <div>3. परीक्षा से 30 मिनट पहले पहुंचें।</div>
        <div>4. मोबाइल फोन सख्त वर्जित है।</div>
        <div>5. नकल पर अयोग्य घोषित किया जाएगा।</div>
      </div>
    </div>
  </div>
  
  <div class="signature">
    <p>_____________________</p>
    <p style="font-size: 12px;">Authorized Signature / अधिकृत हस्ताक्षर</p>
  </div>
  
  <div class="footer">
    <p>This is a computer generated admit card / यह कंप्यूटर जनित प्रवेश पत्र है</p>
    <p>MANAV WELFARE SEWA SOCIETY, BHUNA | Reg: HR/01/2024/01215 | DARPAN: HR/2025/0866027</p>
  </div>
</body>
</html>
    `);
    
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const parseAdmitCardData = (url: string) => {
    try {
      return JSON.parse(url);
    } catch {
      return null;
    }
  };

  const getClassCounts = () => {
    const counts: Record<string, number> = {};
    admitCards.forEach(ac => {
      const cls = ac.studentId?.class || "Unknown";
      counts[cls] = (counts[cls] || 0) + 1;
    });
    return counts;
  };

  const classCounts = getClassCounts();

  const eligibleStudents = students.filter(s => s.rollNumber);
  const filteredEligibleStudents = classFilter === "all" ? eligibleStudents : eligibleStudents.filter(s => s.class === classFilter);
  
  const filteredAdmitCards = admitCards.filter(ac => {
    const matchesSearch = ac.studentId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ac.studentId?.rollNumber?.includes(searchTerm);
    const matchesClass = classFilter === "all" || ac.studentId?.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const studentsWithoutAdmitCard = () => {
    const existingStudentIds = new Set(admitCards.map(ac => ac.studentId?.id));
    return filteredEligibleStudents.filter(s => !existingStudentIds.has(s.id)).length;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <IdCard className="h-8 w-8 text-purple-600" />
              Admit Cards
            </h1>
            <p className="text-muted-foreground">एडमिट कार्ड प्रबंधन - Total: {admitCards.length}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-bulk-generate">
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Generate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Generate Admit Cards / सभी के लिए बनाएं</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Target Class</Label>
                    <Select value={bulkFormData.targetClass} onValueChange={(v) => setBulkFormData({ ...bulkFormData, targetClass: v })}>
                      <SelectTrigger data-testid="select-bulk-class">
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes ({studentsWithoutAdmitCard()} pending)</SelectItem>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                          <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Name</Label>
                    <Input 
                      value={bulkFormData.examName} 
                      onChange={(e) => setBulkFormData({ ...bulkFormData, examName: e.target.value })}
                      placeholder="Haryana GK Exam 2025"
                      data-testid="input-bulk-exam-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Exam Date</Label>
                      <Input 
                        type="date"
                        value={bulkFormData.examDate} 
                        onChange={(e) => setBulkFormData({ ...bulkFormData, examDate: e.target.value })}
                        data-testid="input-bulk-exam-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exam Time</Label>
                      <Input 
                        value={bulkFormData.examTime} 
                        onChange={(e) => setBulkFormData({ ...bulkFormData, examTime: e.target.value })}
                        placeholder="10:00 AM - 12:00 PM"
                        data-testid="input-bulk-exam-time"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Center</Label>
                    <Input 
                      value={bulkFormData.examCenter} 
                      onChange={(e) => setBulkFormData({ ...bulkFormData, examCenter: e.target.value })}
                      placeholder="परीक्षा केंद्र"
                      data-testid="input-bulk-exam-center"
                    />
                  </div>
                  <Button onClick={handleBulkGenerate} className="w-full" disabled={generating} data-testid="button-generate-bulk">
                    {generating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Generate for All ({studentsWithoutAdmitCard()} students)
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-admit-card"><Plus className="h-4 w-4 mr-2" />Create Admit Card</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Admit Card</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Student</Label>
                    <Select value={formData.studentId} onValueChange={(v) => setFormData({ ...formData, studentId: v })}>
                      <SelectTrigger data-testid="select-student"><SelectValue placeholder="छात्र चुनें" /></SelectTrigger>
                      <SelectContent>
                        {filteredEligibleStudents.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.fullName} (Roll: {s.rollNumber}, Class: {s.class})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Name</Label>
                    <Input 
                      value={formData.examName} 
                      onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                      placeholder="Haryana GK Exam 2025"
                      data-testid="input-exam-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Exam Date</Label>
                      <Input 
                        type="date"
                        value={formData.examDate} 
                        onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                        data-testid="input-exam-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exam Time</Label>
                      <Input 
                        value={formData.examTime} 
                        onChange={(e) => setFormData({ ...formData, examTime: e.target.value })}
                        placeholder="10:00 AM - 12:00 PM"
                        data-testid="input-exam-time"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Center</Label>
                    <Input
                      value={formData.examCenter}
                      onChange={(e) => setFormData({ ...formData, examCenter: e.target.value })}
                      placeholder="परीक्षा केंद्र"
                      data-testid="input-exam-center"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Student Photo (Passport Size)</Label>
                    <div className="flex items-center gap-2">
                      {formData.studentPhotoUrl ? (
                        <div className="relative w-20 h-24 border rounded">
                          <img src={formData.studentPhotoUrl} alt="Student" className="w-full h-full object-cover rounded" />
                          <button
                            onClick={() => setFormData({ ...formData, studentPhotoUrl: "" })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-24 border-2 border-dashed rounded flex items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">No photo</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setUploading(true);
                            try {
                              const token = localStorage.getItem("auth_token");
                              const urlResponse = await fetch("/api/uploads/request-url", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                  name: file.name,
                                  size: file.size,
                                  contentType: file.type,
                                }),
                              });

                              if (!urlResponse.ok) {
                                const error = await urlResponse.json();
                                throw new Error(error.error || "Failed to request upload URL");
                              }

                              const { uploadURL, fileURL } = await urlResponse.json();

                              const uploadResponse = await fetch(uploadURL, {
                                method: "PUT",
                                headers: {
                                  "Content-Type": file.type || "application/octet-stream",
                                  Authorization: `Bearer ${token}`
                                },
                                body: file,
                              });

                              if (!uploadResponse.ok) {
                                throw new Error("Failed to upload file");
                              }

                              setFormData({ ...formData, studentPhotoUrl: fileURL });
                              toast({ title: "Success", description: "Photo uploaded successfully" });
                            } catch (error) {
                              console.error("Upload error:", error);
                              toast({
                                title: "Error",
                                description: error instanceof Error ? error.message : "Failed to upload photo",
                                variant: "destructive"
                              });
                            } finally {
                              setUploading(false);
                            }
                          }}
                          disabled={uploading}
                          className="hidden"
                          id="photo-input"
                        />
                        <Button
                          onClick={() => document.getElementById("photo-input")?.click()}
                          disabled={uploading}
                          variant="outline"
                          className="w-full"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Photo
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSubmit} className="w-full" data-testid="button-generate-admit-card">Generate Admit Card</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(classCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([cls, count]) => (
            <Card key={cls} className={`cursor-pointer hover-elevate ${classFilter === cls ? 'ring-2 ring-primary' : ''}`} onClick={() => setClassFilter(classFilter === cls ? "all" : cls)}>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">Class {cls}</p>
                <p className="text-2xl font-bold text-purple-600">{count}</p>
                <p className="text-xs text-muted-foreground">admit cards</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name or roll number..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-40" data-testid="select-class-filter">
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                    <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {classFilter === "all" ? "All Admit Cards" : `Class ${classFilter} Admit Cards`} ({filteredAdmitCards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Father's Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Center</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmitCards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No admit cards found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdmitCards.map((ac) => {
                      const admitData = parseAdmitCardData(ac.fileUrl);
                      return (
                        <TableRow key={ac.id} data-testid={`row-admit-card-${ac.id}`}>
                          <TableCell className="font-medium">{ac.studentId?.rollNumber}</TableCell>
                          <TableCell>{ac.studentId?.fullName}</TableCell>
                          <TableCell>{ac.studentId?.fatherName || "-"}</TableCell>
                          <TableCell>Class {ac.studentId?.class}</TableCell>
                          <TableCell>{ac.examName}</TableCell>
                          <TableCell>{admitData?.examDate || "TBD"}</TableCell>
                          <TableCell>{admitData?.examCenter || "TBD"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleDownload(ac)} data-testid={`button-download-${ac.id}`}>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handlePrint(ac)} data-testid={`button-print-${ac.id}`}>
                                <Printer className="h-4 w-4 mr-1" />
                                Print
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
