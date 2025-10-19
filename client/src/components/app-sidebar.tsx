// App sidebar using Shadcn sidebar primitives
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Home, Users, Briefcase, Rocket, MessageSquare, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home, testId: "link-dashboard" },
  { title: "Team Matching", url: "/team-posts", icon: Users, testId: "link-team-posts" },
  { title: "Project Gigs", url: "/project-gigs", icon: Briefcase, testId: "link-project-gigs" },
  { title: "Startup Showcase", url: "/startups", icon: Rocket, testId: "link-startups" },
  { title: "Messages", url: "/messages", icon: MessageSquare, testId: "link-messages" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Foundry</h1>
              <p className="text-xs text-muted-foreground">StartupMatch</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location === "/admin"}>
                    <Link href="/admin" data-testid="link-admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Link href={`/profile/${user?.id}`}>
          <div className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg p-2 cursor-pointer" data-testid="link-user-profile">
            <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
