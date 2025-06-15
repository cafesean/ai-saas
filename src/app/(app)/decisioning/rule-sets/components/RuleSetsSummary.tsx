"use client";

import { memo } from "react";
import { Settings, CheckCircle, Archive, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RuleSetStatus } from "@/db/schema/rule_set";

interface RuleSet {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  inputSchema: any[] | null;
  outputSchema: any[] | null;
  version: number;
  status: string;
  publishedAt: Date | null;
  publishedBy: number | null;
  tenantId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RuleSetsSummaryProps {
  ruleSets: RuleSet[];
}

const RuleSetsSummary = ({ ruleSets }: RuleSetsSummaryProps) => {
  const totalRuleSets = ruleSets.length;
  const publishedRuleSets = ruleSets.filter(rs => rs.status === RuleSetStatus.PUBLISHED).length;
  const draftRuleSets = ruleSets.filter(rs => rs.status === RuleSetStatus.DRAFT).length;
  const deprecatedRuleSets = ruleSets.filter(rs => rs.status === RuleSetStatus.DEPRECATED).length;

  const summaryCards = [
    {
      title: "Total Rule Sets",
      value: totalRuleSets,
      icon: Settings,
      description: "All rule sets in the system",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Published",
      value: publishedRuleSets,
      icon: CheckCircle,
      description: "Active rule sets ready for use",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Draft",
      value: draftRuleSets,
      icon: Clock,
      description: "Rule sets in development",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Deprecated",
      value: deprecatedRuleSets,
      icon: Archive,
      description: "Retired rule sets",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default memo(RuleSetsSummary); 