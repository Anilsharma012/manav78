import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";

interface VolunteerContent {
  id: string;
  sectionKey: string;
  title: string;
  titleHindi?: string;
  content: string;
  contentHindi?: string;
  imageUrls?: string[];
  isActive: boolean;
}

export default function VolunteerSection() {
  const [volunteerContent, setVolunteerContent] = useState<VolunteerContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteerContent = async () => {
      try {
        const res = await fetch("/api/public/content/volunteer");
        if (res.ok) {
          const data = await res.json();
          // Get the first active section
          const activeSection = Array.isArray(data) ? data.find((s: VolunteerContent) => s.isActive) : data;
          if (activeSection) {
            setVolunteerContent(activeSection);
          }
        }
      } catch (error) {
        console.error("Error fetching volunteer content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolunteerContent();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="container mx-auto flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!volunteerContent || !volunteerContent.isActive) {
    return null;
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div>
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
                Join Us
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {volunteerContent.title}
              </h2>
              {volunteerContent.titleHindi && (
                <p className="text-lg text-muted-foreground">
                  {volunteerContent.titleHindi}
                </p>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{volunteerContent.content}</p>
              {volunteerContent.contentHindi && (
                <p className="text-sm mt-4">{volunteerContent.contentHindi}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Link href="/volunteer">
                <Button size="lg" className="gap-2">
                  <Heart className="h-5 w-5" />
                  Become a Volunteer
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/terms-and-conditions">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          {volunteerContent.imageUrls && volunteerContent.imageUrls.length > 0 && (
            <div className="relative">
              <img
                src={volunteerContent.imageUrls[0]}
                alt="Volunteer"
                className="rounded-lg shadow-lg w-full h-auto object-cover"
              />
              {volunteerContent.imageUrls.length > 1 && (
                <Card className="absolute bottom-4 right-4 max-w-xs">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Join our growing community of dedicated volunteers making a difference
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
