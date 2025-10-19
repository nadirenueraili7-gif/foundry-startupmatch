// Create/Edit Team Post form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTeamPostSchema, type InsertTeamPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

const categories = ["Engineering", "Design", "Marketing", "Business", "Product", "Sales", "Other"];
const timeCommitments = ["Full-time", "Part-time", "Flexible"];
const compensationTypes = ["Equity", "Paid", "Unpaid", "TBD"];

export default function TeamPostCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const form = useForm<InsertTeamPost>({
    resolver: zodResolver(insertTeamPostSchema),
    defaultValues: {
      title: "",
      description: "",
      skillsNeeded: [],
      timeCommitment: "Flexible",
      compensationType: "TBD",
      category: "Engineering",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTeamPost) => {
      return await apiRequest("POST", "/api/team-posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your team post has been submitted for review!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team-posts"] });
      setLocation("/team-posts");
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
        description: "Failed to create team post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTeamPost) => {
    mutation.mutate({ ...data, skillsNeeded: skills });
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

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Post a Team Need</CardTitle>
          <p className="text-muted-foreground">Find your perfect co-founder or team member</p>
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
                        placeholder="e.g., Looking for Technical Co-Founder for SaaS Startup" 
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
                        placeholder="Describe what you're looking for, your project, and what makes this opportunity exciting..."
                        className="min-h-32"
                        {...field} 
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Skills Needed *</FormLabel>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Python, Design)"
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
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Add at least one skill
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeCommitment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Commitment *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-time-commitment">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeCommitments.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compensationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compensation *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-compensation">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {compensationTypes.map(comp => (
                            <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending || skills.length === 0}
                  className="flex-1"
                  data-testid="button-submit"
                >
                  {mutation.isPending ? "Submitting..." : "Submit for Review"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/team-posts")}
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
