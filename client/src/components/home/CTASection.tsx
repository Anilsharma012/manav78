import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, Phone } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-terracotta to-secondary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Join Us in Making a <span className="text-gold">Difference</span>
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-10 leading-relaxed">
            Your support can transform lives. Whether through donations, volunteering, 
            or spreading awareness, every contribution counts in building a better future 
            for underprivileged communities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link to="/donate">
              <Button size="lg" className="bg-card text-primary hover:bg-card/90 shadow-elevated group w-full sm:w-auto">
                <Heart className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Make a Donation
              </Button>
            </Link>
            <Link to="/volunteer">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
              >
                <Users className="h-5 w-5 mr-2" />
                Become a Volunteer
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
              >
                <Phone className="h-5 w-5 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              Registered NGO
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              100% Transparent
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              Tax Deductible
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
