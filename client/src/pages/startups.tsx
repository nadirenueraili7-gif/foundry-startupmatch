// Startups Showcase browse page
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Startup } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Rocket } from "lucide-react";
import { Link } from "wouter";
import placeholderImage from "@assets/generated_images/Startup_placeholder_abstract_tech_a40e8997.png";

const stageColors: Record<string, string> = {
  "Idea": "bg-muted text-muted-foreground",
  "Seed": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  "Early": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  "Growth": "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
};

export default function Startups() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: startups = [], isLoading } = useQuery<Startup[]>({
    queryKey: ["/api/startups"],
  });

  const approvedStartups = startups.filter(s => s.status === "approved");

  const filteredStartups = approvedStartups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         startup.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Startup Showcase</h1>
          <p className="text-xl text-muted-foreground">Discover student-led ventures</p>
        </div>
        <Link href="/startups/new">
          <Button size="lg" data-testid="button-create-startup">
            <Plus className="h-5 w-5 mr-2" />
            Showcase Your Startup
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search startups by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-startups"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-80 animate-pulse">
              <div className="h-48 bg-muted" />
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredStartups.map(startup => (
            <Link key={startup.id} href={`/startups/${startup.id}`}>
              <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all h-full" data-testid={`card-startup-${startup.id}`}>
                {/* Hero Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-chart-2/20 overflow-hidden">
                  <img 
                    src={startup.heroImageUrl || placeholderImage} 
                    alt={startup.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Logo */}
                  {startup.logoUrl && (
                    <div className="absolute bottom-0 left-6 transform translate-y-1/2">
                      <div className="h-20 w-20 rounded-full border-4 border-card bg-card overflow-hidden">
                        <img 
                          src={startup.logoUrl} 
                          alt={`${startup.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="pt-12 pb-6 px-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-2xl font-bold line-clamp-1">{startup.name}</h3>
                    <Badge className={`${stageColors[startup.stage] || stageColors.Idea} text-xs shrink-0`}>
                      {startup.stage}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {startup.oneLiner}
                  </p>

                  {startup.currentNeeds && startup.currentNeeds.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Current Needs:</p>
                      <div className="flex flex-wrap gap-2">
                        {startup.currentNeeds.slice(0, 3).map((need, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {need}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No startups found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Be the first to showcase your startup!"}
            </p>
            {!searchQuery && (
              <Link href="/startups/new">
                <Button data-testid="button-create-first-startup">
                  Showcase First Startup
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
