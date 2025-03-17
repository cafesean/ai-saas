import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import PreviewChat from "@/components/widgets/PreviewChat";
import { YOU_NAME, AI_LOADING_TEXT, AI_SASS_NAME } from "@/constants/general";

const Preview = ({ endpoint }: { endpoint: any }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (endpoint?.payload && !sessionId) {
      const payload = endpoint?.payload as any;
      if ("sessionId" in payload) {
        setSessionId(uuidv4());
      }
    }
  }, [endpoint, sessionId]);

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
    const AI_SASS_ENDPOINT_BASE_URL = process.env.NEXT_PUBLIC_AI_SASS_ENDPOINT_BASE_URL;
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
  return (
    <div className="flex grow flex-col bg-white h-full min-w-[400px]">
      <PreviewChat
        query={query}
        setQuery={setQuery}
        messages={messages}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        sessionId={sessionId}
        handleNewSession={handleNewSession}
      />
    </div>
  );
};

export default Preview;
