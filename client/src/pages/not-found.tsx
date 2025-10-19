import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-12 text-center">
          <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
