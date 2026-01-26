import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Plus, Search, Edit, Loader2, Trash2 } from "lucide-react";

const feeLevels = [
  { id: "village", name: "Village Level", amount: 99 },
  { id: "block", name: "Block Level", amount: 199 },
  { id: "district", name: "District Level", amount: 299 },
  { id: "haryana", name: "Haryana Level", amount: 399 },
];

interface Student {
  id: number;
  email: string;
  fullName: string;
  fatherName?: string;
  phone?: string;
  registrationNumber: string;
  class: string;
  rollNumber?: string;
  feeLevel: string;
  feeAmount: number;
  feePaid: boolean;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    studentName: "",
    fatherName: "",
    email: "",
    password: "",
    class: "",
    phone: "",
    feeLevel: "village",
    feePaid: false,
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("auth_token");
    const selectedFee = feeLevels.find(f => f.id === formData.feeLevel);

    if (editingStudent) {
      try {
        const res = await fetch(`/api/students/${editingStudent.id}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            fullName: formData.studentName,
            fatherName: formData.fatherName,
            phone: formData.phone,
            class: formData.class,
            feeLevel: formData.feeLevel,
            feeAmount: selectedFee?.amount,
            feePaid: formData.feePaid,
          }),
        });
        if (res.ok) {
          toast({ title: "Student Updated", description: "छात्र की जानकारी अपडेट हो गई" });
        } else {
          throw new Error("Update failed");
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      try {
        if (!formData.email || !formData.password) {
          toast({ title: "Error", description: "Email and Password required", variant: "destructive" });
          return;
        }

        const res = await fetch("/api/students", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.studentName,
            fatherName: formData.fatherName,
            phone: formData.phone,
            class: formData.class,
            feeLevel: formData.feeLevel,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          toast({
            title: "Student Added",
            description: `Registration: ${data.registrationNumber}`,
          });
        } else {
          throw new Error("Failed to add student");
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }

    loadStudents();
    resetForm();
    setIsAddDialogOpen(false);
    setEditingStudent(null);
  };

  const resetForm = () => {
    setFormData({
      studentName: "",
      fatherName: "",
      email: "",
      password: "",
      class: "",
      phone: "",
      feeLevel: "village",
      feePaid: false,
    });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      studentName: student.fullName || "",
      fatherName: student.fatherName || "",
      email: "",
      password: "",
      class: student.class,
      phone: student.phone || "",
      feeLevel: student.feeLevel || "village",
      feePaid: student.feePaid || false,
    });
    setIsAddDialogOpen(true);
  };

  const getClassCounts = () => {
    const counts: Record<string, number> = {};
    students.forEach(s => {
      counts[s.class] = (counts[s.class] || 0) + 1;
    });
    return counts;
  };

  const classCounts = getClassCounts();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.includes(searchTerm);
    const matchesClass = classFilter === "all" || s.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => String(s.id))));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} student(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/students/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        toast({ title: "Success", description: `${selectedIds.size} student(s) deleted successfully` });
        setSelectedIds(new Set());
        loadStudents();
      } else {
        throw new Error("Failed to delete students");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete students", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-secondary" />
              Students Management
            </h1>
            <p className="text-muted-foreground">छात्र प्रबंधन - Total: {students.length}</p>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete} disabled={isDeleting} data-testid="button-bulk-delete">
                {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete ({selectedIds.size})
              </Button>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setEditingStudent(null); }} data-testid="button-add-student">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Student Name / छात्र का नाम *</Label>
                    <Input name="studentName" value={formData.studentName} onChange={handleChange} placeholder="छात्र का नाम" data-testid="input-student-name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Father's Name / पिता का नाम</Label>
                    <Input name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="पिता का नाम" data-testid="input-father-name" />
                  </div>
                </div>
                
                {!editingStudent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" data-testid="input-email" />
                    </div>
                    <div className="space-y-2">
                      <Label>Password *</Label>
                      <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" data-testid="input-password" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class / कक्षा *</Label>
                    <Select value={formData.class} onValueChange={(v) => setFormData({ ...formData, class: v })}>
                      <SelectTrigger data-testid="select-class"><SelectValue placeholder="कक्षा चुनें" /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(c => (
                          <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone / मोबाइल</Label>
                    <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="मोबाइल नंबर" data-testid="input-phone" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fee Level / शुल्क स्तर</Label>
                    <Select value={formData.feeLevel} onValueChange={(v) => setFormData({ ...formData, feeLevel: v })}>
                      <SelectTrigger data-testid="select-fee-level"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {feeLevels.map(l => (
                          <SelectItem key={l.id} value={l.id}>{l.name} - Rs.{l.amount}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select value={formData.feePaid ? "paid" : "pending"} onValueChange={(v) => setFormData({ ...formData, feePaid: v === "paid" })}>
                      <SelectTrigger data-testid="select-payment-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full" data-testid="button-submit-student">
                  {editingStudent ? "Update Student" : "Add Student"}
                </Button>
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
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="text-xs text-muted-foreground">students</p>
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
                  placeholder="Search by name, registration number or phone..."
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
              {classFilter === "all" ? "All Students" : `Class ${classFilter} Students`} ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length}
                          onCheckedChange={toggleSelectAll}
                          data-testid="checkbox-select-all"
                        />
                      </TableHead>
                      <TableHead>Registration No.</TableHead>
                      <TableHead>Name / नाम</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Father's Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Fee Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedIds.has(String(student.id))}
                              onCheckedChange={() => toggleSelect(String(student.id))}
                              data-testid={`checkbox-student-${student.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{student.registrationNumber}</TableCell>
                          <TableCell>{student.fullName}</TableCell>
                          <TableCell className="text-sm">{student.email || "-"}</TableCell>
                          <TableCell>{student.fatherName || "-"}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>{student.rollNumber || "-"}</TableCell>
                          <TableCell>{student.phone || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              student.feePaid ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                            }`}>
                              {student.feePaid ? `Rs.${student.feeAmount} Paid` : "Pending"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(student)} data-testid={`button-edit-${student.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
