import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Users, Mail, Lock, Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function VolunteerLogin() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "त्रुटि",
        description: "कृपया ईमेल और पासवर्ड दर्ज करें",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/volunteer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("volunteer_token", data.token);
        localStorage.setItem("volunteer_user", JSON.stringify(data.user));
        toast({
          title: "सफल!",
          description: "लॉगिन सफल रहा। डैशबोर्ड पर जा रहे हैं...",
        });
        setLocation("/volunteer/dashboard");
      } else {
        toast({
          title: "लॉगिन विफल",
          description: data.error || "ईमेल या पासवर्ड गलत है",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "त्रुटि",
        description: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="p-8 shadow-elevated">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Volunteer Login
                </h1>
                <p className="text-muted-foreground">
                  स्वयंसेवक लॉगिन
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    Email / ईमेल
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4" />
                    Password / पासवर्ड
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="पासवर्ड दर्ज करें"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="pr-10"
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      लॉगिन हो रहा है...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Login / लॉगिन
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  अभी तक पंजीकृत नहीं हैं? / Not registered yet?
                </p>
                <Link href="/volunteer">
                  <Button variant="outline" className="w-full">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Register as Volunteer / स्वयंसेवक पंजीकरण
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
