// User profile page
import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { type User, updateUserProfileSchema, type UpdateUserProfile } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, MessageSquare, Mail, Building2, GraduationCap, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isUnauthorizedError } from "@/lib/authUtils";

const experienceLevels = ["Beginner", "Intermediate", "Advanced"];

export default function Profile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");

  const { data: profileUser, isLoading } = useQuery<User>({
    queryKey: ["/api/users", id],
  });

  const isOwnProfile = currentUser?.id === id;

  const form = useForm<UpdateUserProfile>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      university: "",
      major: "",
      experienceLevel: "Beginner",
      bio: "",
      lookingFor: "",
    },
  });

  useEffect(() => {
    if (profileUser && isOwnProfile) {
      form.reset({
        university: profileUser.university || "",
        major: profileUser.major || "",
        experienceLevel: profileUser.experienceLevel || "Beginner",
        bio: profileUser.bio || "",
        lookingFor: profileUser.lookingFor || "",
      });
      setSkills(profileUser.skills || []);
      setInterests(profileUser.interests || []);
    }
  }, [profileUser, isOwnProfile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateUserProfile & { skills: string[], interests: string[] }) => {
      return await apiRequest("PATCH", `/api/users/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
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
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateUserProfile) => {
    updateProfileMutation.mutate({ ...data, skills, interests });
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

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card className="animate-pulse">
          <div className="h-64 bg-muted" />
        </Card>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">User not found</h2>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileUser.profileImageUrl || ""} />
                <AvatarFallback className="text-2xl">
                  {profileUser.firstName?.[0]}{profileUser.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl">
                  {profileUser.firstName} {profileUser.lastName}
                </CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                  <Mail className="h-4 w-4" />
                  <span data-testid="text-email">{profileUser.email}</span>
                </div>
              </div>
            </div>
            {isOwnProfile ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-profile"
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            ) : (
              <Link href={`/messages?user=${profileUser.id}`}>
                <Button data-testid="button-message-user">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-university" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Major</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-major" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-experience">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-24" data-testid="input-bio" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Skills</FormLabel>
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
                  <FormLabel>Interests</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add an interest"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInterest();
                        }
                      }}
                      data-testid="input-interest"
                    />
                    <Button type="button" onClick={addInterest} data-testid="button-add-interest">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {interests.map((interest, idx) => (
                      <Badge key={idx} variant="outline" className="gap-1">
                        {interest}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="lookingFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What I'm Looking For</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-24" data-testid="input-looking-for" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              {profileUser.university && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span data-testid="text-university">{profileUser.university}</span>
                </div>
              )}
              
              {profileUser.major && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span data-testid="text-major">{profileUser.major}</span>
                  {profileUser.experienceLevel && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary">{profileUser.experienceLevel}</Badge>
                    </>
                  )}
                </div>
              )}

              {profileUser.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground" data-testid="text-bio">{profileUser.bio}</p>
                </div>
              )}

              {profileUser.skills && profileUser.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {profileUser.interests && profileUser.interests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.interests.map((interest, idx) => (
                      <Badge key={idx} variant="outline">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {profileUser.lookingFor && (
                <div>
                  <h3 className="font-semibold mb-2">Looking For</h3>
                  <p className="text-muted-foreground" data-testid="text-looking-for">{profileUser.lookingFor}</p>
                </div>
              )}

              {!profileUser.bio && !profileUser.skills?.length && !profileUser.interests?.length && isOwnProfile && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">Your profile is incomplete</p>
                  <Button onClick={() => setIsEditing(true)}>
                    Complete Profile
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
