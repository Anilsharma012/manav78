import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  CreditCard,
  TrendingUp,
  UserPlus,
  IndianRupee,
  MessageSquare
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  todayRegistrations: number;
  feesPaid: number;
  activeStudents: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    todayRegistrations: 0,
    feesPaid: 0,
    activeStudents: 0,
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentStudents();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentStudents = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const students = await res.json();
        setRecentStudents(students.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching recent students:", error);
    }
  };

  const statCards = [
    {
      title: "Total Students / कुल छात्र",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Students",
      value: stats.activeStudents,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Fees Paid / शुल्क भुगतान",
      value: stats.feesPaid,
      icon: IndianRupee,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Today's Registrations",
      value: stats.todayRegistrations,
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Admin Panel / एडमिन पैनल में आपका स्वागत है
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="shadow-card" data-testid={`card-stat-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions / त्वरित कार्रवाई</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/admin/students" className="p-4 rounded-lg bg-muted text-center" data-testid="link-add-student">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 text-secondary" />
                <span className="text-sm font-medium">Add Student</span>
              </a>
              <a href="/admin/roll-numbers" className="p-4 rounded-lg bg-muted text-center" data-testid="link-assign-roll">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                <span className="text-sm font-medium">Assign Roll No.</span>
              </a>
              <a href="/admin/results" className="p-4 rounded-lg bg-muted text-center" data-testid="link-update-results">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <span className="text-sm font-medium">Update Results</span>
              </a>
              <a href="/admin/memberships" className="p-4 rounded-lg bg-muted text-center" data-testid="link-memberships">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <span className="text-sm font-medium">Memberships</span>
              </a>
              <a href="/admin/contact-inquiries" className="p-4 rounded-lg bg-muted text-center" data-testid="link-contact-inquiries">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <span className="text-sm font-medium">Contact Inquiries</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations / हाल के रजिस्ट्रेशन</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent registrations</p>
            ) : (
              <div className="space-y-3">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-2 p-3 bg-muted rounded-lg" data-testid={`card-student-${student.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">{student.fullName || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">
                          Class {student.class} - {student.registrationNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.feePaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {student.feePaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
