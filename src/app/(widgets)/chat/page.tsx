"use client";

import React, { useState, useLayoutEffect, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import { api } from "@/utils/trpc";

const YOU_NAME = "You";
const AI_SASS_NAME = "AI Sass";
const AI_LOADING_TEXT = "Loading...";

const ChatWidgetPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const code = searchParams.get("id");
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

  const scrollToBottom = () => {
    const container = messagesEndRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
          "x-ai-sass-client-id": `${endpoint?.clientId}`,
          "x-ai-sass-client-secret": `${endpoint?.clientSecret}`,
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
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (widget.error) {
    console.error("Widget query error:", widget.error);
    return (
      <div className="text-red-500">
        <h2 className="text-lg font-semibold mb-2">Error loading Widget.</h2>
        <p className="mb-2">{widget.error.message}</p>
        <div className="text-sm bg-red-50 p-4 rounded">
          {widget.error.data && JSON.stringify(widget.error.data.zodError, null, 2)}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 bottom-0 left-0 right-0 bg-white p-6">
      <div className="chat-messages overflow-y-auto" style={{ minWidth: "100%", height: "80%" }} ref={messagesEndRef}>
        {messages.map((msg, i) => {
          if (msg.replayer === "You") {
            return (
              <div className="flex flex-row-reverse gap-3 py-4 text-gray-600 text-sm flex-1" key={`message-${i}`}>
                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                  <div className="rounded-full bg-gray-100 border p-1">
                    <svg
                      stroke="none"
                      fill="black"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      height="20"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"></path>
                    </svg>
                  </div>
                </span>
                <p className="leading-relaxed">
                  <span className="block font-bold text-gray-700 text-right">{msg.replayer} </span>
                  {msg.text}
                </p>
              </div>
            );
          } else {
            return (
              <div className="flex gap-3 py-4 text-gray-600 text-sm flex-1" key={`message-${i}`}>
                <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                  <div className="rounded-full bg-gray-100 border p-1">
                    <svg
                      stroke="none"
                      fill="black"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      height="20"
                      width="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      ></path>
                    </svg>
                  </div>
                </span>
                <p className="leading-relaxed">
                  <span className="block font-bold text-gray-700">{msg.replayer} </span>
                  {msg.text}
                </p>
              </div>
            );
          }
        })}
      </div>
      <div className="flex items-center pt-0">
        <form className="flex items-center justify-center w-full space-x-2" onSubmit={handleSendMessage}>
          <input
            className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
            placeholder="Type your message"
            name="query"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2"
          >
            {isLoading ? "Stop" : "Send"}
          </button>
          {sessionId && (
            <button
              type="button"
              onClick={handleNewSession}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2"
            >
              New
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatWidgetPage;
