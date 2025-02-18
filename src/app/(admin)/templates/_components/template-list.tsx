'use client';

import { useState, useMemo } from 'react';
import { api } from '@/utils/trpc';
import type { Template } from '@/db/schema/n8n';
import { Button } from '@/components/form/Button';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { DataTable } from '@/components/ui/table/DataTable';
import { useTableColumns } from '@/framework/hooks/useTableColumn';
import { Relative_date } from '@/components/ui/date-formatter';

export const TemplateList = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { data: templates, isLoading } = api.n8n.listTemplates.useQuery();

  const columns = useTableColumns<Template>({
    columns: [
      {
        key: 'templateId',
        header: 'Template ID',
        cell: ({ getValue }) => {
          const templateId = getValue() as string;
          return (
            <button
              onClick={() => {
                const template = templates?.find((t: Template) => t.templateId === templateId);
                if (template) setSelectedTemplate(template);
              }}
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors w-full text-left"
            >
              {templateId}
            </button>
          );
        },
      },
      {
        key: 'versionId',
        header: 'Version',
        cell: ({ getValue }) => {
          const versionId = getValue() as string;
          return (
            <span className="text-xs text-gray-600">
              {versionId}
            </span>
          );
        },
      },
      {
        key: 'created_at',
        header: 'Created',
        cell: ({ getValue }) => {
          const date = getValue() as Date;
          return (
            <Relative_date
              date={date}
              className="text-xs text-gray-600"
            />
          );
        },
      },
    ],
  });

  if (isLoading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">Workflow Templates</h2>
            <p className="text-sm text-muted-foreground">
              List of all n8n workflow templates with their configurations
            </p>
          </CardHeader>
          <CardContent>
            <DataTable
              data={templates ?? []}
              columns={columns}
              searchPlaceholder="Search templates..."
              searchableColumns={['templateId', 'versionId']}
              enableSearch={true}
              enableFilters={true}
              filename="workflow-templates"
              className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
            />
          </CardContent>
        </Card>
      </div>

      <div>
        {selectedTemplate && (
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold">Template Details</h2>
              <p className="text-sm text-muted-foreground">
                Configuration and user inputs for the selected template
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">User Inputs</h4>
                <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(selectedTemplate.userInputs, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}; 