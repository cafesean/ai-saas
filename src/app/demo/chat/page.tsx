"use client";

import React from "react";
import Script from "next/script";

export default function Home() {
  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Chat Demo</h1>
      <Script>
        {`
         window.aiSAASChatbotConfig = {
          code: '879aebfe-4086-41f0-b7a7-944215630e6b',
          dynamicScript: true
        } `}
      </Script>
      <Script src="http://localhost:3000/embed.min.js" id="879aebfe-4086-41f0-b7a7-944215630e6b" defer />
      <style jsx>{`
        #ai-saas-chatbot-bubble-button {
          background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1)) !important;
        }
        #ai-saas-chatbot-bubble-window {
          width: 24rem !important;
          height: 40rem !important;
        }
      `}</style>
      <div className="flex justify-center items-center">
        <div id="first-chat-widget" className="w-[500px] bg-white rounded-lg h-[250px]">
          <iframe
            src="http://localhost:3000/chat/879aebfe-4086-41f0-b7a7-944215630e6b"
            style={{
              width: "100%",
              height: "100%",
              minHeight: "300px",
            }}
            frameBorder="0"
            allow="microphone"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
