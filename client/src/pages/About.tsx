import Layout from "@/components/layout/Layout";
import { CheckCircle, Award, Target, Eye, Heart, Users, Calendar, Phone, Building } from "lucide-react";
import communityImage from "@/assets/community-service-real.jpeg";
import educationImage from "@/assets/free-education-class.jpeg";
import chairmanImage from "@/assets/chairman.jpeg";

const milestones = [
  { year: "स्थापना", event: "संस्था का गठन", description: "हरियाणा के भूना में मानव वेलफेयर सेवा सोसाइटी की स्थापना" },
  { year: "2020", event: "शिक्षा कार्यक्रम", description: "गरीब बच्चों के लिए निशुल्क शिक्षा केंद्रों की शुरुआत" },
  { year: "2021", event: "प्रतियोगिताएं", description: "हरियाणा GK प्रतियोगिताओं का आयोजन शुरू" },
  { year: "2022", event: "स्वास्थ्य सेवाएं", description: "निशुल्क स्वास्थ्य शिविरों की शुरुआत" },
  { year: "2023", event: "विस्तार", description: "कई गांवों में कार्यक्रमों का विस्तार" },
  { year: "2024", event: "नई पहल", description: "महिला सशक्तिकरण और पर्यावरण संरक्षण कार्यक्रम" },
];

const values = [
  { icon: Heart, title: "करुणा", titleEn: "Compassion", description: "प्रेम और सहानुभूति से सेवा" },
  { icon: Target, title: "समर्पण", titleEn: "Dedication", description: "मिशन के प्रति प्रतिबद्धता" },
  { icon: Users, title: "समुदाय", titleEn: "Community", description: "मजबूत समुदाय का निर्माण" },
  { icon: Award, title: "उत्कृष्टता", titleEn: "Excellence", description: "सर्वश्रेष्ठ के लिए प्रयास" },
];

const leadership = [
  { title: "Founder & President", titleHindi: "संस्थापक एवं अध्यक्ष", name: "Ch. Sukhvinder Bains", location: "भूना, फतेहाबाद" },
  { title: "Director", titleHindi: "निदेशक", name: "Ch. Komal", location: "भूना, फतेहाबाद" },
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              About Us / हमारे बारे में
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              मानवता की <span className="text-primary">सेवा में समर्पित</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              मानव वेलफेयर सेवा सोसाइटी एक सामाजिक संस्था है, जो गरीब एवं जरूरतमंद बच्चों को 
              निशुल्क शिक्षा प्रदान करती है। समाज के जरूरतमंद लोगों की सहायता कर मानव सेवा 
              के क्षेत्र में निरंतर कार्य कर रही है।
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Leadership / नेतृत्व
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              संस्था <span className="text-primary">प्रबंधन</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {leadership.map((leader) => (
              <div key={leader.name} className="bg-card rounded-2xl p-6 shadow-card text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{leader.title}</h3>
                <p className="text-muted-foreground text-sm">{leader.titleHindi}</p>
                <p className="text-xl font-semibold text-primary mt-3">{leader.name}</p>
                <p className="text-sm text-muted-foreground">{leader.location}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-6 py-3">
              <Phone className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">+91 98126 76818</span>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <img
                src={communityImage}
                alt="Community service"
                className="rounded-3xl shadow-elevated w-full h-[400px] object-cover"
              />
            </div>
            <div className="space-y-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">हमारी दृष्टि / Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  एक ऐसा समाज बनाना जहां हर बच्चे को गुणवत्तापूर्ण शिक्षा, हर व्यक्ति को 
                  स्वास्थ्य सेवाएं और हर समुदाय समृद्धि के साथ विकसित हो।
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">हमारा मिशन / Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  गरीब एवं जरूरतमंद बच्चों को निशुल्क शिक्षा प्रदान करना, समाज के जरूरतमंद 
                  लोगों की सहायता करना, और हरियाणा जीके जैसी प्रतियोगिताओं के माध्यम से 
                  बच्चों में ज्ञान बढ़ाना।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Our Journey / हमारी यात्रा
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              सेवा की <span className="text-primary">यात्रा</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              जो एक छोटी सी पहल के रूप में शुरू हुआ, वह आज हजारों जिंदगियों को छू रहा है। 
              हमारी यात्रा समुदाय और करुणा की शक्ति का प्रमाण है।
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{milestone.event}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Our Values / हमारे मूल्य
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              क्या हमें <span className="text-primary">प्रेरित करता है</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center bg-card p-6 rounded-2xl shadow-card">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-1">{value.title}</h3>
                <p className="text-sm text-primary mb-2">{value.titleEn}</p>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Details */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-card">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Award className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">पंजीकरण और प्रमाणन</h2>
                  <p className="text-muted-foreground">Registration & Certification</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Society Registration</p>
                    <p className="text-muted-foreground text-sm">Reg. No: 01215</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">NGO Darpan Registration</p>
                    <p className="text-muted-foreground text-sm">NITI Aayog Verified</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">80G Certification</p>
                    <p className="text-muted-foreground text-sm">Tax Deductible Donations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">12A Registration</p>
                    <p className="text-muted-foreground text-sm">Income Tax Exemption</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-center md:text-left">
                    <p className="font-semibold text-foreground">Founder & President: Ch. Sukhvinder Bains</p>
                    <p className="text-muted-foreground">Director: Ch. Komal</p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Phone className="h-5 w-5" />
                    +91 98126 76818
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
