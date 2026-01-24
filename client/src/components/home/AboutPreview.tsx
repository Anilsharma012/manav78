import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Users, Heart, CheckCircle } from "lucide-react";
import communityImage from "@/assets/watermelon-distribution.jpeg";

const highlights = [
  "Registered NGO under Societies Registration Act",
  "Serving communities for over 10 years",
  "50+ active volunteers across Haryana",
  "Transparent and accountable operations",
];

export default function AboutPreview() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img
                src={communityImage}
                alt="Community service by Manav Welfare Seva Society"
                className="w-full h-[500px] object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -right-8 bg-card rounded-2xl p-6 shadow-elevated animate-float">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-foreground">10K+</div>
                  <div className="text-muted-foreground text-sm">Lives Impacted</div>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
          </div>

          {/* Content Side */}
          <div>
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              About Our Society
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Dedicated to <span className="text-primary">Humanity</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              मानव वेलफेयर सेवा सोसाइटी एक सामाजिक संस्था है जो गरीब एवं जरूरतमंद बच्चों को 
              निशुल्क शिक्षा प्रदान करती है। बच्चों में ज्ञान बढ़ाने और उन्हें उत्साहित करने के 
              उद्देश्य से समय-समय पर हरियाणा जीके जैसी प्रतियोगिताओं का आयोजन करती है।
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Through competitions like "Haryana Ko Jano" and "Haryana Ko Pehchano," 
              we encourage learning and reward children with prizes worth lakhs of rupees, 
              motivating them to excel in their studies.
            </p>

            {/* Highlights */}
            <ul className="space-y-3 mb-8">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-8 mb-8 py-6 border-y border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">60+</div>
                  <div className="text-muted-foreground text-sm">Team Members</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">100+</div>
                  <div className="text-muted-foreground text-sm">Events Organized</div>
                </div>
              </div>
            </div>

            <Link to="/about">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 group">
                Learn More About Us
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
