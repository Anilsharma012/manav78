import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "मानव वेलफेयर सेवा सोसाइटी ने मेरे बच्चे को मुफ्त शिक्षा प्रदान की। अब वह अच्छे से पढ़ाई कर रहा है।",
    name: "रामू किसान",
    role: "Parent, Badhwana",
  },
  {
    quote: "The health camp organized by the society helped many families in our village get free medical checkups and medicines.",
    name: "Sunita Devi",
    role: "Village Resident",
  },
  {
    quote: "प्रतियोगिताओं में भाग लेकर मुझे इनाम मिला और मेरा आत्मविश्वास बढ़ा। धन्यवाद मानव वेलफेयर!",
    name: "अंकित शर्मा",
    role: "Student",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Voices of <span className="text-primary">Impact</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Hear from the communities and individuals whose lives have been touched 
            by our initiatives.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Quote className="h-5 w-5 text-primary-foreground" />
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6 mt-4">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
