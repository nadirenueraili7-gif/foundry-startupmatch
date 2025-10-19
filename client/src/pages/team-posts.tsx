// Team Posts browse page with filtering
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type TeamPost } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Clock, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["All", "Engineering", "Design", "Marketing", "Business", "Product", "Sales", "Other"];
const timeCommitments = ["All", "Full-time", "Part-time", "Flexible"];
const compensationTypes = ["All", "Equity", "Paid", "Unpaid", "TBD"];

export default function TeamPosts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");
  const [compensationFilter, setCompensationFilter] = useState("All");

  const { data: teamPosts = [], isLoading } = useQuery<TeamPost[]>({
    queryKey: ["/api/team-posts"],
  });

  const approvedPosts = teamPosts.filter(p => p.status === "approved");

  const filteredPosts = approvedPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.skillsNeeded.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || post.category === categoryFilter;
    const matchesTime = timeFilter === "All" || post.timeCommitment === timeFilter;
    const matchesCompensation = compensationFilter === "All" || post.compensationType === compensationFilter;
    
    return matchesSearch && matchesCategory && matchesTime && matchesCompensation;
  });

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Team Matching</h1>
          <p className="text-xl text-muted-foreground">Find your perfect co-founder</p>
        </div>
        <Link href="/team-posts/new">
          <Button size="lg" data-testid="button-create-team-post">
            <Plus className="h-5 w-5 mr-2" />
            Post Team Need
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-team-posts"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="select-category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger data-testid="select-time-filter">
                <SelectValue placeholder="Time Commitment" />
              </SelectTrigger>
              <SelectContent>
                {timeCommitments.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={compensationFilter} onValueChange={setCompensationFilter}>
              <SelectTrigger data-testid="select-compensation-filter">
                <SelectValue placeholder="Compensation" />
              </SelectTrigger>
              <SelectContent>
                {compensationTypes.map(comp => (
                  <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="h-64 animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => (
            <Link key={post.id} href={`/team-posts/${post.id}`}>
              <Card className="h-full hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid={`card-team-post-${post.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className="text-xs" variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {post.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Skills Needed:</p>
                    <div className="flex flex-wrap gap-2">
                      {post.skillsNeeded.slice(0, 4).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {post.skillsNeeded.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.skillsNeeded.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.timeCommitment}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {post.compensationType}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No team posts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || categoryFilter !== "All" || timeFilter !== "All" || compensationFilter !== "All"
                ? "Try adjusting your filters"
                : "Be the first to post your team needs!"}
            </p>
            {!searchQuery && categoryFilter === "All" && (
              <Link href="/team-posts/new">
                <Button data-testid="button-create-first-post">
                  Create First Post
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
