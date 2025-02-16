import React from 'react';

interface UseTableExportProps<T> {
  data: T[];
  columns: Array<keyof T>;
  filename?: string;
  getColumnHeader?: (column: keyof T) => string;
  getColumnValue?: (item: T, column: keyof T) => string;
}

export function useTableExport<T>({
  data,
  columns,
  filename = 'export',
  getColumnHeader = (column) => String(column),
  getColumnValue = (item, column) => String(item[column]),
}: UseTableExportProps<T>) {
  const exportToCSV = React.useCallback(() => {
    const headers = columns.map(getColumnHeader);
    const rows = data.map((item) =>
      columns.map((column) => getColumnValue(item, column))
    );

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [data, columns, filename, getColumnHeader, getColumnValue]);

  const exportToJSON = React.useCallback(() => {
    const jsonContent = data.map((item) =>
      columns.reduce((acc, column) => {
        acc[String(column)] = item[column];
        return acc;
      }, {} as Record<string, any>)
    );

    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [data, columns, filename]);

  return {
    exportToCSV,
    exportToJSON,
  };
} 