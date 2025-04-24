"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Loader2,
  Trash2,
  Download,
  SquarePen,
  User,
  Bot,
} from "lucide-react";
import { SampleButton } from "@/components/ui/sample-button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Knowledge base data
const knowledgeBase = {
  id: "kb-1",
  name: "Banking Regulations",
  description: "Saudi Arabia banking regulations and compliance documentation",
  embeddingModel: "text-embedding-3-small",
};

// Initial conversation state
const initialConversation: {
  id: string;
  title: string;
  messages: any[];
} = {
  id: "new-chat",
  title: "New Conversation",
  messages: [],
};

// Sample potential sources
const potentialSources = [
  {
    id: "source-1",
    title: "Saudi Banking Compliance 2023",
    content:
      "Chapter 4, Section 2.1: All microfinance institutions must maintain a capital adequacy ratio of at least 12% as mandated by Saudi Central Bank regulations.",
    relevance: 0.92,
  },
  {
    id: "source-2",
    title: "Regulatory Framework Overview",
    content:
      "Microfinance lenders operating in Saudi Arabia must adhere to the consumer protection guidelines outlined in the Financial Consumer Protection Principles document issued in March 2023.",
    relevance: 0.87,
  },
  {
    id: "source-3",
    title: "Microfinance Guidelines",
    content:
      "The loan-to-value ratio for microfinance loans should not exceed 70% for unsecured loans and 85% for secured loans with appropriate collateral as specified in the latest guidelines.",
    relevance: 0.81,
  },
];

export default function KnowledgeBaseChatPage({
  params,
}: {
  params: { id: string };
}) {
  const [conversation, setConversation] = useState(initialConversation);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [temperature, setTemperature] = useState("0.7");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState("New Conversation");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation.messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message to conversation
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setConversation((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }));

    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content:
          "Based on the Saudi banking regulations, microfinance institutions must maintain a capital adequacy ratio of at least 12% as mandated by the Saudi Central Bank. Additionally, for microfinance loans, the loan-to-value ratio should not exceed 70% for unsecured loans and 85% for secured loans with appropriate collateral. All lenders must also adhere to the consumer protection guidelines outlined in the Financial Consumer Protection Principles document issued in March 2023.",
        timestamp: new Date().toISOString(),
        sources: potentialSources,
      };

      setConversation((prev) => ({
        ...prev,
        messages: [...prev.messages, aiResponse],
      }));

      setIsLoading(false);

      // If this is the first message, suggest a title
      if (conversation.messages.length === 0) {
        setChatTitle("Inquiry about microfinance regulations");
      }
    }, 2000);
  };

  const handleSaveConversation = () => {
    // In a real app, save the conversation
    setIsSaveDialogOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link
          href={`/knowledge-bases/${params.id}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Knowledge Base</span>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">
            Chat with: {knowledgeBase.name}
          </h1>
          <Badge variant="outline" className="text-xs font-normal">
            {knowledgeBase.embeddingModel.split("-").pop()}
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SampleButton variant="outline" size="sm">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Actions
              </SampleButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsSaveDialogOpen(true)}>
                <SquarePen className="mr-2 h-4 w-4" />
                Save Conversation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Chat
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-auto p-4">
            <div className="mx-auto max-w-3xl space-y-6 pb-20">
              {conversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full py-16">
                  <div className="text-center space-y-3">
                    <Bot className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">
                      Chat with the Knowledge Base
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Ask questions about {knowledgeBase.name}. The AI will
                      provide answers based on the available documents.
                    </p>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Try asking questions like:</p>
                      <ul className="space-y-1">
                        <li>
                          "What are the capital requirements for microfinance
                          institutions?"
                        </li>
                        <li>
                          "What consumer protection guidelines must be
                          followed?"
                        </li>
                        <li>
                          "Explain loan-to-value ratio limits for unsecured
                          loans"
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {conversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-4 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 mt-1 bg-primary/10">
                          <AvatarFallback className="text-primary text-xs">
                            AI
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`space-y-2 overflow-hidden rounded-lg px-4 py-3 max-w-[calc(100%-80px)] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground mr-1"
                            : "bg-muted"
                        }`}
                      >
                        <div className="prose dark:prose-invert text-sm break-words">
                          {message.content}
                        </div>

                        {message.role === "assistant" && message.sources && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <SampleButton
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => setShowSources(!showSources)}
                            >
                              {showSources ? "Hide" : "Show"}{" "}
                              {message.sources.length} sources
                            </SampleButton>

                            {showSources && (
                              <div className="mt-2 space-y-2">
                                {message.sources.map((source: any) => (
                                  <div
                                    key={source.id}
                                    className="rounded-md border p-2 text-xs"
                                  >
                                    <div className="font-medium mb-1">
                                      {source.title}
                                    </div>
                                    <p className="text-muted-foreground">
                                      "{source.content}"
                                    </p>
                                    <div className="mt-1 text-xs text-right">
                                      Relevance: {source.relevance}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs">
                          <div className="text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </div>

                          {message.role === "assistant" && (
                            <>
                              <div className="flex items-center gap-1">
                                <SampleButton
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </SampleButton>
                                <SampleButton
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <ThumbsUp className="h-3.5 w-3.5" />
                                </SampleButton>
                                <SampleButton
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <ThumbsDown className="h-3.5 w-3.5" />
                                </SampleButton>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 mt-1 bg-primary">
                          <AvatarFallback className="text-primary-foreground text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-start gap-4">
                      <Avatar className="h-8 w-8 mt-1 bg-primary/10">
                        <AvatarFallback className="text-primary text-xs">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2 overflow-hidden rounded-lg px-4 py-3 bg-muted animate-pulse">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="border-t bg-background px-4 py-3">
            <div className="mx-auto flex max-w-3xl items-end gap-3">
              <SampleButton variant="outline" size="icon" className="shrink-0">
                <Paperclip className="h-4 w-4" />
              </SampleButton>

              <div className="relative flex-1">
                <Textarea
                  placeholder={`Ask about ${knowledgeBase.name}...`}
                  className="min-h-12 resize-none pr-12 py-3"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <div className="absolute right-3 top-3">
                  <SampleButton
                    size="icon"
                    type="submit"
                    disabled={inputMessage.trim() === "" || isLoading}
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </SampleButton>
                </div>
              </div>

              <div className="flex">
                <Select value={temperature} onValueChange={setTemperature}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Temperature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Precise (0.0)</SelectItem>
                    <SelectItem value="0.3">Balanced (0.3)</SelectItem>
                    <SelectItem value="0.7">Creative (0.7)</SelectItem>
                    <SelectItem value="1">Very Creative (1.0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Conversation</DialogTitle>
            <DialogDescription>
              Save this conversation for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="chat-title">Conversation Title</Label>
              <Input
                id="chat-title"
                value={chatTitle}
                onChange={(e) => setChatTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <SampleButton
              variant="outline"
              onClick={() => setIsSaveDialogOpen(false)}
            >
              Cancel
            </SampleButton>
            <SampleButton onClick={handleSaveConversation}>Save</SampleButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
