'use client';

import { useState, useMemo } from 'react';
import { api } from '@/utils/trpc';
import type { NodeType } from '@/db/schema/n8n';
import { Button } from '@/components/form/Button';
import { Card, CardContent, CardHeader } from '@/components/Card';
import { DataTable } from '@/components/ui/table/DataTable';
import { useTableColumns } from '@/framework/hooks/useTableColumn';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/Badge';
import { formatDistanceToNow } from 'date-fns';
import { Relative_date } from '@/components/ui/date-formatter';

type NodeTypeFormData = {
  type: string;
  category: string;
  description?: string;
};

export const NodeTypeList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<NodeTypeFormData>({
    type: '',
    category: '',
    description: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const utils = api.useUtils();
  const { data: nodeTypes, isLoading } = api.n8n.listNodeTypes.useQuery();
  
  const createNodeType = api.n8n.createNodeType.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setFormData({ type: '', category: '', description: '' });
      void utils.n8n.listNodeTypes.invalidate();
    },
  });

  const updateNodeType = api.n8n.updateNodeType.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setFormData({ type: '', category: '', description: '' });
      setEditingId(null);
      void utils.n8n.listNodeTypes.invalidate();
    },
  });

  const deleteNodeType = api.n8n.deleteNodeType.useMutation({
    onSuccess: () => {
      void utils.n8n.listNodeTypes.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId) {
      updateNodeType.mutate({ id: editingId, ...formData });
    } else {
      createNodeType.mutate(formData);
    }
  };

  const handleEdit = (nodeType: NodeType) => {
    setFormData({
      type: nodeType.type,
      category: nodeType.category,
      description: nodeType.description ?? '',
    });
    setEditingId(nodeType.id);
    setIsOpen(true);
  };

  const columns = useTableColumns<NodeType>({
    columns: [
      {
        key: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return (
            <span className="font-mono text-sm">
              {type}
            </span>
          );
        },
      },
      {
        key: 'category',
        header: 'Category',
        cell: ({ getValue }) => {
          const category = getValue() as string;
          return <Badge>{category}</Badge>;
        },
      },
      {
        key: 'created_at',
        header: 'Created',
        cell: ({ getValue }) => {
          const date = getValue() as Date;
          return (
            <span className="text-xs text-gray-600">
              {formatDistanceToNow(new Date(date), { addSuffix: true })}
            </span>
          );
        },
      },
      {
        key: 'id',
        header: '',
        cell: ({ getValue }) => {
          const id = getValue() as string;
          const nodeType = nodeTypes?.find(nt => nt.id === id);
          if (!nodeType) return null;
          return (
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => handleEdit(nodeType)}
                variant="secondary"
                className="modal-button"
              >
                Edit
              </Button>
              <Button
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to delete this node type?'
                    )
                  ) {
                    deleteNodeType.mutate(nodeType.id);
                  }
                }}
                variant="danger"
                className="modal-button"
              >
                Delete
              </Button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
  });

  if (isLoading) {
    return <div>Loading node types...</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Node Types</h2>
            <p className="text-sm text-muted-foreground">
              Configure which node types require user input and their categories
            </p>
          </div>
          <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <Button onClick={() => setIsOpen(true)}>Add Node Type</Button>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium">Node Type</label>
                <input
                  id="type"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  placeholder="@n8n/n8n-nodes-langchain.documentDefaultDataLoader"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <input
                  id="category"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  placeholder="Document"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <input
                  id="description"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DataTable
            data={nodeTypes ?? []}
            columns={columns}
            searchPlaceholder="Search node types..."
            searchableColumns={['type', 'category']}
            enableSearch={true}
            enableFilters={true}
            filename="node-types"
            className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200"
          />
        </CardContent>
      </Card>
    </div>
  );
}; 