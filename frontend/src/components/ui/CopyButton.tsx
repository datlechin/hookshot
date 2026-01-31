/**
 * CopyButton component for copying text to clipboard
 */

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './Button';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  'aria-label'?: string;
}

export function CopyButton({ text, label = 'Copy', className, 'aria-label': ariaLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={className}
      aria-label={ariaLabel || (label ? undefined : `Copy ${text}`)}
      title={ariaLabel || (label ? undefined : 'Copy to clipboard')}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  );
}
