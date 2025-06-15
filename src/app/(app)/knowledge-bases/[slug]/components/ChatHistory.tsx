import React from "react";
import { Route } from "next";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SampleButton } from "@/components/ui/sample-button";
import { getTimeAgo } from "@/utils/func";

const ChatHistory = ({
  slug,
  chatHistory,
}: {
  slug: string;
  chatHistory: {
    uuid: string;
    name: string;
    messageCount: number;
    lastUpdatedAt: string | Date;
  }[];
}) => {
  return (
    <div className="grid gap-4">
      {chatHistory.map((chat: any) => (
        <Card key={chat.uuid}>
          <CardHeader>
            <CardTitle>{chat.name}</CardTitle>
            <CardDescription>
              {chat.messageCount} messages • {getTimeAgo(chat.lastUpdatedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SampleButton asChild variant="link">
              {/* Use resolved kbId */}
              <Link href={`/knowledge-bases/${slug}/chat?c-id=${chat.uuid}` as Route}>
                View Chat
              </Link>
            </SampleButton>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ChatHistory;
