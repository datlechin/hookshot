import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface RequestSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * RequestSearch - Debounced search input
 * Delays onChange callback by 300ms to prevent excessive re-renders
 */
export function RequestSearch({
  value,
  onChange,
  placeholder = 'Search headers or body...',
}: RequestSearchProps) {
  const [input, setInput] = useState(value);

  // Sync external value changes
  useEffect(() => {
    setInput(value);
  }, [value]);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(input);
    }, 300);

    return () => clearTimeout(timeout);
  }, [input, onChange]);

  function handleClear() {
    setInput('');
    onChange('');
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] focus:border-transparent transition-shadow"
      />
      {input && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
