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
import { Award, Plus, Search, Upload, Loader2, FileSpreadsheet } from "lucide-react";

interface Student {
  id: number;
  registrationNumber: string;
  rollNumber?: string;
  fullName: string;
  class: string;
}

interface Result {
  id: number;
  examName: string;
  resultDate?: string;
  totalMarks: number;
  marksObtained?: number;
  rank?: number;
  studentId: {
    id: number;
    fullName: string;
    rollNumber?: string;
    registrationNumber: string;
    class: string;
  };
}

export default function AdminResults() {
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    studentId: "",
    examName: "",
    examDate: "",
    totalMarks: "100",
    obtainedMarks: "",
    rank: "",
  });

  const [bulkFormData, setBulkFormData] = useState({
    examName: "",
    examDate: "",
    totalMarks: "100",
    targetClass: "all",
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
        setStudents(studentsData.filter((s: Student) => s.rollNumber));
      }

      const resultsRes = await fetch("/api/results", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(resultsData);
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

      const total = parseInt(formData.totalMarks);
      const obtained = parseInt(formData.obtainedMarks);

      const res = await fetch("/api/results", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          studentId: formData.studentId,
          examName: formData.examName,
          resultDate: formData.examDate || null,
          totalMarks: total,
          marksObtained: obtained,
          rank: formData.rank ? parseInt(formData.rank) : null,
          isPublished: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to add result");

      const percentage = ((obtained / total) * 100).toFixed(2);
      toast({ 
        title: "Result Added", 
        description: `${student.fullName}: ${obtained}/${total} (${percentage}%)` 
      });
      
      setIsAddDialogOpen(false);
      setFormData({ studentId: "", examName: "", examDate: "", totalMarks: "100", obtainedMarks: "", rank: "" });
      loadData();
    } catch (error) {
      console.error("Error adding result:", error);
      toast({ title: "Error", description: "Failed to add result", variant: "destructive" });
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const rollIndex = headers.findIndex(h => h.includes('roll'));
      const marksIndex = headers.findIndex(h => h.includes('marks') || h.includes('obtained'));
      const rankIndex = headers.findIndex(h => h.includes('rank'));

      if (rollIndex === -1 || marksIndex === -1) {
        toast({ title: "Error", description: "CSV must have 'Roll Number' and 'Marks' columns", variant: "destructive" });
        setUploading(false);
        return;
      }

      let added = 0;
      let failed = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const rollNumber = cols[rollIndex];
        const marks = parseInt(cols[marksIndex]);
        const rank = rankIndex !== -1 ? parseInt(cols[rankIndex]) : null;

        const student = students.find(s => s.rollNumber === rollNumber);
        if (!student) {
          failed++;
          continue;
        }

        if (bulkFormData.targetClass !== "all" && student.class !== bulkFormData.targetClass) {
          continue;
        }

        try {
          const res = await fetch("/api/results", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
              studentId: student.id,
              examName: bulkFormData.examName,
              resultDate: bulkFormData.examDate || null,
              totalMarks: parseInt(bulkFormData.totalMarks),
              marksObtained: marks,
              rank: rank,
              isPublished: true,
            }),
          });

          if (res.ok) added++;
          else failed++;
        } catch {
          failed++;
        }
      }

      toast({ 
        title: "Bulk Upload Complete", 
        description: `Added: ${added}, Failed: ${failed}` 
      });
      
      setIsBulkDialogOpen(false);
      setBulkFormData({ examName: "", examDate: "", totalMarks: "100", targetClass: "all" });
      loadData();
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast({ title: "Error", description: "Failed to process CSV file", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getClassCounts = () => {
    const counts: Record<string, number> = {};
    results.forEach(r => {
      const cls = r.studentId?.class || "Unknown";
      counts[cls] = (counts[cls] || 0) + 1;
    });
    return counts;
  };

  const classCounts = getClassCounts();

  const filteredResults = results.filter(r => {
    const matchesSearch = r.studentId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentId?.rollNumber?.includes(searchTerm);
    const matchesClass = classFilter === "all" || r.studentId?.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const filteredStudents = classFilter === "all" ? students : students.filter(s => s.class === classFilter);

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
              <Award className="h-8 w-8 text-green-600" />
              Results Management
            </h1>
            <p className="text-muted-foreground">परिणाम प्रबंधन - Total: {results.length}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-bulk-upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload CSV
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Upload Results / CSV से अपलोड करें</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-2">CSV Format:</p>
                    <code className="text-xs">Roll Number, Marks, Rank (optional)</code>
                    <p className="text-xs text-muted-foreground mt-2">Example: 900001, 85, 1</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Name / परीक्षा का नाम *</Label>
                    <Input 
                      value={bulkFormData.examName} 
                      onChange={(e) => setBulkFormData({ ...bulkFormData, examName: e.target.value })}
                      placeholder="e.g., Haryana GK 2025"
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
                      <Label>Total Marks</Label>
                      <Input 
                        type="number"
                        value={bulkFormData.totalMarks} 
                        onChange={(e) => setBulkFormData({ ...bulkFormData, totalMarks: e.target.value })}
                        data-testid="input-bulk-total-marks"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Class (optional)</Label>
                    <Select value={bulkFormData.targetClass} onValueChange={(v) => setBulkFormData({ ...bulkFormData, targetClass: v })}>
                      <SelectTrigger data-testid="select-bulk-class">
                        <SelectValue placeholder="All Classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                          <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload CSV File</Label>
                    <Input 
                      type="file"
                      accept=".csv"
                      ref={fileInputRef}
                      onChange={handleBulkUpload}
                      disabled={!bulkFormData.examName || uploading}
                      data-testid="input-csv-file"
                    />
                  </div>
                  {uploading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Uploading results...</span>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-result"><Plus className="h-4 w-4 mr-2" />Add Result</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Result / परिणाम जोड़ें</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Student</Label>
                    <Select value={formData.studentId} onValueChange={(v) => setFormData({ ...formData, studentId: v })}>
                      <SelectTrigger data-testid="select-student"><SelectValue placeholder="छात्र चुनें" /></SelectTrigger>
                      <SelectContent>
                        {filteredStudents.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.fullName} (Roll: {s.rollNumber}, Class: {s.class})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Name / परीक्षा का नाम</Label>
                    <Input 
                      value={formData.examName} 
                      onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                      placeholder="e.g., Haryana GK 2025"
                      data-testid="input-exam-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Exam Date</Label>
                    <Input 
                      type="date"
                      value={formData.examDate} 
                      onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                      data-testid="input-exam-date"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total Marks / कुल अंक</Label>
                      <Input 
                        type="number"
                        value={formData.totalMarks} 
                        onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                        data-testid="input-total-marks"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Obtained Marks / प्राप्त अंक</Label>
                      <Input 
                        type="number"
                        value={formData.obtainedMarks} 
                        onChange={(e) => setFormData({ ...formData, obtainedMarks: e.target.value })}
                        data-testid="input-obtained-marks"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Rank (Optional)</Label>
                    <Input 
                      type="number"
                      value={formData.rank} 
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      placeholder="Rank"
                      data-testid="input-rank"
                    />
                  </div>
                  <Button onClick={handleSubmit} className="w-full" data-testid="button-save-result">Save Result</Button>
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
                <p className="text-2xl font-bold text-green-600">{count}</p>
                <p className="text-xs text-muted-foreground">results</p>
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
              {classFilter === "all" ? "All Results" : `Class ${classFilter} Results`} ({filteredResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No results found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => {
                      const percentage = result.marksObtained && result.totalMarks 
                        ? ((result.marksObtained / result.totalMarks) * 100).toFixed(2)
                        : "0";
                      return (
                        <TableRow key={result.id} data-testid={`row-result-${result.id}`}>
                          <TableCell className="font-medium">{result.studentId?.rollNumber}</TableCell>
                          <TableCell>{result.studentId?.fullName}</TableCell>
                          <TableCell>Class {result.studentId?.class}</TableCell>
                          <TableCell>{result.examName}</TableCell>
                          <TableCell>{result.resultDate || "-"}</TableCell>
                          <TableCell>{result.marksObtained}/{result.totalMarks}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              parseFloat(percentage) >= 60 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                              parseFloat(percentage) >= 40 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                              "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}>
                              {percentage}%
                            </span>
                          </TableCell>
                          <TableCell>{result.rank || "-"}</TableCell>
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
