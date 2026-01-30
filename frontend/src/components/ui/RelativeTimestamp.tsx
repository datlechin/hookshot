import { useState, useEffect } from 'react';

interface RelativeTimestampProps {
  date: string;
}

/**
 * RelativeTimestamp - Displays relative time (e.g., "2m ago")
 * Auto-updates every 60 seconds
 */
export function RelativeTimestamp({ date }: RelativeTimestampProps) {
  const [relative, setRelative] = useState('');

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const then = new Date(date);
      const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

      if (diff < 60) {
        setRelative(`${diff}s ago`);
      } else if (diff < 3600) {
        setRelative(`${Math.floor(diff / 60)}m ago`);
      } else if (diff < 86400) {
        setRelative(`${Math.floor(diff / 3600)}h ago`);
      } else {
        setRelative(`${Math.floor(diff / 86400)}d ago`);
      }
    }

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return <span title={date}>{relative}</span>;
}
