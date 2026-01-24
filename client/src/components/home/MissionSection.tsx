import { Heart, BookOpen, Leaf, Users, Droplets, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const missions = [
  {
    icon: BookOpen,
    title: "Free Education",
    description: "निशुल्क शिक्षा providing underprivileged children access to quality education and learning materials.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Heart,
    title: "Health Camps",
    description: "Organizing regular health checkups and blood donation camps for communities in need.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Leaf,
    title: "Environment",
    description: "Tree plantation drives and environmental awareness camps for a greener future.",
    color: "bg-forest/10 text-forest",
  },
  {
    icon: Users,
    title: "Women Welfare",
    description: "Supporting women through skill development and marriage assistance programs.",
    color: "bg-terracotta/10 text-terracotta",
  },
  {
    icon: Droplets,
    title: "Blood Donation",
    description: "Regular blood donation camps saving lives and building a culture of giving.",
    color: "bg-destructive/10 text-destructive",
  },
  {
    icon: Home,
    title: "Elderly Care",
    description: "Planning to establish old age homes to care for our senior citizens.",
    color: "bg-gold/10 text-gold",
  },
];

export default function MissionSection() {
  return (
    <section className="py-20 bg-muted/30 pattern-dots">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Our Mission & <span className="text-primary">Initiatives</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Through education, healthcare, and community support, we strive to create 
            a society where everyone has the opportunity to thrive and succeed.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {missions.map((mission, index) => (
            <div
              key={mission.title}
              className={cn(
                "group bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2",
                "animate-slide-up"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
                mission.color
              )}>
                <mission.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {mission.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {mission.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
