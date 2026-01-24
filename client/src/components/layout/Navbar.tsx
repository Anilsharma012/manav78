import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Heart, Phone, UserPlus, IdCard, Download, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpeg";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  {
    name: "Services",
    path: "/programs",
    dropdown: [
      { name: "Free Education & Coaching", path: "/programs/education" },
      { name: "GK Exams & Activities", path: "/programs/gk-exams" },
      { name: "Women Empowerment", path: "/programs/women-empowerment" },
      { name: "Health & Hygiene", path: "/programs/health" },
      { name: "Swachhta & Environment", path: "/programs/environment" },
      { name: "Emergency & Relief", path: "/programs/relief" },
    ],
  },
  { name: "Team", path: "/team" },
  {
    name: "Gallery",
    path: "/gallery",
    dropdown: [
      { name: "Events", path: "/gallery/events" },
      { name: "Health Camps", path: "/gallery/health" },
      { name: "Tree Plantation", path: "/gallery/environment" },
      { name: "News Coverage", path: "/gallery/news" },
      { name: "GK Competitions", path: "/gallery/competitions" },
    ],
  },
  { name: "Events", path: "/events" },
  { name: "News", path: "/news" },
  { name: "Join Us", path: "/volunteer" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [admitCardEnabled, setAdmitCardEnabled] = useState(false);
  const [isAdmitDialogOpen, setIsAdmitDialogOpen] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkAdmitCardSetting();
  }, []);

  const checkAdmitCardSetting = async () => {
    try {
      const res = await fetch("/api/public/settings");
      if (res.ok) {
        const settings = await res.json();
        const admitSetting = settings.find((s: any) => s.key === "admit_card_download");
        if (admitSetting && admitSetting.value === "enabled") {
          setAdmitCardEnabled(true);
        }
      }
    } catch (error) {
      console.error("Error checking admit card setting:", error);
    }
  };

  const handleDownloadAdmitCard = async () => {
    if (!rollNumber.trim()) {
      toast({ title: "Error", description: "Please enter your roll number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/public/admit-card/${rollNumber}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Admit card not found");
      }

      const data = await res.json();
      const admitData = data.admitData;
      const student = data.student;

      const admitCardHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Admit Card - ${student.fullName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #c00; padding-bottom: 15px; margin-bottom: 20px; }
    .logo { width: 80px; height: 80px; }
    .title { color: #c00; font-size: 24px; font-weight: bold; margin: 10px 0; }
    .subtitle { color: #666; font-size: 14px; }
    .admit-title { background: #c00; color: white; padding: 10px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; }
    .details { display: flex; gap: 30px; margin: 20px 0; }
    .details-left { flex: 1; }
    .details-right { width: 120px; height: 150px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; color: #999; }
    .row { display: flex; margin: 10px 0; }
    .label { font-weight: bold; width: 150px; }
    .value { flex: 1; }
    .exam-info { background: #f5f5f5; padding: 15px; margin: 20px 0; }
    .exam-info h3 { margin: 0 0 10px 0; color: #333; }
    .instructions { margin-top: 20px; padding: 15px; border: 1px solid #ddd; }
    .instructions h3 { margin: 0 0 10px 0; }
    .instructions ul { margin: 0; padding-left: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .signature { margin-top: 40px; text-align: right; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Manav Welfare Seva Society</div>
    <div class="subtitle">मानव वेलफेयर सेवा सोसायटी, भुना (हरियाणा)</div>
    <div class="subtitle">Reg. No: 01215 | Phone: +91 98126 76818</div>
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
    <div class="details-right">Photo</div>
  </div>
  
  <div class="exam-info">
    <h3>Exam Details / परीक्षा विवरण</h3>
    <div class="row"><span class="label">Exam Name:</span><span class="value">${admitData?.examName || data.examName}</span></div>
    <div class="row"><span class="label">Exam Date:</span><span class="value">${admitData?.examDate || 'To be announced'}</span></div>
    <div class="row"><span class="label">Exam Time:</span><span class="value">${admitData?.examTime || 'To be announced'}</span></div>
    <div class="row"><span class="label">Exam Center:</span><span class="value">${admitData?.examCenter || 'To be announced'}</span></div>
  </div>
  
  <div class="instructions">
    <h3>Instructions / निर्देश:</h3>
    <ul>
      <li>Bring this admit card to the examination center / इस प्रवेश पत्र को परीक्षा केंद्र पर लाएं</li>
      <li>Bring a valid photo ID / वैध फोटो आईडी साथ लाएं</li>
      <li>Arrive 30 minutes before exam time / परीक्षा समय से 30 मिनट पहले पहुंचें</li>
      <li>Electronic devices are not allowed / इलेक्ट्रॉनिक उपकरणों की अनुमति नहीं है</li>
    </ul>
  </div>
  
  <div class="signature">
    <p>_____________________</p>
    <p>Authorized Signature</p>
    <p>अधिकृत हस्ताक्षर</p>
  </div>
  
  <div class="footer">
    <p>This is a computer generated admit card</p>
    <p>यह कंप्यूटर जनित प्रवेश पत्र है</p>
  </div>
</body>
</html>`;

      const blob = new Blob([admitCardHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admit_card_${student.rollNumber || student.registrationNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Downloaded", description: "Admit card downloaded successfully. Open in browser and print." });
      setIsAdmitDialogOpen(false);
      setRollNumber("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to download admit card", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-soft">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+919812676818" className="flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" />
              <span>+91 98126 76818</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline">मानव सेवा ही सच्ची सेवा | Reg. No: 01215</span>
            <span className="md:hidden">Reg. No: 01215</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-soft group-hover:scale-105 transition-transform">
              <img src={logo} alt="Manav Welfare Seva Society Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight">
                Manav Welfare
              </span>
              <span className="text-xs text-muted-foreground">Seva Society Bhuna</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <DropdownMenu key={link.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-1 text-foreground hover:text-primary hover:bg-primary/10",
                        isActive(link.path) && "text-primary bg-primary/10"
                      )}
                    >
                      {link.name}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-card border-border shadow-elevated z-50">
                    {link.dropdown.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          to={item.path}
                          className="cursor-pointer hover:bg-primary/10 hover:text-primary"
                        >
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={link.name} to={link.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-foreground hover:text-primary hover:bg-primary/10",
                      isActive(link.path) && "text-primary bg-primary/10"
                    )}
                  >
                    {link.name}
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/student/login">
              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
                <GraduationCap className="h-4 w-4 mr-2" />
                Student Login
              </Button>
            </Link>
            {admitCardEnabled && (
              <Dialog open={isAdmitDialogOpen} onOpenChange={setIsAdmitDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950" data-testid="button-admit-card">
                    <IdCard className="h-4 w-4 mr-2" />
                    Admit Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Download Admit Card / एडमिट कार्ड डाउनलोड करें</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Roll Number / रोल नंबर *</Label>
                      <Input
                        placeholder="Enter your roll number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        data-testid="input-roll-number"
                      />
                    </div>
                    <Button onClick={handleDownloadAdmitCard} className="w-full" disabled={loading} data-testid="button-download-admit">
                      {loading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download Admit Card
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Link to="/membership">
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                <UserPlus className="h-4 w-4 mr-2" />
                Membership ₹99
              </Button>
            </Link>
            <Link to="/donate">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                <Heart className="h-4 w-4 mr-2" />
                Donate Now
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-foreground hover:text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-slide-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => !link.dropdown && setIsOpen(false)}
                    className={cn(
                      "block py-2 px-4 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors",
                      isActive(link.path) && "bg-primary/10 text-primary"
                    )}
                  >
                    {link.name}
                  </Link>
                  {link.dropdown && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className="block py-1.5 px-4 text-sm text-muted-foreground hover:text-primary"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link to="/student/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full mt-2 border-blue-500 text-blue-600">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Student Login
                </Button>
              </Link>
              {admitCardEnabled && (
                <Dialog open={isAdmitDialogOpen} onOpenChange={setIsAdmitDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-2 border-purple-500 text-purple-600" data-testid="button-admit-card-mobile">
                      <IdCard className="h-4 w-4 mr-2" />
                      Admit Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Download Admit Card</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Roll Number / रोल नंबर *</Label>
                        <Input
                          placeholder="Enter your roll number"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          data-testid="input-roll-number-mobile"
                        />
                      </div>
                      <Button onClick={handleDownloadAdmitCard} className="w-full" disabled={loading} data-testid="button-download-admit-mobile">
                        {loading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Link to="/membership" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full mt-2 border-secondary text-secondary">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Membership ₹99
                </Button>
              </Link>
              <Link to="/donate" onClick={() => setIsOpen(false)}>
                <Button className="w-full mt-2 bg-primary text-primary-foreground">
                  <Heart className="h-4 w-4 mr-2" />
                  Donate Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
