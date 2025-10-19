// Create Startup profile form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertStartupSchema, type InsertStartup } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

const stages = ["Idea", "Seed", "Early", "Growth"];

export default function StartupCreate() {
  const [, setLocation] = useLocation();
  const { toast} = useToast();
  const queryClient = useQueryClient();
  const [milestones, setMilestones] = useState<string[]>([]);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [needInput, setNeedInput] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  const form = useForm<InsertStartup>({
    resolver: zodResolver(insertStartupSchema),
    defaultValues: {
      name: "",
      oneLiner: "",
      description: "",
      stage: "Idea",
      linkedinUrl: "",
      websiteUrl: "",
      twitterUrl: "",
      pitchDeckUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertStartup) => {
      // Create FormData to support file uploads
      const formData = new FormData();
      
      // Add all text fields
      formData.append('name', data.name);
      formData.append('oneLiner', data.oneLiner);
      formData.append('description', data.description);
      formData.append('stage', data.stage);
      
      if (data.linkedinUrl) formData.append('linkedinUrl', data.linkedinUrl);
      if (data.websiteUrl) formData.append('websiteUrl', data.websiteUrl);
      if (data.twitterUrl) formData.append('twitterUrl', data.twitterUrl);
      if (data.pitchDeckUrl) formData.append('pitchDeckUrl', data.pitchDeckUrl);
      
      if (milestones.length > 0) {
        formData.append('milestones', JSON.stringify(milestones));
      }
      if (needs.length > 0) {
        formData.append('currentNeeds', JSON.stringify(needs));
      }
      
      // Add files if selected, otherwise add URLs
      if (logoFile) {
        formData.append('logoFile', logoFile);
      } else if (data.logoUrl) {
        formData.append('logoUrl', data.logoUrl);
      }
      
      if (heroImageFile) {
        formData.append('heroImageFile', heroImageFile);
      } else if (data.heroImageUrl) {
        formData.append('heroImageUrl', data.heroImageUrl);
      }
      
      // Send FormData
      const response = await fetch('/api/startups', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create startup');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your startup has been submitted for review!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/startups"] });
      setLocation("/startups");
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
        description: "Failed to create startup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertStartup) => {
    mutation.mutate({ ...data, milestones, currentNeeds: needs });
  };

  const addMilestone = () => {
    if (milestoneInput.trim() && !milestones.includes(milestoneInput.trim())) {
      setMilestones([...milestones, milestoneInput.trim()]);
      setMilestoneInput("");
    }
  };

  const removeMilestone = (milestone: string) => {
    setMilestones(milestones.filter(m => m !== milestone));
  };

  const addNeed = () => {
    if (needInput.trim() && !needs.includes(needInput.trim())) {
      setNeeds([...needs, needInput.trim()]);
      setNeedInput("");
    }
  };

  const removeNeed = (need: string) => {
    setNeeds(needs.filter(n => n !== need));
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Showcase Your Startup</CardTitle>
          <p className="text-muted-foreground">Share your venture with the community</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startup Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., TechFlow" 
                        {...field} 
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oneLiner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-liner *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Brief description in one sentence"
                        {...field} 
                        data-testid="input-one-liner"
                      />
                    </FormControl>
                    <FormDescription>
                      A compelling one-sentence pitch (max 300 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about your startup, the problem you're solving, and your vision..."
                        className="min-h-32"
                        {...field} 
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-stage">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stages.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Milestones (Optional)</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  Key achievements or progress made
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a milestone"
                    value={milestoneInput}
                    onChange={(e) => setMilestoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMilestone();
                      }
                    }}
                    data-testid="input-milestone"
                  />
                  <Button type="button" onClick={addMilestone} data-testid="button-add-milestone">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {milestones.map((milestone, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {milestone}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeMilestone(milestone)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <FormLabel>Current Needs (Optional)</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  What help or resources are you looking for?
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Technical Co-Founder, Funding"
                    value={needInput}
                    onChange={(e) => setNeedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNeed();
                      }
                    }}
                    data-testid="input-need"
                  />
                  <Button type="button" onClick={addNeed} data-testid="button-add-need">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {needs.map((need, idx) => (
                    <Badge key={idx} variant="outline" className="gap-1">
                      {need}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeNeed(need)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-sm">Startup Images</h3>
                
                <div>
                  <FormLabel>Logo Upload</FormLabel>
                  <FormDescription className="mb-2">
                    Upload your startup logo or provide a URL
                  </FormDescription>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    data-testid="input-logo-file"
                    className="mb-2"
                  />
                  {logoFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {logoFile.name}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground my-2">Or provide a URL:</p>
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/logo.png" 
                            {...field}
                            disabled={!!logoFile}
                            data-testid="input-logo-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Hero Image Upload</FormLabel>
                  <FormDescription className="mb-2">
                    Upload a hero image for your startup or provide a URL
                  </FormDescription>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHeroImageFile(e.target.files?.[0] || null)}
                    data-testid="input-hero-file"
                    className="mb-2"
                  />
                  {heroImageFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {heroImageFile.name}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground my-2">Or provide a URL:</p>
                  <FormField
                    control={form.control}
                    name="heroImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/hero.png" 
                            {...field}
                            disabled={!!heroImageFile}
                            data-testid="input-hero-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com" 
                          {...field} 
                          data-testid="input-website"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://linkedin.com/company/..." 
                          {...field} 
                          data-testid="input-linkedin"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://twitter.com/..." 
                          {...field} 
                          data-testid="input-twitter"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pitchDeckUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pitch Deck (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Link to your pitch deck" 
                          {...field} 
                          data-testid="input-pitch-deck"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/startups")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
