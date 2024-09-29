import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

// Context for the select component
const SelectContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  value: string;
  onChange: (value: string) => void;
} | null>(null);

export const Select = ({ children, value, onChange }: { children: React.ReactNode, value: string, onChange: (value: string) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ open, setOpen, value, onChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within a Select');

  return (
    <button
      className="flex justify-between items-center w-full px-4 py-2 text-sm border rounded-md"
      onClick={() => context.setOpen(!context.open)}
    >
      {children}
      <span className="ml-2">▼</span>
    </button>
  );
};

export const SelectValue = ({ placeholder }: { placeholder: string }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within a Select');

  return <span>{context.value || placeholder}</span>;
};

export const SelectContent = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within a Select');

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        context.setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [context]);

  if (!context.open) return null;

  return (
    <div ref={ref} className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
      {children}
    </div>
  );
};

export const SelectItem = ({ children, value }: { children: React.ReactNode, value: string }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within a Select');

  return (
    <div
      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => {
        context.onChange(value);
        context.setOpen(false);
      }}
    >
      {children}
    </div>
  );
};