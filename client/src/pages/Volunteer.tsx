import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Users, Heart, BookOpen, Leaf, Stethoscope, HandHeart, GraduationCap, Send, Phone, Loader2, CheckCircle, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

const interestAreas = [
  { id: "education", label: "Education / शिक्षा", icon: BookOpen },
  { id: "health", label: "Health Camps / स्वास्थ्य", icon: Stethoscope },
  { id: "women", label: "Women Empowerment / महिला सशक्तिकरण", icon: Users },
  { id: "environment", label: "Environment / पर्यावरण", icon: Leaf },
  { id: "gk-exam", label: "GK Exam Coordination / प्रतियोगिता", icon: GraduationCap },
  { id: "relief", label: "Relief Work / राहत कार्य", icon: HandHeart },
];

const benefits = [
  {
    icon: Heart,
    title: "Make a Real Difference",
    description: "Directly impact lives of underprivileged children and communities",
  },
  {
    icon: Users,
    title: "Join a Family",
    description: "Be part of 50+ dedicated volunteers across Haryana",
  },
  {
    icon: GraduationCap,
    title: "Gain Experience",
    description: "Perfect for students seeking internship and field work experience",
  },
];

export default function Volunteer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    village: "",
    message: "",
    password: "",
    confirmPassword: "",
    interests: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInterestChange = (interestId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      interests: checked
        ? [...prev.interests, interestId]
        : prev.interests.filter((id) => id !== interestId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password || formData.password.length < 6) {
      toast.error("पासवर्ड कम से कम 6 अक्षर का होना चाहिए");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("पासवर्ड मेल नहीं खाता");
      return;
    }
    
    if (!formData.email) {
      toast.error("ईमेल आवश्यक है (Email is required)");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/auth/volunteer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          address: formData.village,
          skills: formData.interests.join(", "),
          message: formData.message,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });
      
      if (res.ok) {
        setIsSubmitted(true);
        toast.success("धन्यवाद! आपका पंजीकरण सफल रहा। कृपया लॉगिन करें।");
        setFormData({
          name: "",
          email: "",
          phone: "",
          city: "",
          village: "",
          message: "",
          password: "",
          confirmPassword: "",
          interests: [],
        });
      } else {
        const data = await res.json();
        toast.error(data.error || "पंजीकरण विफल");
      }
    } catch (error) {
      toast.error("कुछ गलत हो गया। कृपया पुनः प्रयास करें।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Join Us / हमसे जुड़ें
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Become a <span className="text-primary">Volunteer</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              समाज सेवा में हमारे साथ जुड़ें और बदलाव का हिस्सा बनें। चाहे आप छात्र हों या पेशेवर, 
              हर कोई अपने तरीके से योगदान दे सकता है।
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Join us in serving society and be a part of positive change. Whether you're a student 
              or professional, everyone can contribute in their own way.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {isSubmitted ? (
              <div className="bg-card rounded-2xl p-8 shadow-card">
                {/* Success Message */}
                <div className="text-center space-y-6">
                  {/* Success Icon */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
                      <div className="relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-full p-8">
                        <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>

                  {/* Main Message */}
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
                      बधाई हो! / Congratulations!
                    </h2>
                    <p className="text-xl font-semibold text-foreground">
                      {formData.name && `${formData.name}, `}आपका स्वागत है!
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-4 bg-green-50 dark:bg-green-900/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <p className="text-lg text-foreground font-medium">
                      आपका पंजीकरण सफलतापूर्वक पूरा हो गया है!
                    </p>
                    <p className="text-foreground leading-relaxed">
                      धन्यवाद आपको हमारे स्वयंसेवक परिवार में शामिल करने के लिए। आपका आवेदन हमारे प्रशासक दल के अनुमोदन के लिए भेज दिया गया है।
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      "Your registration has been successfully completed! Thank you for joining our volunteer family. Your application has been sent for approval by our admin team."
                    </p>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800 text-left space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="inline-block w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">!</span>
                      अगले कदम / Next Steps:
                    </h3>
                    <ol className="space-y-2 text-sm text-foreground">
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                        <span>आप जल्द ही अपना अनुमोदन संदेश ईमेल द्वारा प्राप्त करेंगे। / You will receive approval confirmation via email soon.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                        <span>अनुमोदन के बाद आप अपने खाते में लॉगिन कर सकते हैं। / After approval, you can login to your account.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                        <span>आप हमारे विभिन्न कार्यक्रमों में भाग ले सकेंगे। / You will be able to participate in our various programs.</span>
                      </li>
                    </ol>
                  </div>

                  {/* CTA Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <Link href="/volunteer/login">
                      <Button className="w-full" size="lg">
                        <LogIn className="h-5 w-5 mr-2" />
                        लॉगिन पेज / Login
                      </Button>
                    </Link>
                    <Link href="/">
                      <Button variant="outline" size="lg" className="w-full">
                        होम पेज पर जाएं / Go Home
                      </Button>
                    </Link>
                  </div>

                  {/* Contact Info */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <p className="text-sm text-muted-foreground">
                      किसी सवाल के लिए / For any queries:
                    </p>
                    <a
                      href="tel:+919812676818"
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      +91 98126 76818
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Volunteer Registration Form
                  </h2>
                  <p className="text-muted-foreground">
                    स्वयंसेवक पंजीकरण फॉर्म भरें / Fill the volunteer registration form
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-card space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name / पूरा नाम *
                  </label>
                  <Input
                    type="text"
                    placeholder="आपका नाम"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mobile Number / मोबाइल नंबर *
                  </label>
                  <Input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address / ईमेल
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City / शहर *
                  </label>
                  <Input
                    type="text"
                    placeholder="भूना, फतेहाबाद"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Village / गांव (if applicable)
                </label>
                <Input
                  type="text"
                  placeholder="गांव का नाम"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="bg-background border-border"
                />
              </div>

              {/* Interest Areas */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-4">
                  Area of Interest / रुचि का क्षेत्र *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interestAreas.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-primary/5 transition-colors"
                    >
                      <Checkbox
                        id={interest.id}
                        checked={formData.interests.includes(interest.id)}
                        onCheckedChange={(checked) =>
                          handleInterestChange(interest.id, checked as boolean)
                        }
                      />
                      <interest.icon className="h-5 w-5 text-primary" />
                      <label
                        htmlFor={interest.id}
                        className="text-sm font-medium text-foreground cursor-pointer"
                      >
                        {interest.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message / संदेश (Optional)
                </label>
                <Textarea
                  placeholder="कुछ और बताना चाहें तो यहां लिखें..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="bg-background border-border"
                />
              </div>

              {/* Password Fields */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  लॉगिन क्रेडेंशियल बनाएं / Create Login Credentials
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  पंजीकरण के बाद लॉगिन करने के लिए पासवर्ड बनाएं।
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                      Password / पासवर्ड *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="कम से कम 6 अक्षर"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="bg-background border-border pr-10"
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
                  <div>
                    <Label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                      Confirm Password / पासवर्ड पुष्टि करें *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="पासवर्ड दोबारा डालें"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="bg-background border-border pr-10"
                        data-testid="input-confirm-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                    data-testid="button-submit-volunteer"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Send className="h-5 w-5 mr-2" />}
                    {isSubmitting ? "Submitting..." : "Submit Registration / पंजीकरण जमा करें"}
                  </Button>

                  {/* Already registered link */}
                  <div className="text-center pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      पहले से पंजीकृत हैं? / Already registered?{" "}
                      <Link href="/volunteer/login" className="text-primary font-medium hover:underline">
                        लॉगिन करें / Login
                      </Link>
                    </p>
                  </div>
                </form>

                {/* Contact for queries */}
                <div className="mt-8 text-center p-6 bg-card rounded-xl shadow-card">
                  <p className="text-muted-foreground mb-2">
                    For any queries, contact us at:
                  </p>
                  <a
                    href="tel:+919812676818"
                    className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:underline"
                  >
                    <Phone className="h-5 w-5" />
                    +91 98126 76818
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Internship Section */}
      <section className="py-16 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Internship & Field Work</h2>
          <p className="max-w-2xl mx-auto mb-6 opacity-90">
            छात्रों के लिए विशेष अवसर! हमारे साथ इंटर्नशिप करें और सामाजिक कार्य का अनुभव प्राप्त करें।
            Special opportunity for students! Intern with us and gain hands-on social work experience.
          </p>
          <Button variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
            Learn More About Internships
          </Button>
        </div>
      </section>
    </Layout>
  );
}
