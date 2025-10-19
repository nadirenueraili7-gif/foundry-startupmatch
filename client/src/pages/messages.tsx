// Real-time messaging page
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { type Message, type User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

type Conversation = {
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
};

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch all messages
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  // Fetch all users for conversation list
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Group messages into conversations
  const conversations: Conversation[] = [];
  const userMap = new Map(users.map(u => [u.id, u]));

  messages.forEach(msg => {
    const otherUserId = msg.senderId === user?.id ? msg.receiverId : msg.senderId;
    if (!conversations.find(c => c.otherUser.id === otherUserId)) {
      const otherUser = userMap.get(otherUserId);
      if (otherUser) {
        const userMessages = messages.filter(
          m => (m.senderId === user?.id && m.receiverId === otherUserId) ||
               (m.senderId === otherUserId && m.receiverId === user?.id)
        );
        const lastMessage = userMessages[userMessages.length - 1];
        const unreadCount = userMessages.filter(
          m => m.receiverId === user?.id && !m.read
        ).length;
        
        conversations.push({
          otherUser,
          lastMessage,
          unreadCount,
        });
      }
    }
  });

  // Sort conversations by last message time
  conversations.sort((a, b) => {
    const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  // Get current conversation messages
  const currentMessages = selectedUserId
    ? messages.filter(
        m => (m.senderId === user?.id && m.receiverId === selectedUserId) ||
             (m.senderId === selectedUserId && m.receiverId === user?.id)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  const selectedUser = userMap.get(selectedUserId || "");

  // WebSocket connection for real-time messaging
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "new_message") {
        queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      }
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [queryClient]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedUserId) return;
      return await apiRequest("POST", "/api/messages", {
        receiverId: selectedUserId,
        content,
      });
    },
    onMutate: async (content: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/messages"] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<Message[]>(["/api/messages"]);

      // Optimistically update to show new message immediately
      if (selectedUserId && user) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          senderId: user.id,
          receiverId: selectedUserId,
          content,
          read: false,
          createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData<Message[]>(
          ["/api/messages"],
          (old = []) => [...old, optimisticMessage]
        );
      }

      return { previousMessages };
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      
      // Send WebSocket notification
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "new_message" }));
      }
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(["/api/messages"], context.previousMessages);
      }

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
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (messageInput.trim() && selectedUserId) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              {conversations.length > 0 ? (
                conversations.map(conv => (
                  <div
                    key={conv.otherUser.id}
                    onClick={() => setSelectedUserId(conv.otherUser.id)}
                    className={`p-4 hover-elevate active-elevate-2 cursor-pointer border-b ${
                      selectedUserId === conv.otherUser.id ? "bg-muted" : ""
                    }`}
                    data-testid={`conversation-${conv.otherUser.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={conv.otherUser.profileImageUrl || ""} />
                        <AvatarFallback>
                          {conv.otherUser.firstName?.[0]}{conv.otherUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate">
                            {conv.otherUser.firstName} {conv.otherUser.lastName}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>No conversations yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat View */}
        <Card className="lg:col-span-2">
          {selectedUser ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedUser.profileImageUrl || ""} />
                    <AvatarFallback>
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedUser.firstName} {selectedUser.lastName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedUser.university}</p>
                  </div>
                </div>
              </CardHeader>
              
              <ScrollArea className="h-[calc(100vh-450px)] p-4">
                <div className="space-y-4">
                  {currentMessages.map(msg => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        data-testid={`message-${msg.id}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <CardContent className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    data-testid="button-send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full text-center">
              <div>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
