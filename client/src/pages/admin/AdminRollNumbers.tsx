import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, Search, Loader2 } from "lucide-react";

interface Student {
  id: number;
  registrationNumber: string;
  fullName: string;
  class: string;
  rollNumber?: string;
  feePaid: boolean;
}

export default function AdminRollNumbers() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rollNumbers, setRollNumbers] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [bulkAssigning, setBulkAssigning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
        const initialRollNumbers: Record<string, string> = {};
        data.forEach((s: Student) => {
          initialRollNumbers[s.id] = s.rollNumber || "";
        });
        setRollNumbers(initialRollNumbers);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateRollNumber = (studentClass: string, existingCount: number) => {
    const classNum = parseInt(studentClass);
    const prefix = classNum >= 5 && classNum <= 8 ? 500 : classNum >= 9 && classNum <= 12 ? 900 : 100;
    return (prefix * 1000 + existingCount + 1).toString();
  };

  const handleRollNumberChange = (studentId: string, rollNumber: string) => {
    setRollNumbers(prev => ({ ...prev, [studentId]: rollNumber }));
  };

  const handleSave = async (student: Student) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ rollNumber: rollNumbers[student.id] }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setStudents(prev => prev.map(s => 
        s.id === student.id ? { ...s, rollNumber: rollNumbers[student.id] } : s
      ));

      toast({ 
        title: "Roll Number Saved", 
        description: `${student.fullName}: ${rollNumbers[student.id]}` 
      });
    } catch (error) {
      console.error("Error saving roll number:", error);
      toast({ title: "Error", description: "Failed to save roll number", variant: "destructive" });
    }
  };

  const handleAutoAssign = async (student: Student) => {
    const classNum = parseInt(student.class);
    const prefix = classNum >= 5 && classNum <= 8 ? 500 : classNum >= 9 && classNum <= 12 ? 900 : 100;
    const classStudents = students.filter(s => {
      const sClass = parseInt(s.class);
      if (prefix === 500) return sClass >= 5 && sClass <= 8;
      if (prefix === 900) return sClass >= 9 && sClass <= 12;
      return sClass >= 1 && sClass <= 4;
    });
    const existingRolls = classStudents.filter(s => s.rollNumber).length;
    const rollNumber = generateRollNumber(student.class, existingRolls);
    
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ rollNumber }),
      });

      if (!res.ok) throw new Error("Failed to assign");

      setStudents(prev => prev.map(s => 
        s.id === student.id ? { ...s, rollNumber } : s
      ));
      setRollNumbers(prev => ({ ...prev, [student.id]: rollNumber }));

      toast({ 
        title: "Roll Number Assigned", 
        description: `${student.fullName}: ${rollNumber}` 
      });
    } catch (error) {
      console.error("Error auto-assigning roll number:", error);
      toast({ title: "Error", description: "Failed to assign roll number", variant: "destructive" });
    }
  };

  const handleBulkAssign = async () => {
    const studentsToAssign = filteredStudents.filter(s => !s.rollNumber && s.feePaid);
    if (studentsToAssign.length === 0) {
      toast({ title: "Info", description: "No students without roll numbers" });
      return;
    }

    setBulkAssigning(true);
    const token = localStorage.getItem("auth_token");
    let assigned = 0;

    for (const student of studentsToAssign) {
      const classNum = parseInt(student.class);
      const prefix = classNum >= 5 && classNum <= 8 ? 500 : classNum >= 9 && classNum <= 12 ? 900 : 100;
      const classStudents = students.filter(s => {
        const sClass = parseInt(s.class);
        if (prefix === 500) return sClass >= 5 && sClass <= 8;
        if (prefix === 900) return sClass >= 9 && sClass <= 12;
        return sClass >= 1 && sClass <= 4;
      });
      const existingRolls = classStudents.filter(s => s.rollNumber).length + assigned;
      const rollNumber = generateRollNumber(student.class, existingRolls);

      try {
        const res = await fetch(`/api/students/${student.id}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ rollNumber }),
        });

        if (res.ok) {
          setStudents(prev => prev.map(s => 
            s.id === student.id ? { ...s, rollNumber } : s
          ));
          setRollNumbers(prev => ({ ...prev, [student.id]: rollNumber }));
          assigned++;
        }
      } catch (error) {
        console.error("Error assigning roll number:", error);
      }
    }

    setBulkAssigning(false);
    toast({ 
      title: "Bulk Assignment Complete", 
      description: `Assigned ${assigned} roll numbers` 
    });
  };

  const getClassCounts = () => {
    const counts: Record<string, { total: number; withRoll: number; pending: number }> = {};
    students.forEach(s => {
      const cls = s.class;
      if (!counts[cls]) counts[cls] = { total: 0, withRoll: 0, pending: 0 };
      counts[cls].total++;
      if (s.rollNumber) counts[cls].withRoll++;
      else if (s.feePaid) counts[cls].pending++;
    });
    return counts;
  };

  const classCounts = getClassCounts();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || s.class === classFilter;
    return matchesSearch && matchesClass;
  });

  const studentsWithoutRoll = filteredStudents.filter(s => !s.rollNumber && s.feePaid).length;

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
              <FileText className="h-8 w-8 text-primary" />
              Roll Numbers
            </h1>
            <p className="text-muted-foreground">रोल नंबर प्रबंधन (100+ for Class 1-4, 500+ for Class 5-8, 900+ for Class 9-12)</p>
          </div>
          {studentsWithoutRoll > 0 && (
            <Button onClick={handleBulkAssign} disabled={bulkAssigning} data-testid="button-bulk-assign">
              {bulkAssigning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Auto-Assign All ({studentsWithoutRoll} pending)
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(classCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([cls, counts]) => (
            <Card key={cls} className={`cursor-pointer hover-elevate ${classFilter === cls ? 'ring-2 ring-primary' : ''}`} onClick={() => setClassFilter(classFilter === cls ? "all" : cls)}>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">Class {cls}</p>
                <p className="text-sm text-muted-foreground">{counts.total} students</p>
                <div className="flex justify-center gap-2 mt-1">
                  <span className="text-xs text-green-600">{counts.withRoll} assigned</span>
                  {counts.pending > 0 && <span className="text-xs text-orange-600">{counts.pending} pending</span>}
                </div>
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
                  placeholder="Search students..." 
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                      <TableCell className="font-medium">{student.registrationNumber}</TableCell>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>Class {student.class}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          student.feePaid ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                        }`}>
                          {student.feePaid ? "Paid" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={rollNumbers[student.id] || ""} 
                          onChange={(e) => handleRollNumberChange(student.id, e.target.value)}
                          placeholder="Enter roll number"
                          className="w-32"
                          data-testid={`input-roll-${student.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleAutoAssign(student)} data-testid={`button-auto-${student.id}`}>
                            Auto
                          </Button>
                          <Button size="sm" onClick={() => handleSave(student)} data-testid={`button-save-${student.id}`}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
