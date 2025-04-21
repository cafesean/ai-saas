"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { api } from "@/utils/trpc";
import Chat from "@/components/widgets/Chat";
import { YOU_NAME, AI_LOADING_TEXT, AI_SASS_NAME } from "@/constants/general";

const ChatWidgetPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const params = useParams();
  const code = params.slug as string;
  const widget = api.widget.getActiveWidgetByCode.useQuery(code as string);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (widget.data?.workflow.endpoint?.payload && !sessionId) {
      const payload = widget.data?.workflow.endpoint?.payload as any;
      if ("sessionId" in payload) {
        setSessionId(uuidv4());
      }
    }
  }, [widget.data, sessionId]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim() === "") {
      toast.error("Please enter a message");
      return;
    }
    setIsLoading(true);
    const input = query;
    // Add query in messages
    setMessages((prev: any) => [
      ...prev,
      { replayer: YOU_NAME, text: query },
      { replayer: AI_SASS_NAME, text: AI_LOADING_TEXT },
    ]);
    setQuery("");
    const AI_SASS_ENDPOINT_BASE_URL = process.env.NEXT_PUBLIC_AI_SAAS_ENDPOINT_BASE_URL;
    const endpoint = widget.data?.workflow.endpoint;
    let payload = endpoint?.payload as any;
    try {
      // Check if have sessionId in payload
      if (sessionId) {
        payload = {
          ...payload,
          sessionId,
        };
      }
      const response = await fetch(`${AI_SASS_ENDPOINT_BASE_URL}${endpoint?.uri}`, {
        method: `${endpoint?.method}`,
        headers: {
          "Content-Type": "application/json",
          "x-ai-saas-client-id": `${endpoint?.clientId}`,
          "x-ai-saas-client-secret": `${endpoint?.clientSecret}`,
        },
        body: JSON.stringify({
          ...payload,
          query: input,
          stream: true,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev: any) => {
            let lastMessage = prev[prev.length - 1];
            lastMessage = {
              replayer: AI_SASS_NAME,
              text: lastMessage.text === AI_LOADING_TEXT ? `${chunk}` : `${lastMessage.text}${chunk}`,
            };
            const otherMessages = prev.slice(0, prev.length - 1);
            return [...otherMessages, lastMessage];
          });
        }
      }
    } catch (error) {
      console.error("Error fetching stream:", error);
      // setResponseText("Error: Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    setSessionId(uuidv4());
    setMessages([]);
  };

  if (widget.isLoading) {
    return (
      <div className="flex flex-col grow min-w-[300px] h-full">
        <div>
          <div className="flex bg-white overflow-hidden">
            <div className="h-[100vh] grow flex flex-col overflow-y-auto">
              <div className="relative h-full pt-8 mx-auto w-full max-w-[720px]">
                <div className="relative h-full px-4">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (widget.error) {
    console.error("Widget query error:", widget.error);
    return (
      <div className="flex flex-col grow min-w-[300px] h-full">
        <div>
          <div className="flex bg-white overflow-hidden">
            <div className="h-[100vh] grow flex flex-col overflow-y-auto">
              <div className="relative h-full pt-8 mx-auto w-full max-w-[720px]">
                <div className="relative h-full px-4">
                  <div className="text-red-500">
                    <h2 className="text-lg font-semibold mb-2">Error loading Widget.</h2>
                    <p className="mb-2">{widget.error.message}</p>
                    <div className="text-sm bg-red-50 p-4 rounded">
                      {widget.error.data && JSON.stringify(widget.error.data.zodError, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Chat
      query={query}
      setQuery={setQuery}
      messages={messages}
      handleSendMessage={handleSendMessage}
      isLoading={isLoading}
      sessionId={sessionId}
      handleNewSession={handleNewSession}
    />
  );
};

export default ChatWidgetPage;
