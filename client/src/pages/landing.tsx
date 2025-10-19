// Landing page for logged-out users
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Users, Briefcase, MessageSquare, CheckCircle } from "lucide-react";
import heroImage from "@assets/generated_images/University_startup_collaboration_hero_7fc8a3b3.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full overflow-hidden">
        <img 
          src={heroImage} 
          alt="University students collaborating on startups"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        
        <div className="relative h-full flex items-center">
          <div className="max-w-6xl mx-auto px-8 w-full">
            <div className="max-w-3xl text-white">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Find Your Perfect Co-Founder
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Join the premier university startup networking platform. Connect with talented students, 
                discover exciting projects, and build the next big thing together.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-get-started"
                >
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 backdrop-blur-sm bg-white/10 text-white border-white/30 hover:bg-white/20"
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Launch</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Foundry StartupMatch brings together the best tools and community for student entrepreneurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Team Matching</h3>
                <p className="text-muted-foreground">
                  Find co-founders with complementary skills. Post your needs and discover talented students 
                  looking for exciting opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Project Gigs</h3>
                <p className="text-muted-foreground">
                  Browse and post project opportunities. Get help with market research, design, development, 
                  and more from skilled students.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-chart-3" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Startup Showcase</h3>
                <p className="text-muted-foreground">
                  Present your startup to the community. Share your vision, milestones, and current needs 
                  to attract talent and support.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-chart-4" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Direct Messaging</h3>
                <p className="text-muted-foreground">
                  Connect directly with other entrepreneurs. Build relationships and collaborate seamlessly 
                  with real-time messaging.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verified Community</h3>
                <p className="text-muted-foreground">
                  Join a trusted network of university students. All posts and profiles are reviewed to 
                  ensure quality and authenticity.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-chart-3" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Launch Faster</h3>
                <p className="text-muted-foreground">
                  Access resources, find talent, and build your network. Everything you need to go from 
                  idea to launch in one place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-8 bg-muted">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of student entrepreneurs finding co-founders and launching startups
          </p>
          <Button 
            size="lg" 
            className="text-lg px-12"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-join-now"
          >
            Join Foundry StartupMatch
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 px-8 border-t">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© 2025 Foundry StartupMatch. Connecting student entrepreneurs.</p>
        </div>
      </div>
    </div>
  );
}
