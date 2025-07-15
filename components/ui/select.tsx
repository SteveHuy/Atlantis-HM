"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const BasicSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
BasicSelect.displayName = "BasicSelect";

// Simple implementation for the dropdown select components needed
export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 opacity-50"
      >
        <path
          d="m4.5 6 3 3 3-3"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, children, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("block truncate", className)}
    {...props}
  >
    {children || placeholder}
  </span>
));
SelectValue.displayName = "SelectValue";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 min-w-full mt-1 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-3 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    data-value={value}
    {...props}
  >
    {children}
  </div>
));
SelectItem.displayName = "SelectItem";

// Create a proper Select component that handles the dropdown logic
interface SelectComponentProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const Select: React.FC<SelectComponentProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<string>('');
  const selectRef = React.useRef<HTMLDivElement>(null);
  
  // Extract the SelectTrigger, SelectContent, and other components from children
  const triggerChild = React.Children.toArray(children).find(child => 
    React.isValidElement(child) && child.type === SelectTrigger
  );
  
  const contentChild = React.Children.toArray(children).find(child => 
    React.isValidElement(child) && child.type === SelectContent
  );

  // Find the selected item's label
  React.useEffect(() => {
    if (React.isValidElement(contentChild)) {
      const items = React.Children.toArray(contentChild.props.children);
      const selectedItem = items.find(item => 
        React.isValidElement(item) && item.props.value === value
      );
      if (React.isValidElement(selectedItem)) {
        setSelectedLabel(selectedItem.props.children || '');
      }
    }
  }, [value, contentChild]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
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

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (itemValue: string) => {
    onValueChange(itemValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      {React.isValidElement(triggerChild) && 
        React.cloneElement(triggerChild, {
          onClick: () => setIsOpen(!isOpen),
          'aria-expanded': isOpen,
          'aria-haspopup': 'listbox',
          children: React.Children.map(triggerChild.props.children, child => {
            if (React.isValidElement(child) && child.type === SelectValue) {
              return React.cloneElement(child, {
                children: selectedLabel || child.props.placeholder
              });
            }
            return child;
          })
        })
      }
      
      {isOpen && React.isValidElement(contentChild) && 
        React.cloneElement(contentChild, {
          role: 'listbox',
          children: React.Children.map(contentChild.props.children, child => {
            if (React.isValidElement(child) && child.type === SelectItem) {
              return React.cloneElement(child, {
                onClick: () => handleItemClick(child.props.value),
                role: 'option',
                'aria-selected': value === child.props.value,
                className: cn(
                  child.props.className,
                  value === child.props.value ? 'bg-accent text-accent-foreground' : ''
                )
              });
            }
            return child;
          })
        })
      }
    </div>
  );
};

export { Select, BasicSelect, SelectTrigger, SelectValue, SelectContent, SelectItem };