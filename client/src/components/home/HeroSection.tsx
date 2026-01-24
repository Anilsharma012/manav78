import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, ArrowRight, Phone, UserPlus } from "lucide-react";
import heroImage from "@/assets/free-education-class.jpeg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Children studying together"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-foreground/40" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-float delay-300" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-primary-foreground text-sm font-medium">
              मानव सेवा ही सच्ची सेवा | Reg. No: 01215
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-slide-up">
            Empowering Lives Through
            <span className="block text-primary mt-2">
              Education & Service
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl leading-relaxed animate-slide-up delay-100">
            मानव वेलफेयर सेवा सोसाइटी गरीब एवं जरूरतमंद बच्चों को निशुल्क शिक्षा प्रदान करती है। 
            Providing free education to underprivileged children and serving communities across Haryana.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mb-10 animate-slide-up delay-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">1000+</div>
              <div className="text-primary-foreground/70 text-sm">Children Educated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">50+</div>
              <div className="text-primary-foreground/70 text-sm">Villages Reached</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">₹10L+</div>
              <div className="text-primary-foreground/70 text-sm">Prizes Distributed</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 animate-slide-up delay-300">
            <Link to="/membership">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-elevated group">
                <UserPlus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Membership ₹99
              </Button>
            </Link>
            <Link to="/donate">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevated group">
                <Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Donate Now
              </Button>
            </Link>
            <a href="tel:+919812676818">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Phone className="h-5 w-5 mr-2" />
                +91 98126 76818
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}