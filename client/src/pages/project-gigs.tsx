// Project Gigs browse page
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ProjectGig } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Briefcase, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function ProjectGigs() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projectGigs = [], isLoading } = useQuery<ProjectGig[]>({
    queryKey: ["/api/project-gigs"],
  });

  const approvedGigs = projectGigs.filter(p => p.status === "approved");

  const filteredGigs = approvedGigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gig.categoryTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         gig.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Project Gigs</h1>
          <p className="text-xl text-muted-foreground">Discover project opportunities</p>
        </div>
        <Link href="/project-gigs/new">
          <Button size="lg" data-testid="button-create-project-gig">
            <Plus className="h-5 w-5 mr-2" />
            Post Project Gig
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search project gigs by title, skills, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-project-gigs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="h-72 animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredGigs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.map(gig => (
            <Link key={gig.id} href={`/project-gigs/${gig.id}`}>
              <Card className="h-full hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid={`card-project-gig-${gig.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {gig.categoryTags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} className="text-xs" variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{gig.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {gig.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {gig.requiredSkills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {gig.requiredSkills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{gig.requiredSkills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      <span>{gig.compensation}</span>
                    </div>
                    {gig.deadline && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(gig.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No project gigs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Be the first to post a project gig!"}
            </p>
            {!searchQuery && (
              <Link href="/project-gigs/new">
                <Button data-testid="button-create-first-gig">
                  Create First Gig
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
