// Create Project Gig form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProjectGigSchema, type InsertProjectGig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function ProjectGigCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<InsertProjectGig>({
    resolver: zodResolver(insertProjectGigSchema),
    defaultValues: {
      title: "",
      description: "",
      deliverables: "",
      requiredSkills: [],
      compensation: "",
      categoryTags: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertProjectGig) => {
      return await apiRequest("POST", "/api/project-gigs", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your project gig has been submitted for review!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/project-gigs"] });
      setLocation("/project-gigs");
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
        description: "Failed to create project gig. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProjectGig) => {
    mutation.mutate({ ...data, requiredSkills: skills, categoryTags: tags });
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Post a Project Gig</CardTitle>
          <p className="text-muted-foreground">Get help with your startup project</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Need Help with Market Research for EdTech Startup" 
                        {...field} 
                        data-testid="input-title"
                      />
                    </FormControl>
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
                        placeholder="Describe the project, what you need help with, and any context..."
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
                name="deliverables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deliverables *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What should be delivered at the end? (e.g., market analysis report, prototype design, data dashboard)"
                        className="min-h-24"
                        {...field} 
                        data-testid="input-deliverables"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Required Skills *</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    data-testid="input-skill"
                  />
                  <Button type="button" onClick={addSkill} data-testid="button-add-skill">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {skill}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <FormLabel>Category Tags *</FormLabel>
                <p className="text-sm text-muted-foreground mb-2">
                  e.g., Market Research, Data Analysis, Pricing Strategy
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    data-testid="input-tag"
                  />
                  <Button type="button" onClick={addTag} data-testid="button-add-tag">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="compensation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compensation *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., $500, Equity, Volunteer" 
                          {...field} 
                          data-testid="input-compensation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-deadline"
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
                  disabled={mutation.isPending || skills.length === 0 || tags.length === 0}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/project-gigs")}
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
