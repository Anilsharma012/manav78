import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, ArrowLeft, CheckCircle } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { useAuth } from "@/contexts/AuthContext";

export default function MemberForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await forgotPassword(email, "member");
    
    if (result.success) {
      setSubmitted(true);
      toast({
        title: "सफल",
        description: "यदि यह ईमेल रजिस्टर है, तो आपको एक पासवर्ड रीसेट लिंक प्राप्त होगा।",
      });
    } else {
      toast({
        title: "त्रुटि",
        description: result.error || "कुछ गलत हो गया",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md shadow-elevated">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Check Your Email</CardTitle>
              <CardDescription>
                आपके ईमेल को चेक करें
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                हमने {email} को एक पासवर्ड रीसेट लिंक भेजा है।
              </p>
              <p className="text-sm text-muted-foreground text-center">
                कृपया अपने ईमेल की जांच करें और लिंक पर क्लिक करें।
                यह लिंक 24 घंटे में समाप्त हो जाएगा।
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  <strong>Note:</strong> स्पैम फ़ोल्डर की भी जांच करें यदि आपको ईमेल नहीं मिल रहा है।
                </p>
              </div>
              <Button onClick={() => navigate("/member/login")} className="w-full">
                Back to Login / लॉगिन पर वापस जाएं
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
            </div>
            <CardDescription>
              पासवर्ड भूल गए? आसानी से रीसेट करें
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Member Email / ईमेल</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  आपकी रजिस्ट्रेशन के समय दिया गया ईमेल दर्ज करें
                </p>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link / रीसेट लिंक भेजें"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/member/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Login / लॉगिन पर वापस जाएं
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
