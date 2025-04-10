import React, { useRef, useState, useEffect } from "react";

import { YOU_NAME } from "@/constants/general";

const Chat = ({
  query,
  setQuery,
  messages,
  handleSendMessage,
  isLoading = false,
  sessionId = "",
  handleNewSession,
}: {
  query: string;
  setQuery: (query: string) => void;
  messages: {
    replayer: string;
    text: string;
  }[];
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  sessionId?: string;
  handleNewSession: () => void;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    const container = messagesEndRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const doSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(e);
    scrollToBottom();
  };

  return (
    <div className="flex flex-col grow w-full h-full">
      <h2 className="p-4">
        <b>Debug & Preview</b>
      </h2>
      <div className="relative flex flex-col grow bg-white overflow-hidden">
        <div className="grow h-0 overflow-auto p-4" style={{ paddingBottom: "70px" }} ref={messagesEndRef}>
          <div className="grow w-full">
            <div className="relative h-full w-full">
              <div className="relative h-full">
                <div className="chat-messages mx-auto w-full max-w-full tablet:px-4">
                  {messages.map((msg, i) => {
                    if (msg.replayer === YOU_NAME) {
                      return (
                        <div
                          className="flex flex-row-reverse gap-3 py-4 text-gray-600 text-sm flex-1"
                          key={`message-${i}`}
                        >
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
              </div>
            </div>
          </div>
        </div>
        <div className="absolute left-0 bottom-0 right-0 px-4 pb-4 bg-chat-input-mask bg-white">
          <form className="flex items-center justify-center w-full space-x-2" onSubmit={doSubmit}>
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
    </div>
  );
};

export default Chat;
