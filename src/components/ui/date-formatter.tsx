'use client';

import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

interface DateFormatterProps {
  date: Date | string;
  className?: string;
}

export const Relative_date = ({ date, className }: DateFormatterProps) => {
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    setFormattedDate(
      formatDistanceToNow(new Date(date), { addSuffix: true })
    );
  }, [date]);

  return (
    <span className={className}>
      {formattedDate || 'Just now'}
    </span>
  );
}; 