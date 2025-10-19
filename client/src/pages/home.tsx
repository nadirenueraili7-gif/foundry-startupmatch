// Home dashboard for authenticated users
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Rocket, MessageSquare, TrendingUp, Plus } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type TeamPost, type ProjectGig, type Startup } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();

  // Fetch recent data for dashboard
  const { data: teamPosts = [] } = useQuery<TeamPost[]>({
    queryKey: ["/api/team-posts"],
  });

  const { data: projectGigs = [] } = useQuery<ProjectGig[]>({
    queryKey: ["/api/project-gigs"],
  });

  const { data: startups = [] } = useQuery<Startup[]>({
    queryKey: ["/api/startups"],
  });

  const approvedTeamPosts = teamPosts.filter(p => p.status === "approved");
  const approvedProjectGigs = projectGigs.filter(p => p.status === "approved");
  const approvedStartups = startups.filter(s => s.status === "approved");

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-xl text-muted-foreground">
          {user?.university ? `${user.university} • ` : ""}
          {user?.major || "Ready to build something amazing?"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover-elevate transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Team Posts</p>
                <p className="text-3xl font-bold" data-testid="text-team-posts-count">
                  {approvedTeamPosts.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Project Gigs</p>
                <p className="text-3xl font-bold" data-testid="text-project-gigs-count">
                  {approvedProjectGigs.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Startups</p>
                <p className="text-3xl font-bold" data-testid="text-startups-count">
                  {approvedStartups.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Opportunities</p>
                <p className="text-3xl font-bold" data-testid="text-total-opportunities">
                  {approvedTeamPosts.length + approvedProjectGigs.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/team-posts/new">
              <Button className="w-full justify-start gap-2" data-testid="button-create-team-post">
                <Plus className="h-4 w-4" />
                Post Team Need
              </Button>
            </Link>
            <Link href="/project-gigs/new">
              <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-create-project-gig">
                <Plus className="h-4 w-4" />
                Post Project Gig
              </Button>
            </Link>
            <Link href="/startups/new">
              <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-create-startup">
                <Plus className="h-4 w-4" />
                Showcase Startup
              </Button>
            </Link>
            <Link href="/messages">
              <Button className="w-full justify-start gap-2" variant="outline" data-testid="button-view-messages">
                <MessageSquare className="h-4 w-4" />
                Messages
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Recent Team Posts</CardTitle>
            <Link href="/team-posts">
              <Button variant="ghost" size="sm" data-testid="link-view-all-team-posts">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {approvedTeamPosts.slice(0, 3).length > 0 ? (
              <div className="space-y-4">
                {approvedTeamPosts.slice(0, 3).map((post) => (
                  <Link key={post.id} href={`/team-posts/${post.id}`}>
                    <div className="p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-team-post-${post.id}`}>
                      <h4 className="font-semibold mb-1">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {post.description}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {post.skillsNeeded.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-md bg-muted">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No team posts yet. Be the first to post!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Recent Project Gigs</CardTitle>
            <Link href="/project-gigs">
              <Button variant="ghost" size="sm" data-testid="link-view-all-project-gigs">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {approvedProjectGigs.slice(0, 3).length > 0 ? (
              <div className="space-y-4">
                {approvedProjectGigs.slice(0, 3).map((gig) => (
                  <Link key={gig.id} href={`/project-gigs/${gig.id}`}>
                    <div className="p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-project-gig-${gig.id}`}>
                      <h4 className="font-semibold mb-1">{gig.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {gig.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {gig.compensation}
                        </span>
                        {gig.deadline && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(gig.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No project gigs yet. Post your first project!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
