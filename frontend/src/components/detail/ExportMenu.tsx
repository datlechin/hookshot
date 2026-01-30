/**
 * ExportMenu component - dropdown menu for exporting request data
 */

import { useState, useRef, useEffect } from 'react';
import { WebhookRequest } from '@/lib/types';
import { exportAsJSON, exportAsCurl, exportAsHTTPRaw } from '@/lib/export';
import { Download, FileJson, Terminal, FileText } from 'lucide-react';

interface ExportMenuProps {
  request: WebhookRequest;
}

export function ExportMenu({ request }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExport = async (format: 'json' | 'curl' | 'http') => {
    switch (format) {
      case 'json':
        exportAsJSON(request);
        break;
      case 'curl': {
        const curlCommand = exportAsCurl(request);
        await navigator.clipboard.writeText(curlCommand);
        // Could add a toast notification here
        break;
      }
      case 'http': {
        const httpRaw = exportAsHTTPRaw(request);
        await navigator.clipboard.writeText(httpRaw);
        // Could add a toast notification here
        break;
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--background)] border border-[var(--border)] rounded hover:bg-[var(--surface)] transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors"
            >
              <FileJson className="w-4 h-4 text-[var(--text-secondary)]" />
              <div className="flex-1 text-left">
                <div className="font-medium">Export as JSON</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Download complete request
                </div>
              </div>
            </button>

            <button
              onClick={() => handleExport('curl')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors"
            >
              <Terminal className="w-4 h-4 text-[var(--text-secondary)]" />
              <div className="flex-1 text-left">
                <div className="font-medium">Copy as cURL</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Generate curl command
                </div>
              </div>
            </button>

            <button
              onClick={() => handleExport('http')}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors"
            >
              <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
              <div className="flex-1 text-left">
                <div className="font-medium">Copy as HTTP Raw</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Raw HTTP request format
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
