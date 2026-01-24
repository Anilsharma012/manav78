import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import freeEducation from "@/assets/free-education-class.jpeg";
import watermelonDist from "@/assets/watermelon-distribution.jpeg";
import communityReal from "@/assets/community-service-real.jpeg";

const programs = [
  {
    title: "Free Education Program",
    description: "गरीब बच्चों को निशुल्क शिक्षा, किताबें और स्टेशनरी प्रदान करना।",
    image: freeEducation,
    link: "/programs/education",
    tag: "Education",
  },
  {
    title: "Community Service",
    description: "समुदाय सेवा - तरबूज वितरण, राशन वितरण और अन्य सेवाएं।",
    image: watermelonDist,
    link: "/programs/relief",
    tag: "Service",
  },
  {
    title: "Social Events",
    description: "समाज में जागरूकता और प्रतियोगिताओं का आयोजन।",
    image: communityReal,
    link: "/programs/gk-exams",
    tag: "Events",
  },
];

export default function ProgramsPreview() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Our Programs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Making a <span className="text-primary">Difference</span>
            </h2>
          </div>
          <Link to="/programs">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground group">
              View All Programs
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <Link
              key={program.title}
              to={program.link}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  {program.tag}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {program.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {program.description}
                </p>
                <div className="flex items-center text-primary font-medium">
                  Learn More
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
