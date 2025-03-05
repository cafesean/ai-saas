"use client";

import React from "react";

export default function Home() {
  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">Chat Demo</h1>
      <div className="flex justify-center items-center">
        <div
          id="first-chat-widget"
          className="w-[500px] bg-white rounded-lg h-[250px]"
          dangerouslySetInnerHTML={{
            __html:
              '',
          }}
        ></div>
      </div>
    </div>
  );
}
