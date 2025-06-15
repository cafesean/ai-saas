"use client";

import type React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
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
import { toast } from "sonner";
import axios from "axios";

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
} from "@/components/ui/sample-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { AppRoutes } from "@/constants/routes";
import { api, useUtils } from "@/utils/trpc";
import { Badge } from "@/components/ui/badge";
import { KNOWLEDGE_BASE_API } from "@/constants/api";
import FullScreenLoading from "@/components/ui/FullScreenLoading";

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
  id: "",
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

export default function KnowledgeBaseChatPage() {
  const searchParams = useSearchParams();
  const cid = searchParams.get("c-id");
  const params = useParams();
  const slug = params.slug as string;
  const utils = useUtils();
  const {
    data: knowledgeBaseItem,
    isLoading: isLoadingKnowledgeBase,
    error,
  } = api.knowledgeBases.getKnowledgeBaseById.useQuery({
    uuid: slug,
  });
  const createConversation =
    api.knowledgeBases.createConversation.useMutation();
  const createConversationMessage =
    api.knowledgeBases.createConversationMessage.useMutation();
  const {
    data: conversationData,
    isLoading: isLoadingConversation,
  }: {
    data: any;
    isLoading: boolean;
  } = api.knowledgeBases.getConversationById.useQuery(
    {
      uuid: cid || "",
    },
    {
      enabled: !!cid,
    },
  );
  const updateConversation =
    api.knowledgeBases.updateConversationById.useMutation({
      onSuccess: () => {
        utils.knowledgeBases.getKnowledgeBaseById.invalidate({ uuid: slug });
        toast.success("Conversation updated successfully");
      },
      onError: (error) => {
        toast.error("Failed to update conversation");
      },
    });
  const [conversation, setConversation] = useState(initialConversation);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [temperature, setTemperature] = useState("0.7");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState("New Conversation");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set conversation ID if not already set
  useEffect(() => {
    if (cid) {
      setConversation((prev) => ({
        ...prev,
        id: cid,
      }));
    }
  }, [cid]);

  // Fetch conversation data if conversation ID is set
  useEffect(() => {
    if (!isLoadingConversation && conversationData) {
      setConversation((prev) => ({
        ...prev,
        messages: conversationData.messages.map((message: any) => ({
          id: message.uuid,
          role: message.role,
          content: message.content,
          timestamp: message.createdAt,
          sources: [],
        })),
        title: conversationData.name,
        id: conversationData.uuid,
      }));
    }
  }, [isLoadingConversation, conversationData]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation.messages]);

  const handleSendMessage = async () => {
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

    // If conversation ID is not set, create a new conversation
    let newConversation: any;
    if (!conversation.id) {
      newConversation = await createConversation.mutateAsync({
        name: chatTitle,
        kbId: knowledgeBaseItem?.uuid || "",
      });
      if (newConversation && newConversation.uuid) {
        setConversation((prev) => ({
          ...prev,
          id: newConversation?.uuid || "",
        }));
      }
    }

    // Add user message to conversation
    if (conversation.id || (newConversation && newConversation.uuid)) {
      await createConversationMessage.mutateAsync({
        conversationId: conversation.id || newConversation.uuid,
        content: inputMessage,
        role: "user",
      });
    }

    setInputMessage("");
    setIsLoading(true);

    try {
      const payload = {
        query: inputMessage,
        kbId: knowledgeBaseItem?.uuid,
        userId: process.env.NEXT_PUBLIC_MOCK_USER_ID,
        conversationId: newConversation
          ? newConversation?.uuid
          : conversation.id,
        role: "assistant",
        stream: true,
      };
      if (payload.stream) {
        const askQuery = await fetch(`${KNOWLEDGE_BASE_API.chat}`, {
          method: `POST`,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            ...payload,
          }),
        });
        const reader = askQuery.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          setIsLoading(false);
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            setConversation((prev: any) => {
              let lastMessage = prev.messages[prev.messages.length - 1];
              let otherMessages = prev.messages;
              if (lastMessage.role === "assistant") {
                lastMessage = {
                  id: `msg-${Date.now()}`,
                  role: "assistant",
                  content: lastMessage.content + chunk,
                  timestamp: new Date().toISOString(),
                  sources: [],
                };
                otherMessages = prev.messages.slice(
                  0,
                  prev.messages.length - 1,
                );
              } else {
                lastMessage = {
                  id: `msg-${Date.now()}`,
                  role: "assistant",
                  content: `${chunk}`,
                  timestamp: new Date().toISOString(),
                  sources: [],
                };
              }
              return {
                ...prev,
                messages: [...otherMessages, lastMessage],
              };
            });
          }
        }
      } else {
        const askQuery = await axios.post(KNOWLEDGE_BASE_API.chat, payload, {
          withCredentials: true,
        });
        if (askQuery.data.success) {
          const aiResponse = {
            id: `msg-${Date.now() + 1}`,
            role: "assistant",
            content: askQuery.data.data.text,
            timestamp: new Date().toISOString(),
            sources: [],
          };
          setConversation((prev) => ({
            ...prev,
            messages: [...prev.messages, aiResponse],
          }));
          setIsLoading(false);
        }
      }
    } catch (error) {
      toast.error("Ask query failed.");
      setIsLoading(false);
    }

    // Simulate AI response
    // setTimeout(() => {
    //   const aiResponse = {
    //     id: `msg-${Date.now() + 1}`,
    //     role: "assistant",
    //     content:
    //       "Based on the Saudi banking regulations, microfinance institutions must maintain a capital adequacy ratio of at least 12% as mandated by the Saudi Central Bank. Additionally, for microfinance loans, the loan-to-value ratio should not exceed 70% for unsecured loans and 85% for secured loans with appropriate collateral. All lenders must also adhere to the consumer protection guidelines outlined in the Financial Consumer Protection Principles document issued in March 2023.",
    //     timestamp: new Date().toISOString(),
    //     sources: potentialSources,
    //   };

    //   setConversation((prev) => ({
    //     ...prev,
    //     messages: [...prev.messages, aiResponse],
    //   }));

    //   setIsLoading(false);

    //   // If this is the first message, suggest a title
    //   if (conversation.messages.length === 0) {
    //     setChatTitle("Inquiry about microfinance regulations");
    //   }
    // }, 2000);
  };

  const handleSaveConversation = async () => {
    // In a real app, save the conversation
    setIsSaveDialogOpen(false);
    try {
      if (!conversation.id) {
        const newConversation = await createConversation.mutateAsync({
          name: chatTitle,
          kbId: knowledgeBaseItem?.uuid || "",
        });
        if (newConversation && newConversation.uuid) {
          setConversation((prev) => ({
            ...prev,
            id: newConversation?.uuid || "",
          }));
        }
      } else {
        await updateConversation.mutateAsync({
          uuid: conversation.id,
          name: chatTitle,
        });
      }
    } catch (error) {
      toast.error("Failed to save conversation");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex w-full flex-col bg-background">
      <Breadcrumbs
        items={[
          {
            label: "Back to Knowledge Base",
            link: AppRoutes.knowledgebaseDetail.replace(":uuid", slug),
          },
        ]}
        title={knowledgeBaseItem?.name}
        badge={
          <Badge variant="outline" className="text-xs font-normal">
            {knowledgeBase.embeddingModel.split("-").pop()}
          </Badge>
        }
        rightChildren={
          <>
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
                  {conversation.id ? "Edit" : "Save"} Conversation
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
          </>
        }
      />
      <div className="flex flex-1">
        <div className="flex flex-1 flex-col relative">
          {/* Messages area */}
          <div className="overflow-auto p-4 h-[80vh]">
            <div className="mx-auto max-w-3xl space-y-6 pb-28">
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
                          <div
                            className={
                              message.role === "assistant"
                                ? "text-black"
                                : "text-white"
                            }
                          >
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
          <div className="border-t bg-background px-4 py-3 absolute left-0 right-0 bottom-0 w-full">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
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
                <div className="absolute top-1 right-1">
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
            <DialogTitle>
              {conversation.id ? "Edit" : "Save"} Conversation
            </DialogTitle>
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
      {updateConversation.isPending && <FullScreenLoading />}
    </div>
  );
}
