import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ZoomIn, Loader2 } from "lucide-react";

const categories = [
  { id: "all", label: "All" },
  { id: "events", label: "Events" },
  { id: "health", label: "Health Camps" },
  { id: "environment", label: "Tree Plantation" },
  { id: "news", label: "News Coverage" },
  { id: "education", label: "Education" },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all");

  // ✅ FIX: queryClient ka default queryFn JSON return karta hai
  // ✅ PLUS: staleTime 0 + refetchOnMount => admin upload ke baad fresh data show
  const {
    data: galleryItems = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["/api/public/gallery"],
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const filteredItems =
    activeCategory === "all"
      ? (galleryItems as any[])
      : (galleryItems as any[]).filter((item: any) => item.category === activeCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Photo Gallery
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              सेवा के <span className="text-primary">पल</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              हमारी यात्रा की तस्वीरें - शिक्षा, स्वास्थ्य शिविर, पर्यावरण अभियान और समुदाय सेवा।
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Category Tabs */}
          <Tabs defaultValue="all" className="mb-12">
            <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className="px-6 py-2 rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-muted-foreground">
              Failed to load gallery: {(error as Error)?.message || "Unknown error"}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No images available in this category
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item: any) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <div className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 cursor-pointer aspect-square">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-primary-foreground font-semibold text-lg">
                          {item.title}
                        </h3>
                        <p className="text-primary-foreground/80 text-sm">{item.date}</p>
                      </div>
                      <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="h-5 w-5 text-foreground" />
                      </div>
                    </div>
                  </DialogTrigger>

                  <DialogContent className="max-w-4xl bg-card border-border p-0 overflow-hidden">
                    <div className="relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-auto max-h-[80vh] object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/90 to-transparent p-6">
                        <h3 className="text-primary-foreground font-semibold text-xl">
                          {item.title}
                        </h3>
                        <p className="text-primary-foreground/80">{item.date}</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            और देखना चाहते हैं?
          </h2>
          <p className="text-muted-foreground mb-6">
            नवीनतम अपडेट और फ़ोटो के लिए हमें सोशल मीडिया पर फ़ॉलो करें।
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.facebook.com/choudary.sukhvinder"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/manavwelfaresewasociety"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
