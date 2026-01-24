import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Heart, Leaf, Users, Droplets, Home, Award, GraduationCap, Scissors, Stethoscope, Package, Globe } from "lucide-react";
import educationBanner from "@/assets/education-banner.jpeg";
import communityImage from "@/assets/community-service-real.jpeg";
import tributeEvent from "@/assets/tribute-event.jpeg";
import eventCeremony from "@/assets/event-ceremony.jpeg";

const programs = [
  {
    id: "education",
    icon: BookOpen,
    title: "Free Education & Coaching",
    titleHindi: "निशुल्क शिक्षा एवं कोचिंग",
    description: "गाँवों में बच्चों को निःशुल्क शिक्षा, Stationery, uniform, book distribution और Special Sunday classes।",
    details: [
      "गाँवों में बच्चों को निशुल्क शिक्षा",
      "Stationery, uniform, book distribution",
      "Special classes / Sunday classes / exam prep",
      "झुकी झोपड़ी वाले बच्चों को जूते, चप्पल, कंबल, किताबें वितरण",
    ],
    image: educationBanner,
    color: "bg-primary/10 text-primary",
    link: "/programs/education",
  },
  {
    id: "gk-exams",
    icon: GraduationCap,
    title: "GK Exams & Educational Activities",
    titleHindi: "हरियाणा जीके प्रतियोगिता",
    description: "Haryana GK & General Awareness Exams with Online + Offline registration और Certificate distribution।",
    details: [
      "हरियाणा जीके एवं सामान्य ज्ञान प्रतियोगिता",
      "Online + Offline registration system",
      "₹99 per student registration model",
      "Certificate distribution & लाखों रुपए के इनाम वितरण",
    ],
    image: eventCeremony,
    color: "bg-secondary/10 text-secondary",
    link: "/programs/gk-exams",
  },
  {
    id: "women",
    icon: Scissors,
    title: "Women Empowerment",
    titleHindi: "महिला सशक्तिकरण",
    description: "सिलाई, ब्यूटी पार्लर, self-employment training और Health awareness sessions।",
    details: [
      "सिलाई, ब्यूटी पार्लर training",
      "Self-employment training",
      "Health awareness & legal awareness sessions",
      "Small group meetings, SHG-type models",
    ],
    image: communityImage,
    color: "bg-pink-500/10 text-pink-600",
    link: "/programs/women-empowerment",
  },
  {
    id: "health",
    icon: Stethoscope,
    title: "Health & Hygiene",
    titleHindi: "स्वास्थ्य एवं स्वच्छता",
    description: "Free medical camps, Blood donation drives और Nasha Mukti awareness programs।",
    details: [
      "Free medical camps in villages",
      "Blood donation drives - रक्तदान शिविर",
      "Nasha Mukti awareness programs",
      "Health awareness campaigns",
    ],
    image: tributeEvent,
    color: "bg-red-500/10 text-red-600",
    link: "/programs/health",
  },
  {
    id: "environment",
    icon: Leaf,
    title: "Swachhta & Environment",
    titleHindi: "स्वच्छता एवं पर्यावरण",
    description: "Swachh Bharat से जुड़ी गतिविधियाँ, Villages में सफाई अभियान और Tree plantation drives।",
    details: [
      "Swachh Bharat से जुड़ी गतिविधियाँ",
      "Villages & urban areas में सफाई अभियान",
      "Plastic-free awareness campaigns",
      "Tree plantation drives - वृक्षारोपण अभियान",
    ],
    image: communityImage,
    color: "bg-green-500/10 text-green-600",
    link: "/programs/environment",
  },
  {
    id: "relief",
    icon: Package,
    title: "Emergency & Relief Work",
    titleHindi: "आपातकालीन राहत कार्य",
    description: "Covid-19 support, Ration distribution और Winter में कंबल/कपड़े वितरण।",
    details: [
      "Covid-19 support & relief",
      "Ration distribution to needy",
      "Winter में कंबल / कपड़े वितरण",
      "गरीब लड़कियों की शादी में सहयोग",
    ],
    image: communityImage,
    color: "bg-orange-500/10 text-orange-600",
    link: "/programs/relief",
  },
  {
    id: "csc",
    icon: Globe,
    title: "Social Services & CSC Integration",
    titleHindi: "सामाजिक सेवाएं और CSC",
    description: "CSC centers के साथ मिलकर govt forms भरवाना और community services।",
    details: [
      "CSC centers के साथ partnership",
      "Government forms और schemes में सहायता",
      "Digital literacy programs",
      "Community service initiatives",
    ],
    image: eventCeremony,
    color: "bg-blue-500/10 text-blue-600",
    link: "/programs/csc",
  },
  {
    id: "elderly",
    icon: Home,
    title: "Elderly Care (Upcoming)",
    titleHindi: "वृद्ध आश्रम (जल्द आ रहा है)",
    description: "कुछ दिन बाद वृद्ध आश्रम खोलने का प्लान है।",
    details: [
      "वृद्ध आश्रम स्थापना (planned)",
      "Elderly welfare programs",
      "Medical support for seniors",
      "Social activities for elderly",
    ],
    image: tributeEvent,
    color: "bg-amber-500/10 text-amber-600",
    link: "/programs/elderly-care",
  },
];

export default function Programs() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Our Services / हमारी सेवाएं
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What We <span className="text-primary">Do</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              समाज के जरूरतमंद लोगों की सहायता कर मानव सेवा के क्षेत्र में निरंतर कार्य।
              Through our various initiatives, we work towards building a better society 
              where education, healthcare, and basic necessities are accessible to all.
            </p>
          </div>
        </div>
      </section>

      {/* Programs List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-20">
            {programs.map((program, index) => (
              <div
                key={program.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Image */}
                <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                  <div className="relative rounded-3xl overflow-hidden shadow-elevated group">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
                    <div className={`absolute top-6 left-6 w-14 h-14 rounded-2xl ${program.color} flex items-center justify-center`}>
                      <program.icon className="h-7 w-7" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <span className="text-muted-foreground text-sm mb-2 block">{program.titleHindi}</span>
                  <h2 className="text-3xl font-bold text-foreground mb-4">{program.title}</h2>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    {program.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {program.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3">
                        <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={program.link}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                  >
                    Learn More
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Our Impact in Numbers
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-foreground mb-2">1000+</div>
              <div className="text-primary-foreground/80">Children Educated</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-foreground mb-2">50+</div>
              <div className="text-primary-foreground/80">Villages Covered</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-foreground mb-2">₹10L+</div>
              <div className="text-primary-foreground/80">Prizes Distributed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary-foreground mb-2">100+</div>
              <div className="text-primary-foreground/80">Events Organized</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Want to Volunteer? / स्वयंसेवक बनना चाहते हैं?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join us in making a difference. Register as a volunteer and be part of our mission.
          </p>
          <Link to="/volunteer">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Join as Volunteer
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}