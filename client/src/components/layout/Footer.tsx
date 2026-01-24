import { Link } from "react-router-dom";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Youtube 
} from "lucide-react";
import logo from "@/assets/logo.jpeg";

const quickLinks = [
  { name: "About Us", path: "/about" },
  { name: "Our Services", path: "/programs" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "News & Media", path: "/news" },
  { name: "Contact Us", path: "/contact" },
  { name: "Join Us / Volunteer", path: "/volunteer" },
];

const services = [
  { name: "Free Education", path: "/programs/education" },
  { name: "GK Exams", path: "/programs/gk-exams" },
  { name: "Women Empowerment", path: "/programs/women-empowerment" },
  { name: "Health Camps", path: "/programs/health" },
  { name: "Environment", path: "/programs/environment" },
  { name: "Emergency Relief", path: "/programs/relief" },
];

const socialLinks = [
  { 
    name: "Facebook", 
    icon: Facebook, 
    url: "https://www.facebook.com/choudary.sukhvinder" 
  },
  { 
    name: "Instagram", 
    icon: Instagram, 
    url: "https://www.instagram.com/manavwelfaresewasociety" 
  },
  { 
    name: "YouTube", 
    icon: Youtube, 
    url: "https://www.youtube.com/@manavwelfaresewasociety" 
  },
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-background">
                <img src={logo} alt="Manav Welfare Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Manav Welfare</h3>
                <p className="text-sm text-muted-foreground">Seva Society Bhuna</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              मानव वेलफेयर सेवा सोसाइटी एक सामाजिक संस्था है, जो गरीब एवं जरूरतमंद बच्चों को 
              निशुल्क शिक्षा प्रदान करती है और समाज के जरूरतमंद लोगों की सहायता कर मानव सेवा 
              के क्षेत्र में निरंतर कार्य कर रही है।
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Founder & President:</strong> Ch. Sukhvinder Bains</p>
              <p><strong>Director:</strong> Ch. Komal</p>
              <p><strong>Reg. No:</strong> HR/01/2024/01215</p>
              <p><strong>DARPAN ID:</strong> HR/2025/0866027</p>
              <p><strong>Registered:</strong> Haryana Societies Act, 2012</p>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary hover:scale-110 transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-primary"></span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-primary"></span>
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.path}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-primary"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Laxmi+Mata+Mandir+Wali+Gali+Kulan+Road+Shastri+Mandi+Bhuna+Haryana+125111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm hover:text-primary"
                >
                  Laxmi Mata Mandir Wali Gali,<br />
                  Kulan Road, Shastri Mandi,<br />
                  Bhuna, District Fatehabad,<br />
                  Haryana - 125111, India
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <a href="tel:+919812676818" className="block text-muted-foreground text-sm hover:text-primary">
                    +91 98126 76818
                  </a>
                  <a href="tel:+919253276818" className="block text-muted-foreground text-sm hover:text-primary">
                    +91 92532 76818
                  </a>
                  <a href="tel:+917015466537" className="block text-muted-foreground text-sm hover:text-primary">
                    +91 70154 66537
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href="mailto:mwssbhuna@gmail.com" className="text-muted-foreground text-sm hover:text-primary">
                  mwssbhuna@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-muted-foreground/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Manav Welfare Seva Society Bhuna. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}