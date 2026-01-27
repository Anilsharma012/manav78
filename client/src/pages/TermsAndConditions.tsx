import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";

interface TermsAndConditionsData {
  id: string;
  type: "student" | "membership" | "donation" | "general";
  titleEnglish: string;
  titleHindi?: string;
  contentEnglish: string;
  contentHindi?: string;
  version: number;
  isActive: boolean;
  createdAt: string;
}

export default function TermsAndConditionsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const { data: allTerms = [], isLoading } = useQuery<TermsAndConditionsData[]>({
    queryKey: ["/api/public/terms-and-conditions"],
  });

  const terms = allTerms.filter((t) => t.isActive);

  useEffect(() => {
    document.title = "Terms & Conditions - Manav Welfare Seva Society";
    if (terms.length > 0 && !terms.find(t => t.type === activeTab)) {
      setActiveTab(terms[0].type);
    }
  }, [terms, activeTab]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-96 flex items-center justify-center" data-testid="loading-spinner">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (terms.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12" data-testid="terms-empty-state">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground" data-testid="text-no-terms">
                Terms and Conditions are not currently available. Please check back later.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12" data-testid="terms-page">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-title">Terms & Conditions / शर्तें और शैतियां</h1>
            <p className="text-muted-foreground" data-testid="text-subtitle">
              Please read our terms and conditions carefully before using our services.
            </p>
          </div>

          <Card data-testid="card-terms-content">
            <CardHeader>
              <CardTitle data-testid="text-select-category">Select a category / श्रेणी चुनें</CardTitle>
            </CardHeader>
            <CardContent>
              {terms.length > 1 ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="tabs-categories">
                  <TabsList className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(terms.length, 4)}, 1fr)` }}>
                    {terms.map((term) => (
                      <TabsTrigger 
                        key={term.id} 
                        value={term.type} 
                        className="text-sm"
                        data-testid={`tab-${term.type}`}
                      >
                        {term.type === "general" ? "General" : term.type === "student" ? "Student" : term.type === "membership" ? "Membership" : "Donation"}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {terms.map((term) => (
                    <TabsContent key={term.id} value={term.type} className="space-y-4 mt-6" data-testid={`content-${term.type}`}>
                      <div>
                        <h2 className="text-2xl font-bold mb-2" data-testid="text-term-title">{term.titleEnglish}</h2>
                        {term.titleHindi && (
                          <p className="text-lg text-muted-foreground mb-6" data-testid="text-term-title-hindi">{term.titleHindi}</p>
                        )}
                      </div>

                      <div className="prose prose-sm max-w-none dark:prose-invert space-y-4" data-testid="text-term-content">
                        <div dangerouslySetInnerHTML={{ __html: term.contentEnglish }} />
                      </div>

                      {term.contentHindi && (
                        <div className="mt-8 pt-8 border-t" data-testid="section-hindi-content">
                          <h3 className="text-lg font-semibold mb-4">{term.titleHindi}</h3>
                          <div className="prose prose-sm max-w-none dark:prose-invert space-y-4">
                            <div dangerouslySetInnerHTML={{ __html: term.contentHindi }} />
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-8 pt-4 border-t" data-testid="text-term-meta">
                        <p>Version: {term.version}</p>
                        <p>Last updated: {new Date(term.createdAt).toLocaleDateString()}</p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="space-y-4" data-testid="section-single-term">
                  <div>
                    <h2 className="text-2xl font-bold mb-2" data-testid="text-term-title">{terms[0].titleEnglish}</h2>
                    {terms[0].titleHindi && (
                      <p className="text-lg text-muted-foreground mb-6" data-testid="text-term-title-hindi">{terms[0].titleHindi}</p>
                    )}
                  </div>

                  <div className="prose prose-sm max-w-none dark:prose-invert space-y-4" data-testid="text-term-content">
                    <div dangerouslySetInnerHTML={{ __html: terms[0].contentEnglish }} />
                  </div>

                  {terms[0].contentHindi && (
                    <div className="mt-8 pt-8 border-t" data-testid="section-hindi-content">
                      <h3 className="text-lg font-semibold mb-4">{terms[0].titleHindi}</h3>
                      <div className="prose prose-sm max-w-none dark:prose-invert space-y-4">
                        <div dangerouslySetInnerHTML={{ __html: terms[0].contentHindi }} />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-8 pt-4 border-t" data-testid="text-term-meta">
                    <p>Version: {terms[0].version}</p>
                    <p>Last updated: {new Date(terms[0].createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
