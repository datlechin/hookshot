import { useState, useRef, useEffect } from 'react';

interface EndpointNameEditorProps {
  endpointId?: string; // Unused but kept for future extensibility
  currentName?: string;
  defaultName: string;
  onSave: (name: string) => void;
}

export function EndpointNameEditor({ currentName, defaultName, onSave }: EndpointNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentName || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = currentName || defaultName;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleDoubleClick() {
    setIsEditing(true);
    setEditValue(currentName || '');
  }

  function handleSave() {
    const trimmed = editValue.trim();
    onSave(trimmed);
    setIsEditing(false);
  }

  function handleCancel() {
    setEditValue(currentName || '');
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={defaultName}
        className="w-full px-1 py-0.5 -mx-1 bg-(--background) border border-(--accent-blue) rounded text-sm font-medium text-(--text-primary) focus:outline-none"
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="text-sm font-medium text-(--text-primary) truncate cursor-text hover:bg-(--background) px-1 py-0.5 -mx-1 rounded transition-colors"
      title="Double-click to edit"
    >
      {displayName}
    </div>
  );
}
