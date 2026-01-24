import Layout from "@/components/layout/Layout";
import { Users, Award, Phone, Mail } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  category: "leadership" | "special" | "sarpanch";
}

const leadership: TeamMember[] = [
  { name: "Sukhvinder Choudhary", role: "Chairman", category: "leadership" },
  { name: "Sudesh Kumar", role: "Vice Chairman", category: "leadership" },
  { name: "Geeta Bhakar", role: "Secretary", category: "leadership" },
  { name: "Sandeep", role: "Vice Secretary", category: "leadership" },
  { name: "Koushlay", role: "Treasurer", category: "leadership" },
];

const specialMembers: TeamMember[] = [
  { name: "Rajbir Soni", role: "Special Member", category: "special" },
  { name: "Sumanlata Ma'am", role: "Special Member", category: "special" },
  { name: "Meenu Ma'am", role: "Special Member", category: "special" },
  { name: "Savita", role: "Special Member", category: "special" },
  { name: "Aarti", role: "Special Member", category: "special" },
  { name: "Anjubala", role: "Special Member", category: "special" },
  { name: "Pushpa", role: "Special Member", category: "special" },
  { name: "Ashok Mittal", role: "Special Member", category: "special" },
  { name: "Ashok Singla", role: "Special Member", category: "special" },
  { name: "Sanjay Agarwal", role: "Special Member", category: "special" },
  { name: "Balraj Bains", role: "Special Member", category: "special" },
  { name: "Roop Ravidasiya", role: "Special Member", category: "special" },
  { name: "Bunty Dhaiya", role: "Special Member", category: "special" },
  { name: "Ch. Surender Ranga", role: "Special Member", category: "special" },
  { name: "Ch. Rambhagat Ranga", role: "Special Member", category: "special" },
  { name: "Suresh Kamboj", role: "Special Member", category: "special" },
  { name: "Mahabir", role: "Special Member", category: "special" },
  { name: "Sunita", role: "Special Member", category: "special" },
  { name: "Gugan Barod", role: "Special Member", category: "special" },
  { name: "Amrita", role: "Special Member", category: "special" },
  { name: "Vijander Nehra", role: "Special Member", category: "special" },
  { name: "Sneha", role: "Special Member", category: "special" },
  { name: "Baljeet Siwach", role: "Special Member", category: "special" },
  { name: "Sushma Soni", role: "Special Member", category: "special" },
  { name: "Sumit Sharma", role: "Special Member", category: "special" },
  { name: "Jeetu Singer", role: "Special Member", category: "special" },
  { name: "Parveen Chauhan Thekedar", role: "Special Member", category: "special" },
  { name: "Mahender Khairi", role: "Special Member", category: "special" },
  { name: "Surender Mehra", role: "Special Member", category: "special" },
  { name: "Dr. Sandeep Grover", role: "Special Member", category: "special" },
  { name: "Parveen Pathaniya", role: "Special Member", category: "special" },
  { name: "Parveen Grover", role: "Special Member", category: "special" },
  { name: "Sunny Gill", role: "Special Member", category: "special" },
  { name: "Ram Singh", role: "Special Member", category: "special" },
  { name: "Sunil", role: "Special Member", category: "special" },
  { name: "DP Sharma Dharsul", role: "Special Member", category: "special" },
  { name: "Lovepreet", role: "Special Member", category: "special" },
  { name: "Sir Dharampal Goyal", role: "Special Member", category: "special" },
  { name: "Soni Dhani Bhojraj", role: "Special Member", category: "special" },
];

const sarpanches: TeamMember[] = [
  { name: "Mandeep Yogi", role: "Sarpanch - Gorkhpur", category: "sarpanch" },
  { name: "Sunil", role: "Sarpanch - Dholu", category: "sarpanch" },
  { name: "Deepak Kumar", role: "Sarpanch - Mochi", category: "sarpanch" },
  { name: "Gulab Sharma", role: "Sarpanch - Ghotru", category: "sarpanch" },
  { name: "Mahender Kamboj", role: "Sarpanch - Buwan", category: "sarpanch" },
  { name: "Sukhvinder Sukha", role: "Sarpanch - Dult", category: "sarpanch" },
  { name: "Rajender Khatak", role: "Sarpanch - Dhani Sanchla", category: "sarpanch" },
  { name: "Rajesh", role: "Sarpanch - Dhani Bhojraj", category: "sarpanch" },
  { name: "Madan Yadav", role: "Sarpanch - Dehman", category: "sarpanch" },
];

function TeamCard({ member, featured = false }: { member: TeamMember; featured?: boolean }) {
  return (
    <div className={`bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 ${featured ? 'border-2 border-primary' : ''}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto ${
        featured ? 'bg-gradient-warm text-primary-foreground' : 'bg-primary/10 text-primary'
      }`}>
        {member.name.charAt(0)}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
        <p className={`text-sm ${featured ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
          {member.role}
        </p>
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Our Team
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Meet the <span className="text-primary">People Behind</span> Our Mission
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our dedicated team of volunteers, leaders, and community members who work 
              tirelessly to make a difference in the lives of those we serve.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-primary font-semibold">Leadership</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Executive <span className="text-primary">Committee</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {leadership.map((member) => (
              <TeamCard key={member.name} member={member} featured={member.role === "Chairman"} />
            ))}
          </div>
        </div>
      </section>

      {/* Special Members */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-4 py-2 mb-4">
              <Users className="h-5 w-5 text-secondary" />
              <span className="text-secondary font-semibold">Core Team</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Special <span className="text-primary">Members</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {specialMembers.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Village Sarpanches */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-forest/10 rounded-full px-4 py-2 mb-4">
              <Users className="h-5 w-5 text-forest" />
              <span className="text-forest font-semibold">Village Representatives</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Associated <span className="text-primary">Sarpanches</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Village leaders who support our mission and help us reach communities in need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {sarpanches.map((member) => (
              <TeamCard key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-gradient-warm">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Want to Join Our Team?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-xl mx-auto">
            We're always looking for passionate individuals who want to make a difference 
            in their community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="tel:+91XXXXXXXXXX" className="inline-flex items-center justify-center gap-2 bg-card text-primary px-6 py-3 rounded-lg font-medium hover:bg-card/90 transition-colors">
              <Phone className="h-5 w-5" />
              Call Us
            </a>
            <a href="mailto:info@manavwelfare.org" className="inline-flex items-center justify-center gap-2 border border-primary-foreground text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary-foreground/10 transition-colors">
              <Mail className="h-5 w-5" />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
