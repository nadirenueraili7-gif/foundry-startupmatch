// Admin Dashboard for reviewing and approving content
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { type TeamPost, type ProjectGig, type Startup } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

type ApprovalItem = (TeamPost | ProjectGig | Startup) & { type: "team_post" | "project_gig" | "startup" };

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !user?.isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You do not have admin access.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, isLoading, toast, setLocation]);

  const { data: teamPosts = [] } = useQuery<TeamPost[]>({
    queryKey: ["/api/team-posts"],
  });

  const { data: projectGigs = [] } = useQuery<ProjectGig[]>({
    queryKey: ["/api/project-gigs"],
  });

  const { data: startups = [] } = useQuery<Startup[]>({
    queryKey: ["/api/startups"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, type, action }: { id: string, type: string, action: "approved" | "rejected" }) => {
      const endpoint = type === "team_post" ? "/api/team-posts" : 
                      type === "project_gig" ? "/api/project-gigs" : 
                      "/api/startups";
      return await apiRequest("PATCH", `${endpoint}/${id}`, { status: action });
    },
    onSuccess: (_, { type, action }) => {
      toast({
        title: "Success",
        description: `Item ${action} successfully!`,
      });
      if (type === "team_post") {
        queryClient.invalidateQueries({ queryKey: ["/api/team-posts"] });
      } else if (type === "project_gig") {
        queryClient.invalidateQueries({ queryKey: ["/api/project-gigs"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/startups"] });
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  const pendingTeamPosts = teamPosts.filter(p => p.status === "pending");
  const pendingProjectGigs = projectGigs.filter(p => p.status === "pending");
  const pendingStartups = startups.filter(s => s.status === "pending");

  const totalPending = pendingTeamPosts.length + pendingProjectGigs.length + pendingStartups.length;

  if (isLoading || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-xl text-muted-foreground">
          Review and approve submitted content
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
                <p className="text-3xl font-bold" data-testid="text-pending-count">{totalPending}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                <p className="text-3xl font-bold">
                  {teamPosts.filter(p => p.status === "approved").length + 
                   projectGigs.filter(p => p.status === "approved").length +
                   startups.filter(s => s.status === "approved").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                <p className="text-3xl font-bold">
                  {teamPosts.filter(p => p.status === "rejected").length + 
                   projectGigs.filter(p => p.status === "rejected").length +
                   startups.filter(s => s.status === "rejected").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Tabs */}
      <Tabs defaultValue="team-posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team-posts" data-testid="tab-team-posts">
            Team Posts ({pendingTeamPosts.length})
          </TabsTrigger>
          <TabsTrigger value="project-gigs" data-testid="tab-project-gigs">
            Project Gigs ({pendingProjectGigs.length})
          </TabsTrigger>
          <TabsTrigger value="startups" data-testid="tab-startups">
            Startups ({pendingStartups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team-posts" className="space-y-4">
          {pendingTeamPosts.length > 0 ? (
            pendingTeamPosts.map(post => (
              <Card key={post.id} data-testid={`review-team-post-${post.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{post.category}</Badge>
                        <Badge variant="outline">{post.timeCommitment}</Badge>
                        <Badge variant="outline">{post.compensationType}</Badge>
                      </div>
                    </div>
                    <Badge className="bg-chart-2/10 text-chart-2">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{post.description}</p>
                  <div>
                    <p className="text-sm font-medium mb-2">Skills Needed:</p>
                    <div className="flex flex-wrap gap-2">
                      {post.skillsNeeded.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => approveMutation.mutate({ id: post.id, type: "team_post", action: "approved" })}
                      disabled={approveMutation.isPending}
                      className="bg-success hover:bg-success/90"
                      data-testid={`button-approve-${post.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => approveMutation.mutate({ id: post.id, type: "team_post", action: "rejected" })}
                      disabled={approveMutation.isPending}
                      data-testid={`button-reject-${post.id}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No pending team posts to review
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="project-gigs" className="space-y-4">
          {pendingProjectGigs.length > 0 ? (
            pendingProjectGigs.map(gig => (
              <Card key={gig.id} data-testid={`review-project-gig-${gig.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{gig.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        {gig.categoryTags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className="bg-chart-2/10 text-chart-2">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-muted-foreground">{gig.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Deliverables:</p>
                    <p className="text-muted-foreground">{gig.deliverables}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {gig.requiredSkills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => approveMutation.mutate({ id: gig.id, type: "project_gig", action: "approved" })}
                      disabled={approveMutation.isPending}
                      className="bg-success hover:bg-success/90"
                      data-testid={`button-approve-${gig.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => approveMutation.mutate({ id: gig.id, type: "project_gig", action: "rejected" })}
                      disabled={approveMutation.isPending}
                      data-testid={`button-reject-${gig.id}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No pending project gigs to review
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="startups" className="space-y-4">
          {pendingStartups.length > 0 ? (
            pendingStartups.map(startup => (
              <Card key={startup.id} data-testid={`review-startup-${startup.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{startup.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{startup.stage}</Badge>
                      </div>
                    </div>
                    <Badge className="bg-chart-2/10 text-chart-2">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">One-liner:</p>
                    <p className="text-muted-foreground">{startup.oneLiner}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Description:</p>
                    <p className="text-muted-foreground">{startup.description}</p>
                  </div>
                  {startup.currentNeeds && startup.currentNeeds.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Current Needs:</p>
                      <div className="flex flex-wrap gap-2">
                        {startup.currentNeeds.map((need, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{need}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => approveMutation.mutate({ id: startup.id, type: "startup", action: "approved" })}
                      disabled={approveMutation.isPending}
                      className="bg-success hover:bg-success/90"
                      data-testid={`button-approve-${startup.id}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => approveMutation.mutate({ id: startup.id, type: "startup", action: "rejected" })}
                      disabled={approveMutation.isPending}
                      data-testid={`button-reject-${startup.id}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No pending startups to review
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
