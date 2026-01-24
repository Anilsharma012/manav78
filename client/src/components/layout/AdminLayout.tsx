import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  Award,
  Image,
  Phone,
  Info,
  Settings,
  LogOut,
  Menu,
  X,
  IdCard,
  Receipt,
  ClipboardList,
  Heart,
  FileEdit,
  Layout,
  Wallet,
  MessageSquare,
  Newspaper,
  Calendar,
  LucideIcon,
  Loader2
} from "lucide-react";
import logo from "@/assets/logo.jpeg";

interface AdminLayoutProps {
  children: ReactNode;
}

interface MenuItemData {
  _id: string;
  title: string;
  titleHindi?: string;
  path: string;
  iconKey: string;
  order: number;
  isActive: boolean;
  group?: string;
}

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  FileText,
  Award,
  Image,
  Phone,
  Info,
  Settings,
  IdCard,
  Receipt,
  ClipboardList,
  Heart,
  FileEdit,
  Layout,
  Wallet,
  MessageSquare,
  Newspaper,
  Calendar,
};

const fallbackMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: GraduationCap, label: "Students", href: "/admin/students" },
  { icon: Users, label: "Members", href: "/admin/members" },
  { icon: FileText, label: "Roll Numbers", href: "/admin/roll-numbers" },
  { icon: Award, label: "Results", href: "/admin/results" },
  { icon: IdCard, label: "Admit Cards", href: "/admin/admit-cards" },
  { icon: CreditCard, label: "Fees", href: "/admin/fees" },
  { icon: Users, label: "Memberships", href: "/admin/memberships" },
  { icon: Heart, label: "Volunteers", href: "/admin/volunteers" },
  { icon: Receipt, label: "Transactions", href: "/admin/transactions" },
  { icon: MessageSquare, label: "Contact Inquiries", href: "/admin/contact-inquiries" },
  { icon: FileEdit, label: "Content", href: "/admin/content" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: Newspaper, label: "News", href: "/admin/news" },
  { icon: Image, label: "Gallery", href: "/admin/gallery" },
  { icon: Layout, label: "Pages", href: "/admin/pages" },
  { icon: Wallet, label: "Payments", href: "/admin/payments" },
  { icon: Phone, label: "Contact Info", href: "/admin/contact-information" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isAdmin, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: menuItems = [], isLoading } = useQuery<MenuItemData[]>({
    queryKey: ["/api/admin/menu"],
    queryFn: async () => {
      if (!token) return [];
      const response = await fetch("/api/admin/menu", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!token && isAdmin,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  if (!isAdmin) {
    return null;
  }

  const renderMenuItems = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (menuItems.length === 0) {
      return fallbackMenuItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            data-testid={`nav-${item.href.split('/').pop()}`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      });
    }

    return menuItems.map((item) => {
      const IconComponent = iconMap[item.iconKey] || LayoutDashboard;
      const isActive = location.pathname === item.path;
      return (
        <Link
          key={item.id || item.path}
          to={item.path}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          data-testid={`nav-${item.path.split('/').pop()}`}
        >
          <IconComponent className="h-5 w-5" />
          <span>{item.title}{item.titleHindi ? ` / ${item.titleHindi}` : ""}</span>
        </Link>
      );
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="lg:hidden flex items-center justify-between p-4 bg-background border-b">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
          <span className="font-bold">Admin Panel</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="button-mobile-menu">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <div className="flex">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b hidden lg:flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-12 h-12 rounded-full" />
              <div>
                <h2 className="font-bold text-lg">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">MWSS</p>
              </div>
            </div>

            <ScrollArea className="flex-1 py-4">
              <nav className="space-y-1 px-3">
                {renderMenuItems()}
              </nav>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
