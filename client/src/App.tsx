// Main App with routing and authentication from javascript_log_in_with_replit blueprint
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import TeamPosts from "@/pages/team-posts";
import TeamPostCreate from "@/pages/team-post-create";
import ProjectGigs from "@/pages/project-gigs";
import ProjectGigCreate from "@/pages/project-gig-create";
import Startups from "@/pages/startups";
import StartupCreate from "@/pages/startup-create";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/team-posts" component={TeamPosts} />
          <Route path="/team-posts/new" component={TeamPostCreate} />
          <Route path="/project-gigs" component={ProjectGigs} />
          <Route path="/project-gigs/new" component={ProjectGigCreate} />
          <Route path="/startups" component={Startups} />
          <Route path="/startups/new" component={StartupCreate} />
          <Route path="/messages" component={Messages} />
          <Route path="/profile/:id" component={Profile} />
          <Route path="/admin" component={Admin} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  // Sidebar width configuration for better content display
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <TooltipProvider>
        {isAuthenticated ? (
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.location.href = "/api/logout"}
                      data-testid="button-logout"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </header>
                <main className="flex-1 overflow-auto bg-background">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
        ) : (
          <Router />
        )}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthenticatedApp />
    </QueryClientProvider>
  );
}
